"""Pest domain entity."""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional

from app.core.constants import PopulationLevel, SeverityLevel


@dataclass
class Pest:
    """A crop pest known to the verified knowledge base."""
    id: int
    name: str                                # e.g. "Aphids"
    scientific_name: str                     # e.g. "Aphis gossypii"
    crop_id: int
    description: str = ""
    population_levels: Dict[str, str] = field(default_factory=dict)
    created_at: Optional[datetime] = None

    def classify_severity(self, population_level: PopulationLevel) -> SeverityLevel:
        """Map pest population level to unified severity."""
        mapping = {
            PopulationLevel.LOW: SeverityLevel.LOW,
            PopulationLevel.MODERATE: SeverityLevel.MEDIUM,
            PopulationLevel.HIGH: SeverityLevel.HIGH,
            PopulationLevel.SEVERE: SeverityLevel.CRITICAL,
        }
        return mapping.get(population_level, SeverityLevel.LOW)
