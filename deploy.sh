#!/bin/bash
set -e  # Exit on any error

# Load environment variables from .env.prod
if [ ! -f .env.prod ]; then
  echo "Error: .env.prod file not found!"
  exit 1
fi

export $(cat .env.prod | xargs)

usage() {
  echo "Usage: $0 {dev|test|deploy-backend|deploy-frontend|deploy-all}"
  exit 1
}

if [ -z "$1" ]; then
  usage
fi


case "$1" in
  dev)
    echo "Starting backend..."
    uvicorn backend.app.main:app --reload &
    echo "Starting logging server..."
    cd frontend
    npm run dev:server &
    echo "Starting frontend dev server with proxy..."
    npm run dev
    ;;

  test)
    npm --prefix frontend run test
#    cd backend
#    pip install -r requirements.txt
#    pytest
    ;;

  deploy-backend)
    # --- Configuration Variables ---
    # You could also move these to your .env.prod file
    GCP_REGION="us-central1"
    BACKEND_SERVICE_NAME="music-theory-toolkit-backend"
    BACKEND_IMAGE_NAME="gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME"

    # --- Pre-flight Check ---
    if [ ! -f backend/Dockerfile ]; then
      echo "Error: backend/Dockerfile not found!"
      echo "Please create a Dockerfile for the backend service before deploying."
      exit 1
    fi

    echo "Enabling required Google Cloud services..."
    gcloud services enable run.googleapis.com \
                           logging.googleapis.com \
                           secretmanager.googleapis.com \
                           cloudbuild.googleapis.com \
                           --project="$PROJECT_ID"

    echo "Building and pushing backend Docker image..."
    gcloud builds submit backend --tag "$BACKEND_IMAGE_NAME" --project="$PROJECT_ID"

    echo "Deploying backend to Cloud Run..."
    gcloud run deploy "$BACKEND_SERVICE_NAME" \
      --image "$BACKEND_IMAGE_NAME" \
      --platform managed \
      --region "$GCP_REGION" \
      --allow-unauthenticated \
      --execution-environment gen2 \
      --port 8080 \
      --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
      --set-env-vars GOOGLE_CLOUD_PROJECT="$PROJECT_ID" \
      --memory 4Gi \
      --cpu 8 \
      --concurrency=1 \
      --max-instances 2 \
      --timeout 300 \
      --project="$PROJECT_ID" \
      --quiet
    ;;

  deploy-frontend)
    # --- Configuration Variables ---
    GCP_REGION="us-central1"
    FRONTEND_SERVICE_NAME="music-theory-toolkit-frontend"
    FRONTEND_IMAGE_NAME="gcr.io/$PROJECT_ID/$FRONTEND_SERVICE_NAME"

    # --- Pre-flight Check ---
    if [ ! -f frontend/Dockerfile ]; then
      echo "Error: frontend/Dockerfile not found!"
      echo "Please create a Dockerfile for the frontend service before deploying."
      exit 1
    fi

    echo "Enabling required Google Cloud services..."
    gcloud services enable run.googleapis.com \
                           cloudbuild.googleapis.com \
                           --project="$PROJECT_ID"

    echo "Building and pushing frontend Docker image..."
    gcloud builds submit frontend --tag "$FRONTEND_IMAGE_NAME" --project="$PROJECT_ID"

    echo "Deploying frontend to Cloud Run..."
    gcloud run deploy "$FRONTEND_SERVICE_NAME" \
      --image "$FRONTEND_IMAGE_NAME" \
      --platform managed \
      --region "$GCP_REGION" \
      --allow-unauthenticated \
      --memory 512Mi \
      --cpu 1 \
      --max-instances 5 \
      --timeout 120 \
      --project="$PROJECT_ID" \
      --quiet
    ;;

  deploy-all)
    "$0" deploy-backend
    "$0" deploy-frontend
    ;;

  *)
    usage
    ;;
esac
