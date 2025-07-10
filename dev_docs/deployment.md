# Deployment Guide

This document provides comprehensive deployment instructions for the Music Theory Toolkit application.

## Google Cloud Run Deployment

### Overview

The Music Theory Toolkit is designed to be deployed as a containerized application on Google Cloud Run. The deployment uses:

- **Docker**: Multi-stage build with nginx serving static files
- **Google Container Registry**: For storing Docker images
- **Google Secret Manager**: For secure API key storage
- **Cloud Run**: For serverless container hosting

### Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Build Stage   │    │ Production Stage │    │   Cloud Run     │
│                 │    │                  │    │                 │
│ Node.js 18      │───▶│ nginx:alpine     │───▶│ Serverless      │
│ - npm install   │    │ - Static files   │    │ - Auto-scaling  │
│ - npm run build │    │ - Runtime config │    │ - HTTPS         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Prerequisites

1. **Google Cloud SDK**
   ```bash
   # Install gcloud CLI
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   gcloud init
   ```

2. **Docker**
   ```bash
   # Install Docker (varies by OS)
   # For macOS with Homebrew:
   brew install docker
   ```

3. **Google Cloud Project Setup**
   ```bash
   # Create a new project (optional)
   gcloud projects create your-project-id

   # Set the project
   gcloud config set project your-project-id

   # Enable required APIs
   gcloud services enable containerregistry.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```

4. **Authentication**
   ```bash
   # Authenticate with Google Cloud
   gcloud auth login

   # Configure Docker to use gcloud as credential helper
   gcloud auth configure-docker
   ```

### Environment Configuration

Create a `.env.prod` file in the project root:

```bash
# Google Cloud Project ID
PROJECT_ID=your-gcp-project-id

# Google Gemini API Key
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

**Security Note**: Never commit `.env.prod` to version control. Add it to `.gitignore`.

### Deployment Methods

#### Method 1: Automated Deployment (Recommended)

Use the provided deployment script:

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

The script performs these steps:
1. Validates environment variables and prerequisites
2. Loads environment variables from `.env.prod`
3. Builds a multi-platform Docker image
4. Pushes the image to Google Container Registry
5. Creates/updates the API key secret in Secret Manager
6. Deploys the application to Cloud Run non-interactively

#### Method 2: Manual Deployment

For more control or troubleshooting:

1. **Build the Docker Image**
   ```bash
   docker build --platform linux/amd64 -t gcr.io/$PROJECT_ID/music-theory-toolkit .
   ```

2. **Push to Container Registry**
   ```bash
   docker push gcr.io/$PROJECT_ID/music-theory-toolkit
   ```

3. **Create Secret for API Key**
   ```bash
   # Create new secret
   echo "$VITE_GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
     --replication-policy="automatic" \
     --data-file=- \
     --project="$PROJECT_ID"

   # Or update existing secret
   echo "$VITE_GEMINI_API_KEY" | gcloud secrets versions add gemini-api-key \
     --data-file=- \
     --project="$PROJECT_ID"
   ```

4. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy music-theory-toolkit \
     --image gcr.io/$PROJECT_ID/music-theory-toolkit \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8080 \
     --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
     --project="$PROJECT_ID"
   ```

### Configuration Details

#### Docker Configuration

The `Dockerfile` uses a multi-stage build:

- **Build Stage**: Uses Node.js 18 Alpine to build the React application
- **Production Stage**: Uses nginx Alpine to serve static files

Key files:
- `nginx.conf`: Custom nginx configuration for SPA routing
- `docker-entrypoint.sh`: Runtime configuration injection

#### Runtime Configuration

The application uses runtime configuration injection to handle environment variables securely:

1. The `docker-entrypoint.sh` script creates a `config.js` file at runtime
2. This file exposes the `GEMINI_API_KEY` to the frontend application
3. The frontend loads this configuration before initializing

#### Security Considerations

- API keys are stored in Google Secret Manager, not in the container image
- Secrets are injected at runtime using Cloud Run's secret mounting
- The application serves over HTTPS automatically via Cloud Run
- Security headers are configured in nginx

### Monitoring and Maintenance

