import io
import base64
import tempfile
import os
from google.cloud import speech
from pydub import AudioSegment
from config import Config
import json

# Initialize Google Speech client
speech_client = None
try:
    if Config.GOOGLE_APPLICATION_CREDENTIALS and Config.GOOGLE_CLOUD_PROJECT_ID:
        speech_client = speech.SpeechClient()
        print("✅ Google Speech-to-Text client initialized successfully")
    else:
        print("❌ Google Cloud credentials not configured")
        print(f"Project ID: {Config.GOOGLE_CLOUD_PROJECT_ID}")
        print(f"Credentials path: {Config.GOOGLE_APPLICATION_CREDENTIALS}")
except Exception as e:
    print(f"❌ Failed to initialize Google Speech client: {e}")

def transcribe_audio_google_speech(audio_data, language="auto"):
    """
    Transcribe audio using Google Cloud Speech-to-Text API
    """
    
    if not speech_client:
        raise Exception("Google Speech-to-Text client not initialized. Check credentials.")
    
    try:
        print(f"🎵 Starting Google Speech-to-Text transcription for language: {language}")
        
        # Decode base64 audio data if needed
        if isinstance(audio_data, str):
            try:
                audio_bytes = base64.b64decode(audio_data)
                print(f"🔄 Decoded base64 audio: {len(audio_bytes)} bytes")
            except Exception as decode_error:
                raise Exception(f"Failed to decode base64 audio: {decode_error}")
        else:
            audio_bytes = audio_data
        
        print(f"🎵 Processing {len(audio_bytes)} bytes of audio data")
        
        # Convert audio to proper format for Google Speech API
        audio_content = convert_audio_for_google_speech(audio_bytes)
        
        # Map language codes for Google Speech API
        google_language = get_google_language_code(language)
        print(f"🌍 Mapped language {language} to Google code: {google_language}")
        
        # Configure recognition
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code=google_language,
            enable_automatic_punctuation=True,
            enable_word_confidence=True,
            model="latest_long",  # Use latest model for better accuracy
        )
        
        # Create audio object
        audio = speech.RecognitionAudio(content=audio_content)
        
        print(f"🎤 Calling Google Speech-to-Text API")
        print(f"🌍 Language: {google_language}")
        print(f"📁 Audio size: {len(audio_content)} bytes")
        
        # Perform the transcription
        response = speech_client.recognize(config=config, audio=audio)
        
        if not response.results:
            raise Exception("Google Speech API returned no transcription results")
        
        # Extract the transcription
        transcribed_text = ""
        confidence_scores = []
        
        for result in response.results:
            if result.alternatives:
                alternative = result.alternatives[0]
                transcribed_text += alternative.transcript + " "
                confidence_scores.append(alternative.confidence)
        
        transcribed_text = transcribed_text.strip()
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.0
        
        print(f"✅ Google Speech transcription successful!")
        print(f"📝 Result: {transcribed_text}")
        print(f"🎯 Confidence: {avg_confidence:.2f}")
        
        # Verify we got actual transcription
        if not transcribed_text or len(transcribed_text.strip()) == 0:
            raise Exception("Google Speech API returned empty transcription")
        
        return {
            "text": transcribed_text,
            "language": language,
            "confidence": avg_confidence
        }
        
    except Exception as e:
        print(f"❌ Google Speech transcription error: {e}")
        raise Exception(f"Google Speech transcription failed: {str(e)}")

def convert_audio_for_google_speech(audio_bytes):
    """
    Convert audio to format required by Google Speech API (LINEAR16, 16kHz, mono)
    """
    try:
        # Create temporary file for conversion
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_input:
            temp_input.write(audio_bytes)
            temp_input.flush()
            
            # Load and convert audio using pydub
            audio = AudioSegment.from_file(temp_input.name)
            
            # Convert to required format: 16kHz, mono, 16-bit PCM
            audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
            
            # Export to temporary WAV file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_output:
                audio.export(temp_output.name, format="wav")
                
                # Read the converted audio
                with open(temp_output.name, "rb") as f:
                    converted_audio = f.read()
                
                # Cleanup temp files
                os.unlink(temp_input.name)
                os.unlink(temp_output.name)
                
                print(f"🔄 Converted audio: {len(converted_audio)} bytes")
                return converted_audio
                
    except Exception as e:
        print(f"❌ Audio conversion error: {e}")
        raise Exception(f"Failed to convert audio for Google Speech API: {str(e)}")

