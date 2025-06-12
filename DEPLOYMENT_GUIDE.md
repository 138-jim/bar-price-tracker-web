# Deployment Guide

## Prerequisites
1. Vercel CLI installed ✅
2. Vercel account (create at vercel.com)
3. Firebase project with Firestore enabled

## Step 1: Authentication
```bash
cd /home/jim/Bar-tracking/bar-price-tracker-web
vercel login
```
Choose your login method and complete authentication.

## Step 2: Set Environment Variables
Before deploying, you need to set up your Firebase configuration:

### Option A: Via Vercel Dashboard
1. Go to vercel.com/dashboard
2. Import your project or create new one
3. Go to Settings → Environment Variables
4. Add the following variables:

```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key (with \n preserved)
FIREBASE_CLIENT_EMAIL=your_service_account_email
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Option B: Via CLI
```bash
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_PRIVATE_KEY
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
```

## Step 3: Deploy
```bash
vercel --prod
```

## Step 4: Test Deployment
After successful deployment, test:
1. User registration/login
2. Adding alcohol items
3. Price scraping functionality
4. Responsive design on mobile

## Firebase Setup Required
You'll need to:
1. Create a Firebase project at console.firebase.google.com
2. Enable Firestore
3. Create a service account and download the JSON key
4. Extract the required environment variables from the JSON

## Project Structure
- Frontend: Next.js app in `/frontend`
- API: Python FastAPI functions in `/api`
- Database: Firebase Firestore
- Deployment: Vercel with serverless functions

## Features Ready for Production
✅ User authentication
✅ Alcohol inventory management  
✅ Price scraping (BWS, Liquorland)
✅ Cost calculations
✅ Responsive design
✅ TypeScript safety
✅ Error handling