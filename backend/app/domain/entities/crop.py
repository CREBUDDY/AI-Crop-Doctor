"""Crop domain entity."""
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional


@dataclass
class Crop:
    """Represents a crop type known to the system."""
    id: int
    name: str                          # e.g. "Tomato"
    scientific_name: str               # e.g. "Solanum lycopersicum"
    local_names: dict = field(default_factory=dict)   # {"hi": "टमाटर", "mr": "टोमॅटो"}
    created_at: Optional[datetime] = None