def get_google_language_code(language):
    """Map our language codes to Google Speech API language codes"""
    mapping = {
        "hi": "hi-IN",      # Hindi (India)
        "en": "en-US",      # English (US)
        "gu": "gu-IN",      # Gujarati (India)
        "te": "te-IN",      # Telugu (India)
        "mr": "mr-IN",      # Marathi (India)
        "ta": "ta-IN",      # Tamil (India)
        "bn": "bn-IN",      # Bengali (India)
        "pa": "pa-IN",      # Punjabi (India)
        "kn": "kn-IN",      # Kannada (India)
        "ml": "ml-IN",      # Malayalam (India)
        "or": "or-IN",      # Odia (India)
        "as": "as-IN",      # Assamese (India)
        "auto": "en-US"     # Default to English for auto
    }
    return mapping.get(language, "en-US")

def enhance_listing_with_gemini(transcribed_text, language):
    """
    Use Gemini API to enhance the transcribed text into a professional listing
    """
    try:
        from utils.ai_utils import call_gemini_api
        
        system_prompt = f"""
        A host has described their rural property in {language}. Create a professional listing from this description:
        
        Original Description: "{transcribed_text}"
        
        Generate a comprehensive listing with the following structure:
        1. Catchy title (5-8 words) - make it appealing and descriptive
        2. Professional description (150-200 words) highlighting authentic rural experience
        3. List of amenities (based on description + typical for this property type) - at least 6 amenities
        4. Property type (choose from: homestay, farmstay, village_house, eco_lodge, heritage_home, cottage)
        5. Suggested pricing range per night (in INR, consider rural India pricing 1000-5000)
        6. House rules (3-4 culturally appropriate rules)
        7. Unique selling points (3-4 points)
        8. Sustainability features mentioned or implied (at least 3)
        9. Maximum guests (reasonable number 2-8)
        
        Maintain cultural authenticity and local charm. 
        
        Respond with valid JSON only in this exact format:
        {{
            "title": "string",
            "description": "string", 
            "amenities": ["string1", "string2", "string3", "string4", "string5", "string6"],
            "property_type": "string",
            "pricing_suggestion": "₹XXXX",
            "house_rules": ["string1", "string2", "string3"],
            "unique_features": ["string1", "string2", "string3"],
            "sustainability_features": ["string1", "string2", "string3"],
            "max_guests": number
        }}
        """

        print("🤖 Enhancing listing with Gemini API...")
        
        response = call_gemini_api(system_prompt)
        
        print(f"✅ Gemini enhancement successful")
        print(f"📝 Response: {response[:200]}...")
        
        # Extract JSON from response
        import re
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        else:
            raise Exception("No valid JSON found in Gemini response")
            
    except Exception as e:
        print(f"❌ Gemini enhancement error: {e}")
        raise Exception(f"Failed to enhance listing with Gemini: {str(e)}")

def test_google_speech_setup():
    """Test Google Speech-to-Text setup"""
    print("🧪 Testing Google Speech-to-Text setup...")
    
    # Test client initialization
    if speech_client:
        print("✅ Google Speech client available")
    else:
        print("❌ Google Speech client not available")
        return False
    
    # Test credentials
    if Config.GOOGLE_APPLICATION_CREDENTIALS:
        print(f"✅ Google credentials path: {Config.GOOGLE_APPLICATION_CREDENTIALS}")
        if os.path.exists(Config.GOOGLE_APPLICATION_CREDENTIALS):
            print("✅ Credentials file exists")
        else:
            print("❌ Credentials file not found")
            return False
    else:
        print("❌ Google credentials path not configured")
        return False
    
    if Config.GOOGLE_CLOUD_PROJECT_ID:
        print(f"✅ Google project ID: {Config.GOOGLE_CLOUD_PROJECT_ID}")
    else:
        print("❌ Google project ID not configured")
        return False
    
    print("✅ Google Speech-to-Text setup ready!")
    return True