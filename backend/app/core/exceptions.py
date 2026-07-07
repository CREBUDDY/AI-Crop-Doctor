"""Custom exception hierarchy for AI Crop Doctor.

All HTTP-aware exceptions live here so that the presentation layer
can catch them uniformly without leaking infrastructure details.
"""
from fastapi import HTTPException, status


class AppException(Exception):
    """Base application exception."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


# ── Domain Exceptions ────────────────────────────────────────────────────────

class NotFoundError(AppException):
    """Resource not found."""
    pass


class ValidationError(AppException):
    """Business rule validation failed."""
    pass


class DuplicateError(AppException):
    """Resource already exists."""
    pass


class LowConfidenceError(AppException):
    """AI prediction confidence below acceptable threshold."""
    def __init__(self, confidence: float, threshold: float):
        self.confidence = confidence
        self.threshold = threshold
        super().__init__(
            f"Prediction confidence {confidence:.0%} is below threshold {threshold:.0%}. "
            "Please consult your nearest Krishi Vigyan Kendra."
        )


# ── Service Exceptions ───────────────────────────────────────────────────────

class AIServiceError(AppException):
    """AI service (Gemini or future model) error."""
    pass


class WeatherServiceError(AppException):
    """Weather API provider error."""
    pass


class StorageServiceError(AppException):
    """File storage error."""
    pass


class RecommendationNotFoundError(AppException):
    """No verified recommendation found for the given disease/pest/crop combination."""
    pass


class AuthenticationError(AppException):
    """Firebase authentication failed."""
    pass


# ── HTTP Exception Factories ─────────────────────────────────────────────────

def not_found_exception(resource: str, identifier: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{resource} '{identifier}' not found.",
    )


def unauthorized_exception(detail: str = "Authentication required.") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def forbidden_exception(detail: str = "Insufficient permissions.") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=detail,
    )


def bad_request_exception(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=detail,
    )
