import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    MONGO_URI = os.environ.get('MONGO_URI') or 'mongodb://localhost:27017/villagestay'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string'
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # Azure OpenAI Configuration
    AZURE_WHISPER_ENDPOINT = os.environ.get('AZURE_WHISPER_ENDPOINT') or 'https://oai-codecuffs.openai.azure.com/openai/deployments/whisper/audio/transcriptions'
    AZURE_WHISPER_API_KEY = os.environ.get('AZURE_WHISPER_API_KEY') or 'FDVTHdd3ajvAsE4B5y4xFAKigDS6h9IeoSAlAFnF73YBOGmi6T6nJQQJ99BFAC77bzfXJ3w3AAABACOGLyiB'
    AZURE_WHISPER_API_VERSION = os.environ.get('AZURE_WHISPER_API_VERSION') or '2024-12-01-preview'
    
    AZURE_GPT_ENDPOINT = os.environ.get('AZURE_GPT_ENDPOINT') or 'https://codecuffs1.openai.azure.com/'
    AZURE_GPT_API_KEY = os.environ.get('AZURE_GPT_API_KEY') or '3cfpjX7sdez3Cye9JZM3uQX8CI0mKyPHgfJGKntzmv8QRAUjImsaJQQJ99BFACYeBjFXJ3w3AAABACOGq8j3'
    AZURE_GPT_API_VERSION = os.environ.get('AZURE_GPT_API_VERSION') or '2024-12-01-preview'
    AZURE_GPT_DEPLOYMENT = os.environ.get('AZURE_GPT_DEPLOYMENT') or 'gpt-4o'