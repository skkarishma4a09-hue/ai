"""
AgriMind Agent Routes
Provides POST /api/agent/decision and GET /api/agent/health
"""

from flask import Blueprint, request, jsonify
from services.agent_service import agent_service
from services.llm_service import llm_service

agent_bp = Blueprint('agent', __name__, url_prefix='/api/agent')

@agent_bp.route('/health', methods=['GET'])
def get_agent_health():
    """Returns agent, LLM, and tool health status."""
    health = agent_service.get_health()
    return jsonify(health), 200

@agent_bp.route('/decision', methods=['POST'])
def get_agent_decision():
    """
    Main Agentic Decision API endpoint.
    Accepts:
    {
      "message": "Should I irrigate my tomato crop today?",
      "farm_id": "farm_001",
      "context": { ... }
    }
    """
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    farm_id = data.get('farm_id', 'farm_001')
    user_context = data.get('context', {})

    if not message:
        return jsonify({
            "success": False,
            "error": "The 'message' field is required."
        }), 400

    try:
        decision_result = agent_service.process_decision(
            message=message,
            farm_id=farm_id,
            user_context=user_context
        )
        return jsonify(decision_result), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Agent decision processing error: {str(e)}"
        }), 500
