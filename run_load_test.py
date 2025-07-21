# /Users/samwachtel/PycharmProjects/music_modes_app/run_load_test.py
import requests
import time
import os
import argparse

# --- Configuration ---
# The URL of your running FastAPI application
API_URL = "http://127.0.0.1:8000/analyze-mode/"

# --- IMPORTANT ---
# Path to a sample audio file to use for the test.
# PLEASE UPDATE THIS to a real path on your system.
# Use a reasonably large file (e.g., > 5MB) to see a clear memory signature.
TEST_AUDIO_FILE = "/Users/samwachtel/Downloads/chopin_ballade_1.mp3"


def run_single_request(iteration: int):
    """Sends a single analysis request to the server and prints the result."""
    print(f"--- Sending Request #{iteration} ---")
    try:
        with open(TEST_AUDIO_FILE, 'rb') as f:
            # The 'files' dictionary is for the file upload part of the multipart form.
            files = {'audio': (os.path.basename(TEST_AUDIO_FILE), f, 'audio/mpeg')}
            # The 'data' dictionary is for other form fields.
            data = {'start': 3.0, 'end': 115.0}  # Analyze a significant segment

            start_time = time.time()
            # Set a generous timeout for potentially long analysis
            response = requests.post(API_URL, files=files, data=data, timeout=180)
            end_time = time.time()

            duration = end_time - start_time

            if response.status_code == 200:
                print(f"✅ Success! Request #{iteration} completed in {duration:.2f} seconds.")
            else:
                print(f"❌ Error on Request #{iteration}! Status: {response.status_code}")
                # Print the first 200 characters of the error response
                print(f"   Response: {response.text[:200]}...")

    except FileNotFoundError:
        print(f"\nFATAL: Test audio file not found at '{TEST_AUDIO_FILE}'")
        print("Please update the TEST_AUDIO_FILE path in the script before running.")
        return False
    except requests.exceptions.RequestException as e:
        print(f"\nFATAL: Could not connect to the server at {API_URL}.")
        print(f"Is the server running? Error: {e}")
        return False
    return True


def main():
    """Parses command-line arguments and runs the load test loop."""
    parser = argparse.ArgumentParser(
        description="Run a load test against the audio analysis API to observe memory usage."
    )
    parser.add_argument(
        "-n", "--requests",
        type=int,
        default=10,
        help="The number of times to send the analysis request."
    )
    args = parser.parse_args()

    print(f"Starting load test with {args.requests} requests...")
    print(f"Using audio file: {TEST_AUDIO_FILE}\n")

    if not os.path.exists(TEST_AUDIO_FILE):
        print(f"FATAL: Test audio file not found at '{TEST_AUDIO_FILE}'")
        print("Please update the TEST_AUDIO_FILE path in the script before running.")
        return

    for i in range(1, args.requests + 1):
        if not run_single_request(i):
            break  # Stop if a fatal error occurred
        time.sleep(1)  # Pause briefly between requests to make profiler output clearer

    print("\nLoad test complete.")


if __name__ == "__main__":
    main()
