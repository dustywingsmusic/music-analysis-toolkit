# /Users/samwachtel/PycharmProjects/music_modes_app/run_profiler.py
import uvicorn

if __name__ == "__main__":
    """
    This script is a dedicated entry point for running the FastAPI app
    with the memory profiler. We avoid using --reload to ensure the
    profiler tracks a single, stable process.
    """
    uvicorn.run(
        "backend.app.main:app",
        host="127.0.0.1",
        port=8000,
        log_level="info"
    )
