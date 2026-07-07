import enum

class SeverityLevel(str, enum.Enum):
    NONE = 'none'
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    CRITICAL = 'critical'

class PopulationLevel(str, enum.Enum):
    LOW = 'low'
    MODERATE = 'moderate'
    HIGH = 'high'
    SEVERE = 'severe'

class WeatherRiskLevel(str, enum.Enum):
    LOW = 'low'
    MODERATE = 'moderate'
    HIGH = 'high'

class NotificationType(str, enum.Enum):
    DISEASE_ALERT = 'disease_alert'
    PEST_ALERT = 'pest_alert'
    WEATHER_ALERT = 'weather_alert'
    SPRAY_REMINDER = 'spray_reminder'
    IRRIGATION_ADVISORY = 'irrigation_advisory'
    GENERAL = 'general'

class UserRole(str, enum.Enum):
    FARMER = 'farmer'
    AGRICULTURE_OFFICER = 'agriculture_officer'
    KVK_OFFICER = 'kvk_officer'
    ADMIN = 'admin'
    SUPER_ADMIN = 'super_admin'

class AnalysisStatus(str, enum.Enum):
    PENDING = 'pending'
    PROCESSING = 'processing'
    COMPLETED = 'completed'
    FAILED = 'failed'

class WaterStatus(str, enum.Enum):
    DRY = 'dry'
    NORMAL = 'normal'
    EXCESS = 'excess'
    WATERLOGGED = 'waterlogged'

class RecommendationStatus(str, enum.Enum):
    ACTIVE = 'active'
    DEPRECATED = 'deprecated'
    UNDER_REVIEW = 'under_review'

class LanguageCode(str, enum.Enum):
    EN = 'en'
    HI = 'hi'
    MR = 'mr'
    PA = 'pa'
    GU = 'gu'
    TA = 'ta'
    TE = 'te'
    BHO = 'bho'
    AWA = 'awa'

class SprayUnit(str, enum.Enum):
    G = 'g'
    ML = 'ml'
    KG = 'kg'
    L = 'l'

class ImageSource(str, enum.Enum):
    CAMERA = 'camera'
    GALLERY = 'gallery'
    UPLOAD = 'upload'

class AIProvider(str, enum.Enum):
    GEMINI = 'gemini'
    YOLOV11 = 'yolov11'
    EFFICIENTNET = 'efficientnet'
    CONVNEXT = 'convnext'
    MOCK = 'mock'
