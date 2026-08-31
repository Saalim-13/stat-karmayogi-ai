from __future__ import annotations

from app.core.config import settings

SYSTEM_PROMPT = """You are Stat-Karmayogi AI, a concise learning assistant for India's official statistical system. Explain concepts simply with a practical example. Do not claim live iGOT data, course credits, private data access, or legal certainty. If uncertain, say so. End with exactly: Key takeaway: <one sentence>."""


def ai_available() -> bool:
    return bool(settings.openai_api_key.strip() and settings.openai_model.strip())


def _fallback(message: str) -> dict:
    lower = message.lower()
    if "lfpr" in lower or "labour" in lower or "plfs" in lower:
        answer, competency = "LFPR is the share of people who are working or seeking work. For example, if 60 out of 100 adults are working or looking for work, LFPR is 60%.", "D-NSS"
    elif "sampling" in lower:
        answer, competency = "Sampling selects a smaller group to understand a larger population. Sampling weights help turn that sample result into a population estimate.", "D-SAM"
    elif "gsbpm" in lower:
        answer, competency = "GSBPM is a map of the statistical production process, from defining needs through collection, analysis, and release. It helps teams find where quality checks belong.", "D-QUA"
    elif "confidential" in lower:
        answer, competency = "Unit-level survey information must be protected and handled only through approved processes. This supports trust and statistical integrity.", "B-INT"
    else:
        answer, competency = "AI mode is not configured, so this is an offline guide. Start with the assessment, then use QuizForge and scenario practice to identify and improve weaker competencies.", None
    return {"answer": f"{answer}\n\nKey takeaway: Build understanding through a short explanation, then practise it.", "competency_id": competency, "next_action": "Practise scenarios", "ai_available": False}


def _response(prompt: str) -> str:
    from openai import OpenAI

    client = OpenAI(api_key=settings.openai_api_key)
    result = client.responses.create(
        model=settings.openai_model,
        instructions=f"{SYSTEM_PROMPT}\nIf a request specifies a language code, respond in that language. Preserve official statistical terms in English when an approved translation is not available.",
        input=prompt[:3000],
        max_output_tokens=260,
        store=False,
    )
    return result.output_text.strip()


def chat(message: str, language: str = "en", context: dict | None = None) -> dict:
    ctx = context or {}
    name = ctx.get("learner_name") or "Learner"
    role = ctx.get("role") or "officer"
    weak = ctx.get("weak_topic")
    if not ai_available():
        base = _fallback(message)
        if weak:
            base["answer"] = f"{name}, as a {role}, your current focus remains {weak}.\n\n{base['answer']}"
        return base
    try:
        prompt = (
            f"[Learner language: {language}]\nName: {name}. Role: {role}. "
            f"Weak topic: {weak or 'none stated'}. Goal: {ctx.get('goal') or 'competency improvement'}. "
            f"Current competency signal: {ctx.get('current_competency')}.\n{message}"
        )
        return {"answer": _response(prompt), "competency_id": _competency(message), "next_action": "Practise scenarios", "ai_available": True}
    except Exception:
        return _fallback(message)


def explain_answer(question: str, correct_answer: str, selected_answer: str | None, competency_id: str | None) -> dict:
    prompt = f"Explain this learning question in under 130 words. Question: {question}. Correct answer: {correct_answer}. Learner selected: {selected_answer or 'no answer'}. Give one practical example."
    if not ai_available():
        return {**_fallback(question), "competency_id": competency_id, "next_action": "Review revision queue"}
    try:
        return {"answer": _response(prompt), "competency_id": competency_id, "next_action": "Review revision queue", "ai_available": True}
    except Exception:
        return {**_fallback(question), "competency_id": competency_id, "next_action": "Review revision queue"}


def _competency(text: str) -> str | None:
    lower = text.lower()
    if any(word in lower for word in ("plfs", "lfpr", "labour")): return "D-NSS"
    if "sampling" in lower: return "D-SAM"
    if "gsbpm" in lower: return "D-QUA"
    if any(word in lower for word in ("confidential", "privacy")): return "B-INT"
    if any(word in lower for word in ("sdmx", "digital")): return "F-DIG"
    return None
