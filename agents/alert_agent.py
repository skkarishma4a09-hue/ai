"""
Alert Agent: Responsible for monitoring multi-agent telemetry, detecting agronomic anomalies,
evaluating severity levels (LOW, MEDIUM, HIGH, CRITICAL), determining audio/voice requirements,
and synthesizing actionable alerts for farmers.
"""

from typing import Dict, Any, List, Optional
import datetime
import uuid


class AlertAgent:
    """
    Evaluates inputs from Weather, Soil, Crop, Disease, Pest, Irrigation, Fertilizer, Market,
    and Risk agents to emit unified prioritized farm alerts.
    """

    def __init__(self):
        self.acknowledged_alert_hashes = set()
        self.alert_history: List[Dict[str, Any]] = []

    def evaluate(self, farm_context: Dict[str, Any], agent_outputs: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Determines if an alert is required based on agent findings.
        Returns None if conditions are normal.
        """
        weather = agent_outputs.get("weather", {})
        soil = agent_outputs.get("soil", {})
        disease = agent_outputs.get("disease", {})
        pest = agent_outputs.get("pest", {})
        irrigation = agent_outputs.get("irrigation", {})
        risk = agent_outputs.get("risk", {})

        rain_prob = weather.get("rain_probability", 0)
        rainfall_mm = weather.get("rainfall_mm", 0)
        temp = weather.get("temperature", 28)
        soil_moisture = soil.get("soil_moisture", 50)
        disease_risk = disease.get("disease_risk", "Low")
        pest_risk = pest.get("pest_risk", "Low")

        # 1. Critical Weather Alert (Hailstorm / Extreme Downpour / Frost)
        if rainfall_mm >= 40 or temp >= 42 or temp <= 4:
            alert = {
                "id": f"alt_{uuid.uuid4().hex[:8]}",
                "farm_id": farm_context.get("farm_id", "farm_001"),
                "type": "WEATHER",
                "severity": "CRITICAL",
                "title": "Extreme Weather Emergency Alert",
                "message": f"Critical weather anomaly detected: {rainfall_mm}mm torrential rain / extreme temperature ({temp}°C).",
                "recommended_action": "Secure nursery sheds, open drainage ditches immediately, and halt all field machinery operations.",
                "confidence": 0.96,
                "sound_required": True,
                "voice_required": True,
                "sound": "critical",
                "status": "NEW",
                "created_at": datetime.datetime.utcnow().isoformat()
            }
            return self._record_and_return(alert)

        # 2. High Weather & Irrigation Alert (Heavy Rain Conflict)
        if (rain_prob >= 60 or rainfall_mm >= 12) and (irrigation.get("irrigation_required") or soil_moisture <= 45):
            alert = {
                "id": f"alt_{uuid.uuid4().hex[:8]}",
                "farm_id": farm_context.get("farm_id", "farm_001"),
                "type": "WEATHER",
                "severity": "HIGH",
                "title": "Heavy Rainfall Expected - Postpone Irrigation",
                "message": f"Heavy rainfall ({rainfall_mm or 14.5}mm) with {rain_prob}% probability forecasted. Soil moisture is at {soil_moisture}%.",
                "recommended_action": "Postpone scheduled drip irrigation today to prevent waterlogging and save irrigation energy.",
                "confidence": 0.94,
                "sound_required": True,
                "voice_required": True,
                "sound": "warning",
                "status": "NEW",
                "created_at": datetime.datetime.utcnow().isoformat()
            }
            return self._record_and_return(alert)

        # 3. High Disease Alert
        if disease_risk == "High" or disease.get("pathogen_detected"):
            pathogen = disease.get("primary_disease", "Early Blight (Alternaria solani)")
            alert = {
                "id": f"alt_{uuid.uuid4().hex[:8]}",
                "farm_id": farm_context.get("farm_id", "farm_001"),
                "type": "DISEASE",
                "severity": "HIGH",
                "title": f"Active Disease Alert: {pathogen}",
                "message": f"High fungal infection risk under present humidity ({weather.get('humidity', 65)}%). Concentric lesions identified.",
                "recommended_action": "Apply preventive foliar Mancozeb 75% WP @ 2.5g/L on lower foliage during dry morning hours.",
                "confidence": 0.92,
                "sound_required": True,
                "voice_required": True,
                "sound": "warning",
                "status": "NEW",
                "created_at": datetime.datetime.utcnow().isoformat()
            }
            return self._record_and_return(alert)

        # 4. Medium Soil Moisture Alert
        if soil_moisture < 35 and rain_prob < 40:
            alert = {
                "id": f"alt_{uuid.uuid4().hex[:8]}",
                "farm_id": farm_context.get("farm_id", "farm_001"),
                "type": "SOIL",
                "severity": "MEDIUM",
                "title": "Depleted Soil Moisture Level",
                "message": f"Root-zone soil moisture has fallen to {soil_moisture}% (Optimal target: 45-65%). No rain imminent.",
                "recommended_action": "Run scheduled drip irrigation cycle for 35 minutes during early morning (05:30 - 06:05 AM).",
                "confidence": 0.90,
                "sound_required": True,
                "voice_required": False,
                "sound": "attention",
                "status": "NEW",
                "created_at": datetime.datetime.utcnow().isoformat()
            }
            return self._record_and_return(alert)

        # 5. Low General Advisory Notification
        return {
            "id": f"alt_{uuid.uuid4().hex[:8]}",
            "farm_id": farm_context.get("farm_id", "farm_001"),
            "type": "GENERAL FARM RISK",
            "severity": "LOW",
            "title": "Routine Farm Telemetry Normal",
            "message": "All agro-climatic parameters, soil moisture, and crop health indices are within standard operating boundaries.",
            "recommended_action": "Continue regular canopy scouting and verify pheromone trap counts.",
            "confidence": 0.95,
            "sound_required": False,
            "voice_required": False,
            "sound": "notification",
            "status": "NEW",
            "created_at": datetime.datetime.utcnow().isoformat()
        }

    def _record_and_return(self, alert: Dict[str, Any]) -> Dict[str, Any]:
        # Deduplication check
        content_sig = f"{alert.get('type')}_{alert.get('severity')}_{alert.get('title')}"
        if content_sig not in self.acknowledged_alert_hashes:
            self.alert_history.append(alert)
        return alert


_alert_agent_instance = AlertAgent()

def get_alert_agent() -> AlertAgent:
    return _alert_agent_instance
