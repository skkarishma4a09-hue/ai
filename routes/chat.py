"""
AgriMind Chat Route
Upgraded to use Agentic AI Orchestration for conversational agriculture advisory.
"""

from datetime import datetime
from flask import Blueprint, request, jsonify
from services.agent_service import agent_service

chat_bp = Blueprint('chat', __name__, url_prefix='/api')

@chat_bp.route('/chat', methods=['POST'])
def send_chat_message():
    """
    POST /api/chat
    Accepts: { "message": "...", "language": "en" | "te" }
    Runs the full agentic loop and formats a conversational response with actionable bullets.
    """
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    language = data.get('language', 'en')

    if not message:
        return jsonify({"error": "Message cannot be empty"}), 400

    decision = agent_service.process_decision(message=message)
    agent_data = decision.get("agent", {})
    rec = agent_data.get("recommendation", "")
    reason = agent_data.get("reasoning_summary", "")
    actions = agent_data.get("actions", [])
    warnings = agent_data.get("warnings", [])

    # Format text response with bulleted action steps
    if language == 'te':
        action_text = "\n".join([f"• {a}" for a in actions]) if actions else ""
        formatted_text = f"{rec}\n\nకారణం: {reason}"
        if action_text:
            formatted_text += f"\n\nసిఫార్సు చేసిన పనులు:\n{action_text}"
        if warnings:
            formatted_text += f"\n\nహెచ్చరికలు: {warnings[0]}"
    else:
        action_text = "\n".join([f"• {a}" for a in actions]) if actions else ""
        formatted_text = f"{rec}\n\nReasoning: {reason}"
        if action_text:
            formatted_text += f"\n\nPrescribed Action Plan:\n{action_text}"
        if warnings:
            formatted_text += f"\n\nNote: {warnings[0]}"

    return jsonify({
        "id": f"msg_{int(datetime.utcnow().timestamp())}",
        "sender": "assistant",
        "text": formatted_text,
        "language": language,
        "timestamp": datetime.utcnow().isoformat(),
        "agent": agent_data,
        "suggestedActions": actions[:3]
    }), 200
