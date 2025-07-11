from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from database import mongo
from utils.payment_utils import create_payment, verify_payment
from datetime import datetime, timedelta
import math
import uuid
import string
import random

bookings_bp = Blueprint('bookings', __name__)

# Add to bookings.py

def generate_booking_reference():
    """Generate unique booking reference"""
    prefix = "VS"  # VillageStay prefix
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"{prefix}{random_part}"

@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Verify user is a tourist
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if not user or user['user_type'] != 'tourist':
            return jsonify({"error": "Only tourists can create bookings"}), 403
        
        # Required fields
        required_fields = ['listing_id', 'check_in', 'check_out', 'guests']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400
        
        # Validate listing
        listing = mongo.db.listings.find_one({"_id": ObjectId(data['listing_id'])})
        if not listing:
            return jsonify({"error": "Listing not found"}), 404
        
        if not listing['is_active'] or not listing['is_approved']:
            return jsonify({"error": "Listing is not available"}), 400
        
        # Check availability
        if not check_availability(data['listing_id'], data['check_in'], data['check_out']):
            return jsonify({"error": "Listing is not available for selected dates"}), 400
        
        # Validate guests
        if data['guests'] > listing['max_guests']:
            return jsonify({"error": f"Maximum {listing['max_guests']} guests allowed"}), 400
        
        # Calculate dates and pricing
        check_in_date = datetime.strptime(data['check_in'], '%Y-%m-%d')
        check_out_date = datetime.strptime(data['check_out'], '%Y-%m-%d')
        
        if check_in_date >= check_out_date:
            return jsonify({"error": "Check-out date must be after check-in date"}), 400
        
        if check_in_date < datetime.now():
            return jsonify({"error": "Check-in date cannot be in the past"}), 400
        
        nights = (check_out_date - check_in_date).days
        base_amount = listing['price_per_night'] * nights
        
        # Calculate fees
        platform_fee = base_amount * 0.05  # 5% platform fee
        community_contribution = base_amount * 0.02  # 2% community fund
        host_earnings = base_amount - platform_fee - community_contribution
        total_amount = base_amount + platform_fee
        
        # Create booking document
        booking_doc = {
            "listing_id": ObjectId(data['listing_id']),
            "tourist_id": ObjectId(user_id),
            "host_id": listing['host_id'],
            "check_in": check_in_date,
            "check_out": check_out_date,
            "guests": data['guests'],
            "nights": nights,
            "base_amount": base_amount,
            "platform_fee": platform_fee,
            "community_contribution": community_contribution,
            "host_earnings": host_earnings,
            "total_amount": total_amount,
            "special_requests": data.get('special_requests', ''),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "status": "pending",
            "payment_status": "unpaid",
            "payment_id": None,
            "booking_reference": generate_booking_reference()
        }
        
        # Insert booking
        result = mongo.db.bookings.insert_one(booking_doc)
        
        # Create payment
        payment_data = create_payment(
            total_amount,
            f"Booking for {listing['title']}",
            str(result.inserted_id)
        )
        
        # Update booking with payment ID
        mongo.db.bookings.update_one(
            {"_id": result.inserted_id},
            {"$set": {"payment_id": payment_data['payment_id']}}
        )
        
        return jsonify({
            "message": "Booking created successfully",
            "booking_id": str(result.inserted_id),
            "booking_reference": booking_doc['booking_reference'],
            "payment_data": payment_data,
            "booking_details": {
                "listing_title": listing['title'],
                "check_in": data['check_in'],
                "check_out": data['check_out'],
                "guests": data['guests'],
                "nights": nights,
                "total_amount": total_amount
            }
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bookings_bp.route('/<booking_id>/payment', methods=['POST'])
@jwt_required()
def complete_payment(booking_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Verify booking ownership
        booking = mongo.db.bookings.find_one({"_id": ObjectId(booking_id)})
        if not booking:
            return jsonify({"error": "Booking not found"}), 404
        
        if str(booking['tourist_id']) != user_id:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Verify payment
        payment_verification = verify_payment(
            booking['payment_id'],
            data.get('payment_signature'),
            data.get('payment_method')
        )
        
        if not payment_verification['success']:
            return jsonify({"error": "Payment verification failed"}), 400
        
        # Update booking status
        mongo.db.bookings.update_one(
            {"_id": ObjectId(booking_id)},
            {
                "$set": {
                    "payment_status": "paid",
                    "status": "confirmed",
                    "payment_completed_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Block dates in listing availability
        block_dates(booking['listing_id'], booking['check_in'], booking['check_out'])
        
        # Send confirmation notifications (implement as needed)
        # send_booking_confirmation(booking)
        
        return jsonify({
            "message": "Payment completed successfully",
            "booking_status": "confirmed"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bookings_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_bookings():
    try:
        user_id = get_jwt_identity()
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        status = request.args.get('status')
        
        # Build query based on user type
        if user['user_type'] == 'tourist':
            query = {"tourist_id": ObjectId(user_id)}
        elif user['user_type'] == 'host':
            query = {"host_id": ObjectId(user_id)}
        else:
            return jsonify({"error": "Invalid user type"}), 400
        
        # Add status filter if provided
        if status:
            query["status"] = status
        
        # Execute query
        skip = (page - 1) * limit
        
        bookings = list(mongo.db.bookings.find(query)
                       .sort("created_at", -1)
                       .skip(skip)
                       .limit(limit))
        
        # Get total count
        total_count = mongo.db.bookings.count_documents(query)
        
        # Format bookings
        formatted_bookings = []
        for booking in bookings:
            # Get listing info
            listing = mongo.db.listings.find_one({"_id": booking['listing_id']})
            
            # Get tourist info
            tourist = mongo.db.users.find_one({"_id": booking['tourist_id']})
            
            # Get host info
            host = mongo.db.users.find_one({"_id": booking['host_id']})
            
            formatted_booking = {
                "id": str(booking['_id']),
                "booking_reference": booking['booking_reference'],
                "check_in": booking['check_in'].strftime('%Y-%m-%d'),
                "check_out": booking['check_out'].strftime('%Y-%m-%d'),
                "guests": booking['guests'],
                "nights": booking['nights'],
                "total_amount": booking['total_amount'],
                "status": booking['status'],
                "payment_status": booking['payment_status'],
                "special_requests": booking.get('special_requests', ''),
                "listing": {
                    "id": str(listing['_id']),
                    "title": listing['title'],
                    "location": listing['location'],
                    "images": listing['images'][:1] if listing['images'] else []
                } if listing else None,
                "tourist": {
                    "id": str(tourist['_id']),
                    "full_name": tourist['full_name'],
                    "email": tourist['email'],
                    "phone": tourist.get('phone')
                } if tourist else None,
                "host": {
                    "id": str(host['_id']),
                    "full_name": host['full_name'],
                    "email": host['email'],
                    "phone": host.get('phone')
                } if host else None,
                "created_at": booking['created_at'].isoformat()
            }
            
            formatted_bookings.append(formatted_booking)
        
        return jsonify({
            "bookings": formatted_bookings,
            "pagination": {
                "page": page,
                "limit": limit,
                "total_count": total_count,
                "total_pages": math.ceil(total_count / limit)
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bookings_bp.route('/<booking_id>', methods=['GET'])
@jwt_required()
def get_booking(booking_id):
    try:
        user_id = get_jwt_identity()
        
        # Get booking
        booking = mongo.db.bookings.find_one({"_id": ObjectId(booking_id)})
        if not booking:
            return jsonify({"error": "Booking not found"}), 404
        
        # Verify access
        if str(booking['tourist_id']) != user_id and str(booking['host_id']) != user_id:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get related data
        listing = mongo.db.listings.find_one({"_id": booking['listing_id']})
        tourist = mongo.db.users.find_one({"_id": booking['tourist_id']})
        host = mongo.db.users.find_one({"_id": booking['host_id']})
        
        formatted_booking = {
            "id": str(booking['_id']),
            "booking_reference": booking['booking_reference'],
            "check_in": booking['check_in'].strftime('%Y-%m-%d'),
            "check_out": booking['check_out'].strftime('%Y-%m-%d'),
            "guests": booking['guests'],
            "nights": booking['nights'],
            "base_amount": booking['base_amount'],
            "platform_fee": booking['platform_fee'],
            "community_contribution": booking['community_contribution'],
            "total_amount": booking['total_amount'],
            "status": booking['status'],
            "payment_status": booking['payment_status'],
            "special_requests": booking.get('special_requests', ''),
            "listing": {
                "id": str(listing['_id']),
                "title": listing['title'],
                "description": listing['description'],
                "location": listing['location'],
                "images": listing['images'],
                "amenities": listing['amenities'],
                "house_rules": listing.get('house_rules', []),
                "coordinates": listing['coordinates']
            } if listing else None,
            "tourist": {
                "id": str(tourist['_id']),
                "full_name": tourist['full_name'],
                "email": tourist['email'],
                "phone": tourist.get('phone')
            } if tourist else None,
            "host": {
                "id": str(host['_id']),
                "full_name": host['full_name'],
                "email": host['email'],
                "phone": host.get('phone')
            } if host else None,
            "created_at": booking['created_at'].isoformat(),
            "updated_at": booking['updated_at'].isoformat()
        }
        
        return jsonify(formatted_booking), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bookings_bp.route('/<booking_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_booking(booking_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Get booking
        booking = mongo.db.bookings.find_one({"_id": ObjectId(booking_id)})
        if not booking:
            return jsonify({"error": "Booking not found"}), 404
        
        # Verify access (tourist or host can cancel)
        if str(booking['tourist_id']) != user_id and str(booking['host_id']) != user_id:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Check if booking can be cancelled
        if booking['status'] in ['cancelled', 'completed']:
            return jsonify({"error": "Booking cannot be cancelled"}), 400
        
        # Calculate refund amount based on cancellation policy
        refund_amount = calculate_refund_amount(booking, datetime.utcnow())
        
        # Update booking status
        mongo.db.bookings.update_one(
            {"_id": ObjectId(booking_id)},
            {
                "$set": {
                    "status": "cancelled",
                    "cancelled_at": datetime.utcnow(),
                    "cancelled_by": user_id,
                    "cancellation_reason": data.get('reason', ''),
                    "refund_amount": refund_amount,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Free up dates in listing availability
        free_dates(booking['listing_id'], booking['check_in'], booking['check_out'])
        
        # Process refund if applicable
        if refund_amount > 0:
            # process_refund(booking['payment_id'], refund_amount)
            pass
        
        return jsonify({
            "message": "Booking cancelled successfully",
            "refund_amount": refund_amount
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bookings_bp.route('/<booking_id>/complete', methods=['POST'])
@jwt_required()
def complete_booking(booking_id):
    try:
        user_id = get_jwt_identity()
        
        # Get booking
        booking = mongo.db.bookings.find_one({"_id": ObjectId(booking_id)})
        if not booking:
            return jsonify({"error": "Booking not found"}), 404
        
        # Verify host access
        if str(booking['host_id']) != user_id:
            return jsonify({"error": "Only host can complete booking"}), 403
        
        # Check if booking can be completed
        if booking['status'] != 'confirmed':
            return jsonify({"error": "Booking is not confirmed"}), 400
        
        # Check if check-out date has passed
        if booking['check_out'] > datetime.utcnow():
            return jsonify({"error": "Cannot complete booking before check-out date"}), 400
        
        # Update booking status
        mongo.db.bookings.update_one(
            {"_id": ObjectId(booking_id)},
            {
                "$set": {
                    "status": "completed",
                    "completed_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Release host earnings
        # release_host_earnings(booking['host_id'], booking['host_earnings'])
        
        return jsonify({"message": "Booking completed successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def generate_booking_reference():
    """Generate unique booking reference"""
    import random
    import string
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def block_dates(listing_id, check_in, check_out):
    """Block dates in listing availability calendar"""
    listing = mongo.db.listings.find_one({"_id": ObjectId(listing_id)})
    if not listing:
        return
    
    availability_calendar = listing.get('availability_calendar', {})
    
    current_date = check_in
    while current_date < check_out:
        date_str = current_date.strftime('%Y-%m-%d')
        availability_calendar[date_str] = False
        current_date += timedelta(days=1)
    
    mongo.db.listings.update_one(
        {"_id": ObjectId(listing_id)},
        {"$set": {"availability_calendar": availability_calendar}}
    )

def free_dates(listing_id, check_in, check_out):
    """Free up dates in listing availability calendar"""
    listing = mongo.db.listings.find_one({"_id": ObjectId(listing_id)})
    if not listing:
        return
    
    availability_calendar = listing.get('availability_calendar', {})
    
    current_date = check_in
    while current_date < check_out:
        date_str = current_date.strftime('%Y-%m-%d')
        if date_str in availability_calendar:
            del availability_calendar[date_str]
        current_date += timedelta(days=1)
    
    mongo.db.listings.update_one(
        {"_id": ObjectId(listing_id)},
        {"$set": {"availability_calendar": availability_calendar}}
    )

def calculate_refund_amount(booking, cancellation_date):
    """Calculate refund amount based on cancellation policy"""
    days_until_checkin = (booking['check_in'] - cancellation_date).days
    
    if days_until_checkin >= 7:
        return booking['total_amount']  # Full refund
    elif days_until_checkin >= 3:
        return booking['total_amount'] * 0.5  # 50% refund
    else:
        return 0  # No refund

def check_availability(listing_id, check_in, check_out):
    """Check if listing is available for given dates"""
    try:
        # Convert dates to datetime objects
        check_in_date = datetime.strptime(check_in, '%Y-%m-%d')
        check_out_date = datetime.strptime(check_out, '%Y-%m-%d')
        
        # Check for existing bookings
        existing_bookings = mongo.db.bookings.find({
            "listing_id": ObjectId(listing_id),
            "status": {"$in": ["confirmed", "pending"]},
            "$or": [
                {"check_in": {"$lte": check_in_date}, "check_out": {"$gt": check_in_date}},
                {"check_in": {"$lt": check_out_date}, "check_out": {"$gte": check_out_date}},
                {"check_in": {"$gte": check_in_date}, "check_out": {"$lte": check_out_date}}
            ]
        })
        
        if existing_bookings.count() > 0:
            return False
        
        return True
        
    except Exception as e:
        return False