from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import mongo
from utils.ai_utils import (
    generate_village_story_video, 
    voice_to_listing_magic, 
    cultural_concierge_chat,
    call_gemini_with_image,
    call_gemini_api
)
from datetime import datetime
from bson import ObjectId
import base64
import json
import uuid

ai_features_bp = Blueprint('ai_features', __name__)

# ============ FEATURE 1: AI VILLAGE STORY GENERATOR ============

@ai_features_bp.route('/generate-village-story', methods=['POST'])
@jwt_required()
def generate_village_story():
   try:
       user_id = get_jwt_identity()
       data = request.get_json()
       
       # Verify user is a host
       user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
       if not user or user['user_type'] != 'host':
           return jsonify({"error": "Only hosts can generate village stories"}), 403
       
       listing_id = data.get('listing_id')
       images = data.get('images', [])  # Array of image URLs or base64
       
       if not listing_id:
           return jsonify({"error": "Listing ID is required"}), 400
       
       # Get listing details
       listing = mongo.db.listings.find_one({"_id": ObjectId(listing_id)})
       if not listing:
           return jsonify({"error": "Listing not found"}), 404
       
       if str(listing['host_id']) != user_id:
           return jsonify({"error": "Unauthorized to generate story for this listing"}), 403
       
       # Host information
       host_info = {
           "full_name": user['full_name'],
           "location": user.get('address', listing['location'])
       }
       
       # Generate village story video
       story_result = generate_village_story_video(images, listing, host_info)
       
       # Save generation record
       generation_record = {
           "listing_id": ObjectId(listing_id),
           "host_id": ObjectId(user_id),
           "video_data": story_result,
           "images_used": len(images),
           "created_at": datetime.utcnow(),
           "generation_type": "village_story"
       }
       
       mongo.db.ai_generations.insert_one(generation_record)
       
       return jsonify({
           "message": "Village story video generated successfully",
           "video_data": story_result,
           "generation_id": str(generation_record["_id"]) if "_id" in generation_record else None
       }), 200
       
   except Exception as e:
       return jsonify({"error": str(e)}), 500

@ai_features_bp.route('/village-story-status/<generation_id>', methods=['GET'])
@jwt_required()
def get_village_story_status(generation_id):
   try:
       user_id = get_jwt_identity()
       
       # Get generation record
       generation = mongo.db.ai_generations.find_one({
           "_id": ObjectId(generation_id),
           "host_id": ObjectId(user_id)
       })
       
       if not generation:
           return jsonify({"error": "Generation not found"}), 404
       
       # Mock status update (in production, check actual video generation status)
       status = "completed" if generation['created_at'] < datetime.utcnow() else "processing"
       
       return jsonify({
           "generation_id": generation_id,
           "status": status,
           "video_data": generation['video_data'],
           "created_at": generation['created_at'].isoformat(),
           "progress": 100 if status == "completed" else 75
       }), 200
       
   except Exception as e:
       return jsonify({"error": str(e)}), 500

# ============ FEATURE 2: VOICE-TO-LISTING MAGIC ============


@ai_features_bp.route('/voice-to-listing', methods=['POST'])
@jwt_required()
def voice_to_listing():
    try:
        user_id = get_jwt_identity()
        
        # Verify user is a host
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if not user or user['user_type'] != 'host':
            return jsonify({"error": "Only hosts can use voice-to-listing"}), 403
        
        # Handle both JSON and form data
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Handle form data with file upload
            language = request.form.get('language', 'hi')
            audio_file = request.files.get('audio_data')
            
            if audio_file:
                # Read audio file content
                audio_data = audio_file.read()
                # Convert to base64 for processing
                audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            else:
                return jsonify({"error": "No audio file provided"}), 400
        else:
            # Handle JSON data
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400
                
            language = data.get('language', 'hi')
            audio_data = data.get('audio_data')
            
            if not audio_data:
                return jsonify({"error": "Audio data is required"}), 400
            
            # Handle base64 audio data
            if audio_data.startswith('data:audio'):
                # Remove data URL prefix
                audio_base64 = audio_data.split(',')[1]
            else:
                audio_base64 = audio_data
        
        print(f"Processing voice input in language: {language}")
        
        # Process voice to listing
        listing_result = voice_to_listing_magic(audio_base64, language, user_id)
        
        # Save the voice processing record
        voice_record = {
            "host_id": ObjectId(user_id),
            "original_language": language,
            "processing_result": listing_result,
            "created_at": datetime.utcnow(),
            "processing_type": "voice_to_listing"
        }
        
        result = mongo.db.voice_generations.insert_one(voice_record)
        
        # Add processing_id to the result
        listing_result['processing_id'] = str(result.inserted_id)
        
        return jsonify({
            "message": "Voice successfully converted to listing",
            "result": listing_result,
            "processing_id": str(result.inserted_id)
        }), 200
        
    except Exception as e:
        print(f"Voice processing error: {str(e)}")
        return jsonify({"error": f"Voice processing failed: {str(e)}"}), 500

