from ai_engine.schemas import AIPipelineOutput, Severity

def calculate_health_score(vision_output: AIPipelineOutput) -> int:
    """
    Calculates a deterministic health score (0-100) based on AI vision outputs.
    Formula considers:
    - Base score of 100
    - Penalties for diseases based on severity and affected area
    - Penalties for pests
    - Leaf condition and color
    - Water status
    """
    score = 100.0
    
    # 1. Penalties for Diseases
    severity_weights = {
        Severity.NONE: 0,
        Severity.LOW: 5,
        Severity.MEDIUM: 15,
        Severity.HIGH: 30,
        Severity.CRITICAL: 50
    }
    
    for disease in vision_output.detected_diseases:
        penalty = severity_weights.get(disease.severity, 0)
        # Scale penalty by affected area (if 100% affected, take full penalty)
        area_multiplier = (disease.affected_area_percentage / 100.0)
        # Minimum multiplier of 0.3 if disease is present
        area_multiplier = max(0.3, area_multiplier)
        score -= (penalty * area_multiplier)

    # 2. Penalties for Pests
    for pest in vision_output.detected_pests:
        penalty = severity_weights.get(pest.severity, 0)
        area_multiplier = max(0.3, (pest.affected_area_percentage / 100.0))
        score -= (penalty * area_multiplier)

    # 3. Leaf Condition and Color Integration
    # If leaf condition is below 80, penalize slightly
    if vision_output.leaf_condition_score < 80:
        score -= (80 - vision_output.leaf_condition_score) * 0.2
        
    if vision_output.color_analysis_score < 80:
        score -= (80 - vision_output.color_analysis_score) * 0.2

    # 4. Water Status Penalty
    if vision_output.water_status.value != "normal":
        if vision_output.water_status.value in ["dry", "excess"]:
            score -= 10
        elif vision_output.water_status.value == "waterlogged":
            score -= 20

    # Ensure score is within 0-100 bounds
    final_score = max(0, min(100, int(round(score))))
    
    return final_score
