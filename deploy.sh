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
    echo "Enabling Cloud Run and Cloud Logging APIs..."
    gcloud services enable run.googleapis.com \
                           logging.googleapis.com \
                           cloudresourcemanager.googleapis.com \
                           --project="$PROJECT_ID"
    echo "APIs enabled."

    echo "Building and pushing backend Docker image..."
    gcloud builds submit backend --tag gcr.io/"$PROJECT_ID"/music-theory-toolkit

    echo "Deploying backend to Cloud Run..."
    gcloud run deploy music-theory-toolkit \
      --image gcr.io/"$PROJECT_ID"/music-theory-toolkit \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --port 8080 \
      --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
      --set-env-vars GOOGLE_CLOUD_PROJECT="$PROJECT_ID",NODE_ENV=production \
      --memory 1Gi \
      --cpu 1 \
      --max-instances 10 \
      --timeout 300 \
      --project="$PROJECT_ID" \
      --quiet
    ;;

  deploy-frontend)
    echo "Building and pushing frontend Docker image..."
    gcloud builds submit frontend --tag gcr.io/"$PROJECT_ID"/music-theory-toolkit-frontend

    echo "Deploying frontend to Cloud Run..."
    gcloud run deploy music-theory-toolkit-frontend \
      --image gcr.io/"$PROJECT_ID"/music-theory-toolkit-frontend \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --set-env-vars NODE_ENV=production \
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