# Also update the voice_to_listing_magic function:
def voice_to_listing_magic(audio_data, language="hi", host_id=None):
    """Convert voice recording to professional listing"""
    
    try:
        # Step 1: Convert speech to text (enhanced mock implementation)
        transcribed_text = transcribe_audio_enhanced(audio_data, language)
        
        # Step 2: Enhance with Gemini AI
        enhancement_prompt = f"""
        A host has described their property in {language}. Create a professional listing:
        
        Original Description: "{transcribed_text}"
        
        Generate a comprehensive listing with:
        1. Catchy title (5-8 words)
        2. Professional description (150-200 words) highlighting authentic rural experience
        3. List of amenities (based on description + typical for this property type)
        4. Property type (homestay, farmstay, village house, eco-lodge)
        5. Suggested pricing range per night
        6. House rules (3-4 culturally appropriate rules)
        7. Unique selling points
        8. Sustainability features mentioned or implied
        
        Maintain cultural authenticity and local charm. Format as JSON.
        """
        
        try:
            enhanced_content = call_gemini_api(enhancement_prompt)
            listing_data = json.loads(enhanced_content)
        except:
            # Fallback structure if JSON parsing fails
            listing_data = {
                "title": "Authentic Rural Experience",
                "description": transcribed_text,
                "amenities": ["Home-cooked meals", "Local guide", "Wi-Fi"],
                "property_type": "homestay",
                "pricing_suggestion": "₹1500-2500",
                "house_rules": ["Respect local customs", "No smoking indoors"],
                "unique_features": ["Traditional architecture", "Organic farming"],
                "sustainability_features": ["Local sourcing", "Traditional cooking"]
            }
        
        # Step 3: Generate pricing intelligence
        pricing_intel = generate_smart_pricing(listing_data, language)
        
        # Step 4: Create multi-language versions
        translations = create_multilingual_listing(listing_data, language)
        
        return {
            "original_audio_language": language,
            "transcribed_text": transcribed_text,
            "enhanced_listing": listing_data,
            "pricing_intelligence": pricing_intel,
            "translations": translations,
            "processing_status": "completed",
            "confidence_score": 0.95
        }
        
    except Exception as e:
        print(f"Voice processing error: {str(e)}")
        return {
            "error": str(e),
            "processing_status": "failed"
        }

def transcribe_audio_enhanced(audio_data, language):
    """Enhanced audio transcription with better mock data"""
    
    # Enhanced mock transcriptions for demo
    mock_transcriptions = {
        "hi": "मेरा घर गांव में है। यहाँ बहुत शांति है। हमारे पास बड़ा बगीचा है और गाय हैं। मैं अच्छा देसी खाना बनाती हूँ। पारंपरिक घर है पुराना। शहर से लोग आकर आराम कर सकते हैं और गांव की जिंदगी देख सकते हैं।",
        "en": "My house is in a peaceful village. We have a large garden and cows. I cook authentic local food. It's a traditional old house. People from the city can come and relax and experience village life.",
        "gu": "મારું ઘર ગામમાં છે. અહીં ખૂબ શાંતિ છે. અમારી પાસે મોટો બગીચો અને ગાયો છે. હું સારું દેશી ખાવાનું બનાવું છું.",
        "te": "మా ఇల్లు గ్రామంలో ఉంది. ఇక్కడ చాలా శాంతిగా ఉంది. మా దగ్గర పెద్ద తోట, ఆవులు ఉన్నాయి. నేను మంచి స్థానిక అన్నం వండతాను."
    }
    
    # Select based on language or default to Hindi
    transcribed = mock_transcriptions.get(language, mock_transcriptions["hi"])
    
    print(f"🎤 Transcribing audio in {language}")
    print(f"📝 Transcribed: {transcribed}")
    
    return transcribed


