import os
import json
from firebase_admin import credentials, firestore, initialize_app

# Initialize Firebase Admin
def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    if not hasattr(initialize_firebase, 'initialized'):
        # Check if running in Vercel environment
        if os.getenv('VERCEL'):
            # Use environment variables in production
            cred_dict = {
                "type": "service_account",
                "project_id": os.getenv('FIREBASE_PROJECT_ID'),
                "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
                "private_key": os.getenv('FIREBASE_PRIVATE_KEY').replace('\\n', '\n'),
                "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
                "client_id": os.getenv('FIREBASE_CLIENT_ID'),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{os.getenv('FIREBASE_CLIENT_EMAIL')}"
            }
            cred = credentials.Certificate(cred_dict)
        else:
            # Use service account file in development
            cred = credentials.Certificate('../firebase-config.json')
        
        initialize_app(cred)
        initialize_firebase.initialized = True
    
    return firestore.client()

def get_firestore_client():
    """Get Firestore client instance"""
    return initialize_firebase()