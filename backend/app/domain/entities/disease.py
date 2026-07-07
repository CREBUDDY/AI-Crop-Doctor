"""Disease domain entity."""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional

from app.core.constants import SeverityLevel


@dataclass
class Disease:
    """A crop disease known to the verified knowledge base."""
    id: int
    name: str                               # e.g. "Early Blight"
    scientific_name: str                    # e.g. "Alternaria solani"
    crop_id: int
    symptoms: List[str] = field(default_factory=list)
    severity_indicators: Dict[str, str] = field(default_factory=dict)
    # affected_area_thresholds: maps severity level → min affected area %
    # e.g. {"low": 0, "medium": 10, "high": 30, "critical": 60}
    affected_area_thresholds: Dict[str, float] = field(default_factory=dict)
    created_at: Optional[datetime] = None

    def classify_severity(self, affected_area_pct: float) -> SeverityLevel:
        """Classify disease severity based on affected leaf area percentage."""
        if not self.affected_area_thresholds:
            return SeverityLevel.MEDIUM

        thresholds = sorted(
            self.affected_area_thresholds.items(),
            key=lambda x: x[1],
            reverse=True,
        )
        for level_name, min_pct in thresholds:
            if affected_area_pct >= min_pct:
                try:
                    return SeverityLevel(level_name)
                except ValueError:
                    continue
        return SeverityLevel.LOW
