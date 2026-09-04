import logging
import requests
from app.core.config import settings

log = logging.getLogger("ollama")

def get_ai_suggestions(types, rule_suggestions):
    prompt = (
        "You are a data visualization assistant. Given these column types, "
        "return a JSON array of useful chart suggestions. Keep it concise. "
        f"Column types: {types}"
    )
    try:
        r = requests.post(
            f"{settings.ollama_host.rstrip('/')}/api/generate",
            json={"model": settings.ollama_model, "prompt": prompt, "stream": False},
            timeout=8,
        )
        r.raise_for_status()
        text = r.json().get("response", "")
        return {"available": True, "raw": text, "suggestions": rule_suggestions}
    except requests.RequestException as exc:
        log.warning("OLLAMA_ERROR | unavailable_or_timeout=%s | fallback=rule_based", exc)
        return {"available": False, "raw": "", "suggestions": rule_suggestions}
