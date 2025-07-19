# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code
COPY ./app ./app

# The port the container will listen on.
# This MUST match the --port flag in your gcloud run deploy command.
EXPOSE 8080

# Command to run the application.
# Use Gunicorn for production instead of Uvicorn's dev server.
# You'll need to add 'gunicorn' to your requirements.txt
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8080", "app.main:app"]