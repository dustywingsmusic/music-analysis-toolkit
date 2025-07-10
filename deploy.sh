#!/bin/bash
set -e  # Exit on any error

echo "Starting deployment process..."

# Load environment variables from .env.prod
if [ ! -f .env.prod ]; then
  echo "Error: .env.prod file not found!"
  exit 1
fi

export $(cat .env.prod | xargs)

# Validate required environment variables
if [ -z "$PROJECT_ID" ]; then
  echo "Error: PROJECT_ID not set in .env.prod"
  exit 1
fi

if [ -z "$VITE_GEMINI_API_KEY" ]; then
  echo "Error: VITE_GEMINI_API_KEY not set in .env.prod"
  exit 1
fi

echo "Building Docker image..."
# Build and tag the image
docker build --platform linux/amd64 -t gcr.io/"$PROJECT_ID"/music-theory-toolkit .

echo "Pushing image to Google Container Registry..."
# Push to GCR
docker push gcr.io/"$PROJECT_ID"/music-theory-toolkit

echo "Managing API key in Secret Manager..."
# Store API key in Secret Manager
if gcloud secrets describe gemini-api-key --project="$PROJECT_ID" --quiet >/dev/null 2>&1; then
  echo "Secret 'gemini-api-key' already exists. Adding new version..."
  echo "$VITE_GEMINI_API_KEY" | gcloud secrets versions add gemini-api-key --data-file=- --project="$PROJECT_ID" --quiet
else
  echo "Creating new secret 'gemini-api-key'..."
  echo "$VITE_GEMINI_API_KEY" | gcloud secrets create gemini-api-key --replication-policy="automatic" --data-file=- --project="$PROJECT_ID" --quiet
fi

echo "Deploying to Cloud Run..."
# Deploy with secret
gcloud run deploy music-theory-toolkit \
  --image gcr.io/"$PROJECT_ID"/music-theory-toolkit \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --project="$PROJECT_ID" \
  --quiet

echo "Deployment completed successfully!"
echo "Your application should be available at the URL provided above."
