"""
AgriMind Intelligent Task Scheduler
Manages dynamic crop schedules, automated weather postponement, and farm tasks.
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List

class AgriSchedulerService:
    def __init__(self):
        pass

    def evaluate_weather_suitability(self, task_type: str, rain_prob: float, wind_speed: float, temp: float) -> Dict[str, Any]:
        """
        Evaluates whether a planned agronomic task can proceed or must be postponed.
        """
        if task_type in ["spraying", "pesticide", "foliar_fertilizer"]:
            if rain_prob > 50:
                return {
                    "suitable": False,
                    "status": "Rain Postponed",
                    "reason": f"High rain probability ({rain_prob}%). Foliar wash-off risk.",
                    "recommended_action": "Postpone chemical spraying until clear skies."
                }
            if wind_speed > 20:
                return {
                    "suitable": False,
                    "status": "High Wind Warning",
                    "reason": f"Wind speed ({wind_speed} km/h) exceeds safe threshold for spraying.",
                    "recommended_action": "Postpone spraying to avoid drift hazard."
                }
        elif task_type in ["irrigation", "fertigation"]:
            if rain_prob > 60:
                return {
                    "suitable": False,
                    "status": "Rain Postponed",
                    "reason": f"Rainfall expected ({rain_prob}% probability). Suspend irrigation to save water.",
                    "recommended_action": "Skip scheduled drip irrigation."
                }

        return {
            "suitable": True,
            "status": "Suitable",
            "reason": "Current and forecasted weather conditions are optimal for execution.",
            "recommended_action": "Proceed with planned schedule."
        }

scheduler_service = AgriSchedulerService()
