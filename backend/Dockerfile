# /Users/samwachtel/PycharmProjects/music_modes_app/backend/Dockerfile

# Use an official Python runtime as a parent image
FROM python:3.11-slim

# --- Add this section to install FFmpeg ---
# Update package lists and install ffmpeg, then clean up.
# This provides robust audio file handling capabilities for librosa.
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg libsndfile1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
# --- End of new section ---

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
# Make sure 'gunicorn' is listed in your requirements.txt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code
COPY ./app ./app

# The port the container will listen on.
# This is good practice for documentation and is ignored by Cloud Run.
# The Gunicorn bind address is what actually matters for deployment.
EXPOSE 8080

# Command to run the application.
# Use Gunicorn for production instead of Uvicorn's dev server.
# Command to run the application with a 120-second timeout.
CMD ["gunicorn", "-w", "2", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8080", "--timeout", "120", "app.main:app"]