@ai_features_bp.route('/create-listing-from-voice', methods=['POST'])
@jwt_required()
def create_listing_from_voice():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Verify user is a host
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if not user or user['user_type'] != 'host':
            return jsonify({"error": "Only hosts can create listings"}), 403
        
        processing_id = data.get('processing_id')
        selected_language = data.get('selected_language', 'en')
        custom_edits = data.get('custom_edits', {})
        
        if not processing_id:
            return jsonify({"error": "Processing ID is required"}), 400
        
        # Get voice processing result
        voice_record = mongo.db.voice_generations.find_one({
            "_id": ObjectId(processing_id),
            "host_id": ObjectId(user_id)
        })
        
        if not voice_record:
            return jsonify({"error": "Voice processing record not found"}), 404
        
        # Get the enhanced listing data
        processing_result = voice_record['processing_result']
        
        if 'error' in processing_result:
            return jsonify({"error": "Voice processing failed"}), 400
        
        listing_data = processing_result.get('enhanced_listing', {})
        translations = processing_result.get('translations', {})
        
        # Use selected language version or default
        final_listing = translations.get(selected_language, listing_data)
        
        # Apply custom edits
        for key, value in custom_edits.items():
            if key in ['title', 'description', 'property_type', 'price_per_night', 'max_guests']:
                final_listing[key] = value
        
        # Extract price from pricing suggestion if available
        pricing_intel = processing_result.get('pricing_intelligence', {})
        suggested_price = pricing_intel.get('base_price_per_night', 2000)
        
        # Create the actual listing
        listing_doc = {
            "host_id": ObjectId(user_id),
            "title": final_listing.get('title', 'Rural Village Experience'),
            "description": final_listing.get('description', 'Authentic rural stay experience'),
            "location": user.get('address', 'Rural India'),
            "price_per_night": custom_edits.get('price_per_night', suggested_price),
            "property_type": final_listing.get('property_type', 'homestay'),
            "amenities": final_listing.get('amenities', ['Home-cooked meals', 'Local guide']),
            "images": [],  # Will be added later
            "coordinates": {"lat": 0, "lng": 0},  # Will be geocoded later
            "max_guests": custom_edits.get('max_guests', final_listing.get('max_guests', 4)),
            "house_rules": final_listing.get('house_rules', []),
            "sustainability_features": final_listing.get('sustainability_features', []),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
            "is_approved": False,  # Needs admin approval
            "rating": 0.0,
            "review_count": 0,
            "availability_calendar": {},
            "ai_generated": True,
            "voice_generated": True,
            "original_voice_language": voice_record['original_language']
        }
        
        # Insert listing
        result = mongo.db.listings.insert_one(listing_doc)
        
        return jsonify({
            "message": "Listing created successfully from voice",
            "listing_id": str(result.inserted_id),
            "listing_data": {
                "title": listing_doc['title'],
                "description": listing_doc['description'],
                "price_per_night": listing_doc['price_per_night'],
                "property_type": listing_doc['property_type']
            }
        }), 201
        
    except Exception as e:
        print(f"Create listing error: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ============ FEATURE 3: AI CULTURAL CONCIERGE ============

@ai_features_bp.route('/cultural-concierge', methods=['POST'])
@jwt_required()
def cultural_concierge():
   try:
       user_id = get_jwt_identity()
       data = request.get_json()
       
       user_message = data.get('message', '')
       session_id = data.get('session_id')
       
       if not user_message:
           return jsonify({"error": "Message is required"}), 400
       
       # Get user preferences
       user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
       user_preferences = {
           "budget_range": data.get('budget_range', 'medium'),
           "location": user.get('address', 'India'),
           "language": user.get('preferred_language', 'en'),
           "interests": data.get('interests', []),
           "travel_style": data.get('travel_style', 'cultural'),
           "group_size": data.get('group_size', 2)
       }
       
       # Get conversation history
       conversation_history = []
       if session_id:
           history_records = list(mongo.db.concierge_conversations.find({
               "session_id": session_id,
               "user_id": ObjectId(user_id)
           }).sort("created_at", -1).limit(10))
           
           conversation_history = [record['message'] for record in history_records]
       
       # Get AI response
       concierge_response = cultural_concierge_chat(
           user_message, user_preferences, conversation_history
       )
       
       # Save conversation
       conversation_record = {
           "user_id": ObjectId(user_id),
           "session_id": session_id or concierge_response['conversation_id'],
           "message": user_message,
           "response": concierge_response['response'],
           "actionable_items": concierge_response['actionable_items'],
           "cultural_insights": concierge_response['cultural_insights'],
           "relevant_listings": concierge_response['relevant_listings'],
           "created_at": datetime.utcnow()
       }
       
       mongo.db.concierge_conversations.insert_one(conversation_record)
       
       return jsonify({
           "response": concierge_response['response'],
           "session_id": conversation_record['session_id'],
           "actionable_items": concierge_response['actionable_items'],
           "cultural_insights": concierge_response['cultural_insights'],
           "relevant_listings": concierge_response['relevant_listings'],
           "suggested_experiences": concierge_response['suggested_experiences'],
           "local_events": concierge_response['local_events']
       }), 200
       
   except Exception as e:
       return jsonify({"error": str(e)}), 500

@ai_features_bp.route('/cultural-concierge/history', methods=['GET'])
@jwt_required()
def get_concierge_history():
   try:
       user_id = get_jwt_identity()
       session_id = request.args.get('session_id')
       
       # Build query
       query = {"user_id": ObjectId(user_id)}
       if session_id:
           query["session_id"] = session_id
       
       # Get conversation history
       conversations = list(mongo.db.concierge_conversations.find(query)
                          .sort("created_at", 1)
                          .limit(50))
       
       # Format conversations
       formatted_conversations = []
       for conv in conversations:
           formatted_conv = {
               "id": str(conv['_id']),
               "message": conv['message'],
               "response": conv['response'],
               "session_id": conv['session_id'],
               "created_at": conv['created_at'].isoformat(),
               "actionable_items": conv.get('actionable_items', [])
           }
           formatted_conversations.append(formatted_conv)
       
       return jsonify({
           "conversations": formatted_conversations,
           "session_id": session_id
       }), 200
       
   except Exception as e:
       return jsonify({"error": str(e)}), 500

@ai_features_bp.route('/cultural-insights/<location>', methods=['GET'])
def get_location_cultural_insights(location):
   try:
       # Get cultural insights for a specific location
       insights_prompt = f"""
       Provide comprehensive cultural insights for travelers visiting {location} in rural India:
       
       Include:
       1. Local customs and traditions
       2. Festival calendar and important dates
       3. Traditional food and dining etiquette
       4. Dress code and behavioral guidelines
       5. Language basics and common phrases
       6. Religious and spiritual practices
       7. Local crafts and art forms
       8. Best time to visit and weather considerations
       
       Format as JSON with organized sections.
       """
       
       from utils.ai_utils import call_gemini_api
       insights_response = call_gemini_api(insights_prompt)
       
       try:
           cultural_data = json.loads(insights_response)
       except:
           cultural_data = {
               "location": location,
               "customs": ["Respect local traditions", "Greet with Namaste"],
               "festivals": ["Harvest festivals in spring", "Local deity celebrations"],
               "food_etiquette": ["Eat with right hand", "Try local specialties"],
               "dress_code": ["Modest clothing", "Remove shoes in homes"],
               "language": ["Learn basic greetings", "Hindi is widely understood"],
               "spirituality": ["Visit local temples", "Participate respectfully"],
               "crafts": ["Traditional weaving", "Pottery making"],
               "best_time": "October to March for pleasant weather"
           }
       
       return jsonify({
           "location": location,
           "cultural_insights": cultural_data,
           "generated_at": datetime.utcnow().isoformat()
       }), 200
       
   except Exception as e:
       return jsonify({"error": str(e)}), 500

# ============ HELPER FUNCTIONS ============

def extract_price_from_suggestion(pricing_intelligence):
   """Extract price from pricing intelligence data"""
   
   try:
       if isinstance(pricing_intelligence, dict):
           return pricing_intelligence.get('base_price_per_night', 1800)
       return 1800
   except:
       return 1800

# ============ AI IMAGE ANALYSIS ROUTES ============

@ai_features_bp.route('/analyze-property-images', methods=['POST'])
@jwt_required()
def analyze_property_images():
   try:
       user_id = get_jwt_identity()
       data = request.get_json()
       
       # Verify user is a host
       user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
       if not user or user['user_type'] != 'host':
           return jsonify({"error": "Only hosts can analyze property images"}), 403
       
       images = data.get('images', [])  # Array of base64 images
       
       if not images:
           return jsonify({"error": "Images are required"}), 400
       
       analysis_results = []
       
       for i, image_data in enumerate(images[:5]):  # Limit to 5 images
           analysis_prompt = f"""
           Analyze this rural property image and provide:
           
           1. Property assessment (cleanliness, condition, appeal)
           2. Suggested improvements for better guest appeal
           3. Safety features visible
           4. Unique selling points to highlight
           5. Photography tips for better shots
           6. Authenticity score (how authentic rural experience it represents)
           
           Rate each aspect from 1-10 and provide specific actionable feedback.
           Format as JSON.
           """
           
           try:
               analysis = call_gemini_with_image(analysis_prompt, image_data)
               analysis_results.append({
                   "image_index": i,
                   "analysis": analysis,
                   "processed_at": datetime.utcnow().isoformat()
               })
           except Exception as e:
               analysis_results.append({
                   "image_index": i,
                   "error": str(e),
                   "processed_at": datetime.utcnow().isoformat()
               })
       
       return jsonify({
           "message": "Property images analyzed successfully",
           "analysis_results": analysis_results,
           "total_images_processed": len(analysis_results)
       }), 200
       
   except Exception as e:
       return jsonify({"error": str(e)}), 500

@ai_features_bp.route('/generate-listing-photos', methods=['POST'])
@jwt_required()
def generate_listing_photos():
   try:
       user_id = get_jwt_identity()
       data = request.get_json()
       
       # Verify user is a host
       user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
       if not user or user['user_type'] != 'host':
           return jsonify({"error": "Only hosts can generate listing photos"}), 403
       
       listing_id = data.get('listing_id')
       photo_types = data.get('photo_types', ['exterior', 'interior', 'dining', 'surroundings'])
       
       if not listing_id:
           return jsonify({"error": "Listing ID is required"}), 400
       
       # Get listing details
       listing = mongo.db.listings.find_one({"_id": ObjectId(listing_id)})
       if not listing:
           return jsonify({"error": "Listing not found"}), 404
       
       if str(listing['host_id']) != user_id:
           return jsonify({"error": "Unauthorized"}), 403
       
       # Generate photo prompts for each type
       generated_photos = []
       
       for photo_type in photo_types:
           prompt = create_photo_generation_prompt(listing, photo_type)
           
           # Mock photo generation (replace with actual AI image generation)
           generated_photo = {
               "type": photo_type,
               "prompt": prompt,
               "generated_url": f"https://ai-generated-images.com/{photo_type}_{listing_id}.jpg",
               "status": "generated",
               "created_at": datetime.utcnow().isoformat()
           }
           
           generated_photos.append(generated_photo)
       
       return jsonify({
           "message": "Listing photos generated successfully",
           "generated_photos": generated_photos,
           "listing_title": listing['title']
       }), 200
       
   except Exception as e:
       return jsonify({"error": str(e)}), 500

def create_photo_generation_prompt(listing, photo_type):
   """Create specific prompts for different photo types"""
   
   base_info = f"Rural {listing['property_type']} in {listing['location']}, India"
   
   prompts = {
       "exterior": f"Beautiful exterior view of {base_info}, traditional architecture, surrounded by nature, golden hour lighting, authentic rural setting",
       "interior": f"Cozy interior of {base_info}, traditional furniture, clean and welcoming, warm lighting, cultural decorations",
       "dining": f"Traditional dining area in {base_info}, local food setup, copper utensils, floor seating or simple wooden table",
       "surroundings": f"Scenic surroundings of {base_info}, village landscape, fields, trees, peaceful rural environment",
       "activity": f"Cultural activity near {base_info}, local people engaged in traditional work, authentic village life"
   }
   
   return prompts.get(photo_type, f"Authentic rural property image of {base_info}")

# ============ DEMO AND TEST ROUTES ============

@ai_features_bp.route('/demo/voice-transcription', methods=['POST'])
def demo_voice_transcription():
   """Demo endpoint for voice transcription testing"""
   try:
       data = request.get_json()
       
       language = data.get('language', 'hi')
       mock_text = data.get('mock_text', '')
       
       # If mock text provided, use it; otherwise use demo text
       if not mock_text:
           demo_texts = {
               'hi': 'मेरा घर गांव में है। यहाँ बहुत शांति है। हमारे पास गाय हैं, खेत हैं।',
               'en': 'My house is in the village. It is very peaceful here. We have cows and fields.',
               'gu': 'મારું ઘર ગામમાં છે. અહીં ખૂબ શાંતિ છે.',
               'te': 'మా ఇల్లు గ్రామంలో ఉంది. ఇక్కడ చాలా శాంతిగా ఉంది.'
           }
           transcribed_text = demo_texts.get(language, demo_texts['en'])
       else:
           transcribed_text = mock_text
       
       return jsonify({
           "transcribed_text": transcribed_text,
           "language": language,
           "confidence": 0.95,
           "demo_mode": True
       }), 200
       
   except Exception as e:
       return jsonify({"error": str(e)}), 500

@ai_features_bp.route('/demo/cultural-chat', methods=['POST'])
def demo_cultural_chat():
   """Demo endpoint for cultural concierge testing"""
   try:
       data = request.get_json()
       
       user_message = data.get('message', '')
       
       # Demo responses for common queries
       demo_responses = {
           "spiritual": "For a spiritual experience, I recommend visiting the ashrams near Rishikesh or the peaceful villages in Uttarakhand hills. You can participate in morning yoga sessions, evening aartis by the Ganges, and experience simple village life. Budget around ₹1500-2000 per day including stay and meals.",
           "cultural": "For authentic cultural experiences, consider visiting rural Rajasthan where you can stay in traditional havelis, learn pottery from local artisans, and participate in folk dance evenings. The village of Hodka in Kutch offers incredible cultural immersion with local families.",
           "food": "For food experiences, rural Punjab and Haryana offer incredible farm-to-table experiences. You can learn traditional cooking methods, participate in wheat harvesting, and enjoy authentic dal-baati-churma cooked on wood fires.",
           "default": "I'd love to help you discover authentic rural India! Could you tell me what type of experience interests you - spiritual retreats, cultural immersion, culinary adventures, or nature experiences?"
       }
       
       # Simple keyword matching for demo
       response_key = "default"
       for key in demo_responses.keys():
           if key in user_message.lower():
               response_key = key
               break
       
       response = demo_responses[response_key]
       
       return jsonify({
           "response": response,
           "actionable_items": [
               {"type": "search", "action": "Find Listings", "description": "Search for recommended stays"},
               {"type": "experiences", "action": "Browse Experiences", "description": "Explore local activities"}
           ],
           "cultural_insights": [
               {"insight": "Always remove shoes before entering homes", "importance": "high"},
               {"insight": "Greet elders with respect", "importance": "medium"}
           ],
           "demo_mode": True
       }), 200
       
   except Exception as e:
       return jsonify({"error": str(e)}), 500