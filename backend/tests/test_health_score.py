import pytest
from ai_engine.scoring.health_score import calculate_health_score
from ai_engine.schemas import AIPipelineOutput, DetectedIssue, Severity, WaterStatus, BoundingBox

def test_perfect_health_score():
    """Test that a crop with no issues gets a perfect score."""
    vision_output = AIPipelineOutput(
        crop_identified="Tomato",
        crop_confidence=0.99,
        detected_diseases=[],
        detected_pests=[],
        leaf_condition_score=100,
        color_analysis_score=100,
        water_status=WaterStatus.NORMAL,
        overall_confidence=0.95
    )
    score = calculate_health_score(vision_output)
    assert score == 100

def test_critical_disease_penalty():
    """Test that a critical disease with high affected area severely reduces the score."""
    vision_output = AIPipelineOutput(
        crop_identified="Tomato",
        crop_confidence=0.99,
        detected_diseases=[
            DetectedIssue(
                name="Late Blight",
                confidence=0.98,
                severity=Severity.CRITICAL,
                affected_area_percentage=80.0,
                bounding_boxes=[]
            )
        ],
        detected_pests=[],
        leaf_condition_score=60,
        color_analysis_score=70,
        water_status=WaterStatus.NORMAL,
        overall_confidence=0.95
    )
    score = calculate_health_score(vision_output)
    
    # Expected: 100 - (50 * 0.8) for disease - (20 * 0.2) for leaf - (10 * 0.2) for color
    # 100 - 40 - 4 - 2 = 54
    assert score == 54

def test_water_stress_penalty():
    """Test that waterlogged status applies a 20 point penalty."""
    vision_output = AIPipelineOutput(
        crop_identified="Wheat",
        crop_confidence=0.99,
        detected_diseases=[],
        detected_pests=[],
        leaf_condition_score=100,
        color_analysis_score=100,
        water_status=WaterStatus.WATERLOGGED,
        overall_confidence=0.95
    )
    score = calculate_health_score(vision_output)
    assert score == 80
