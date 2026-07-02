"""Entry point: uvicorn app.main:app --reload --port 8100"""

from app.main import app

__all__ = ["app"]