#### Viewing Logs

```bash
# View recent logs
gcloud run logs read music-theory-toolkit --project=$PROJECT_ID

# Follow logs in real-time
gcloud run logs tail music-theory-toolkit --project=$PROJECT_ID
```

#### Updating the Deployment

To update the application:

1. Make your code changes
2. Run the deployment script again: `./deploy.sh`
3. The script will build a new image and update the Cloud Run service

#### Scaling Configuration

Cloud Run automatically scales based on traffic. To configure scaling:

```bash
gcloud run services update music-theory-toolkit \
  --min-instances=0 \
  --max-instances=10 \
  --concurrency=80 \
  --project=$PROJECT_ID
```

### Troubleshooting

#### Common Issues

1. **Build Failures**
   - Ensure all dependencies are properly listed in `package.json`
   - Check that `nginx.conf` exists in the project root
   - Verify Docker is running and accessible

2. **Deployment Failures**
   - Confirm all required APIs are enabled
   - Check that the project ID is correct in `.env.prod`
   - Ensure proper authentication with `gcloud auth list`

3. **Runtime Issues**
   - Check Cloud Run logs for error messages
   - Verify the secret exists: `gcloud secrets list --project=$PROJECT_ID`
   - Ensure the Gemini API key is valid

4. **Permission Issues**
   ```bash
   # Grant necessary permissions
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="user:your-email@domain.com" \
     --role="roles/run.admin"

   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="user:your-email@domain.com" \
     --role="roles/secretmanager.admin"
   ```

5. **Deployment Script Hanging**
   If the deployment script hangs after the Docker push completes, this is typically caused by:

   **Root Cause**: gcloud commands waiting for interactive confirmation or input

   **Symptoms**:
   - Script shows successful Docker push but then stops responding
   - No error messages, just appears to freeze
   - Output shows layers already exist but no further progress

   **Solution**: The deployment script has been updated with:
   - `--quiet` flags on all gcloud commands to prevent interactive prompts
   - Proper error handling with `set -e` to exit on failures
   - Progress logging to show what step is currently executing
   - Environment variable validation before starting deployment

   **If you still experience hanging**:
   ```bash
   # Run commands manually with --quiet flag
   gcloud secrets describe gemini-api-key --project="$PROJECT_ID" --quiet
   gcloud run deploy music-theory-toolkit --quiet --project="$PROJECT_ID" [other flags]

   # Check for authentication issues
   gcloud auth list
   gcloud config get-value project
   ```

#### Debug Commands

```bash
# Test the Docker image locally
docker run -p 8080:8080 -e GEMINI_API_KEY="your-key" gcr.io/$PROJECT_ID/music-theory-toolkit

# Check service status
gcloud run services describe music-theory-toolkit --region=us-central1 --project=$PROJECT_ID

# List all secrets
gcloud secrets list --project=$PROJECT_ID

# View secret versions
gcloud secrets versions list gemini-api-key --project=$PROJECT_ID
```

### Cost Optimization

- Cloud Run charges only for actual usage (CPU and memory during request processing)
- The application automatically scales to zero when not in use
- Consider setting appropriate CPU and memory limits:

```bash
gcloud run services update music-theory-toolkit \
  --cpu=1 \
  --memory=512Mi \
  --project=$PROJECT_ID
```

### Custom Domain (Optional)

To use a custom domain:

1. **Map the domain**
   ```bash
   gcloud run domain-mappings create \
     --service music-theory-toolkit \
     --domain your-domain.com \
     --region us-central1 \
     --project=$PROJECT_ID
   ```

2. **Update DNS records** as instructed by the mapping command

### Backup and Recovery

- Container images are stored in Google Container Registry
- Secrets are managed by Google Secret Manager with automatic versioning
- Application state is stateless, so no additional backup is required
- Consider exporting your Cloud Run service configuration:

```bash
gcloud run services describe music-theory-toolkit \
  --region=us-central1 \
  --project=$PROJECT_ID \
  --format="export" > service-backup.yaml
```

This deployment guide ensures a robust, secure, and scalable deployment of the Music Theory Toolkit on Google Cloud Run.
