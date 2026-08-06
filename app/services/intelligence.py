from google import genai
import json
import time
from typing import Dict, Any, List, Optional
from app.core.config import settings

# ponytail: process-local counters; upgrade = Redis / Prometheus when multi-worker
_stats: Dict[str, Any] = {
    "calls": 0,
    "success": 0,
    "parse_failures": 0,
    "fallback_mock": 0,
    "no_client": 0,
    "latency_ms": [],  # last N samples
}
_LAT_CAP = 200
# Alert threshold: fallback rate over last window of calls
FALLBACK_ALERT_RATE = 0.25
FALLBACK_ALERT_MIN_CALLS = 8


def model_stats_snapshot() -> Dict[str, Any]:
    calls = int(_stats["calls"])
    fallback = int(_stats["fallback_mock"]) + int(_stats["no_client"])
    lat = list(_stats["latency_ms"])
    lat_sorted = sorted(lat)
    p50 = lat_sorted[len(lat_sorted) // 2] if lat_sorted else None
    p95 = lat_sorted[int(len(lat_sorted) * 0.95)] if lat_sorted else None
    fallback_rate = (fallback / calls) if calls else None
    alert = bool(
        calls >= FALLBACK_ALERT_MIN_CALLS
        and fallback_rate is not None
        and fallback_rate >= FALLBACK_ALERT_RATE
    )
    return {
        "calls": calls,
        "success": int(_stats["success"]),
        "parse_failures": int(_stats["parse_failures"]),
        "fallback_mock": int(_stats["fallback_mock"]),
        "no_client": int(_stats["no_client"]),
        "fallback_rate": round(fallback_rate, 4) if fallback_rate is not None else None,
        "latency_p50_ms": p50,
        "latency_p95_ms": p95,
        "latency_sample_n": len(lat),
        "fallback_alert": alert,
        "notes": [
            "In-memory per process — resets on restart; not multi-worker accurate.",
            f"fallback_alert if rate ≥ {FALLBACK_ALERT_RATE} after {FALLBACK_ALERT_MIN_CALLS}+ calls.",
        ],
    }


def _record_latency(ms: float) -> None:
    buf: List[float] = _stats["latency_ms"]
    buf.append(round(ms, 1))
    if len(buf) > _LAT_CAP:
        del buf[: len(buf) - _LAT_CAP]


class IntelligenceService:
    def __init__(self):
        if settings.GOOGLE_API_KEY:
            self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
            self.model_id = 'gemini-3.1-flash-lite-preview'
        else:
            self.client = None

    async def analyze_case(
        self,
        text: str,
        entities: List[Dict[str, Any]],
        relationships: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Combines summarization and urgency classification into a single structured call.
        Includes extracted entities and clinical relationships for context.
        """
        _stats["calls"] += 1

        if not self.client:
            _stats["no_client"] += 1
            _stats["fallback_mock"] += 1
            return self._mock_analysis("no_api_key")

        prompt = f"""
        You are an expert clinical triage assistant. 
        Analyze the following medical text, extracted entities, and their clinical relationships.
        
        TEXT:
        {text}
        
        EXTRACTED ENTITIES:
        {json.dumps(entities)}
        
        CLINICAL RELATIONSHIPS (CONTEXT):
        {json.dumps(relationships if relationships else [])}
        
        TASK:
        1. Summarize the case structurally: Chief Complaint, Key Symptoms, Risk Flags.
        2. Assign a Triage Urgency Level: Critical, High, Medium, or Low.
        3. Provide clinical evidence for the urgency level.
        4. Suggest potential ICD-10 or standard medical terms if not already mapped.

        LANGUAGE:
        - Input may be English, Hindi (Devanagari), or Hinglish (mixed).
        - urgency_level MUST be exactly one of: Critical, High, Medium, Low (English enum only).
        - chief_complaint and evidence may be English; keep medical terms clear for Indian clinicians.
        
        OUTPUT FORMAT (JSON ONLY):
        {{
            "chief_complaint": "string",
            "key_symptoms": ["list", "of", "strings"],
            "risk_flags": ["list", "of", "risk", "indicators"],
            "urgency_level": "Critical|High|Medium|Low",
            "confidence_score": 0.0 to 1.0,
            "evidence": "brief explanation of why this priority was chosen"
        }}
        """

        t0 = time.perf_counter()
        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_id,
                contents=prompt,
            )
            _record_latency((time.perf_counter() - t0) * 1000)

            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text.replace("```json", "").replace("```", "").strip()

            try:
                parsed = json.loads(response_text)
                _stats["success"] += 1
                return parsed
            except json.JSONDecodeError:
                _stats["parse_failures"] += 1
                _stats["fallback_mock"] += 1
                print("Error in Gemini Analysis: JSON parse failure")
                return self._mock_analysis("parse_failure")
        except Exception as e:
            _record_latency((time.perf_counter() - t0) * 1000)
            _stats["fallback_mock"] += 1
            print(f"Error in Gemini Analysis: {e}")
            return self._mock_analysis("api_error")

    def _mock_analysis(self, reason: str = "fallback") -> Dict[str, Any]:
        return {
            "chief_complaint": "Pending AI analysis (Check API Key)",
            "key_symptoms": [],
            "risk_flags": ["model_fallback"],
            "urgency_level": "Medium",
            "confidence_score": 0.5,
            "evidence": f"Fallback mock ({reason}). Silent Medium defaults are dangerous — verify API key / model.",
        }


intelligence_service = IntelligenceService()
