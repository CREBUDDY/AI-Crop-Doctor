"""Application-wide constants.

No business logic here — only fixed reference values.
"""
from enum import Enum


class SeverityLevel(str, Enum):
    """Unified severity classification used across disease, pest, and weather risk."""
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class PopulationLevel(str, Enum):
    """Pest population level classification."""
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    SEVERE = "severe"


class WeatherRiskLevel(str, Enum):
    """Aggregated weather risk for crop/spray decisions."""
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"


class NotificationType(str, Enum):
    DISEASE_ALERT = "disease_alert"
    PEST_ALERT = "pest_alert"
    WEATHER_ALERT = "weather_alert"
    SPRAY_REMINDER = "spray_reminder"
    IRRIGATION_ADVISORY = "irrigation_advisory"
    GENERAL = "general"


# ── Confidence Thresholds ────────────────────────────────────────────────────
LOW_CONFIDENCE_THRESHOLD = 0.80  # Below this → show low confidence warning

# ── Health Score Weights (must sum to 1.0) ───────────────────────────────────
HEALTH_SCORE_WEIGHTS = {
    "disease_severity": 0.40,
    "pest_severity": 0.20,
    "leaf_condition": 0.15,
    "color_analysis": 0.10,
    "weather_risk": 0.10,
    "water_status": 0.05,
}

# ── Supported Indian States ──────────────────────────────────────────────────
INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
    "Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
    "Lakshadweep", "Puducherry",
]

# ── Supported Languages ──────────────────────────────────────────────────────
SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "pa": "Punjabi",
    "gu": "Gujarati",
    "ta": "Tamil",
    "te": "Telugu",
}
