from google import genai
import json
from typing import Dict, Any, List
from app.core.config import settings

class IntelligenceService:
    def __init__(self):
        if settings.GOOGLE_API_KEY:
            self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
            # Using stable model ID for the new SDK
            self.model_id = 'gemini-3.1-flash-lite-preview'
        else:
            self.client = None

    async def analyze_case(self, text: str, entities: List[Dict[str, Any]], relationships: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Combines summarization and urgency classification into a single structured call.
        Includes extracted entities and clinical relationships for context.
        """
        if not self.client:
            return self._mock_analysis()

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
        
        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_id,
                contents=prompt
            )
            
            # The new SDK response structure: response.text or response.candidates[0].content.parts[0].text
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text.replace("```json", "").replace("```", "").strip()
            
            return json.loads(response_text)
        except Exception as e:
            print(f"Error in Gemini Analysis: {e}")
            return self._mock_analysis()

    def _mock_analysis(self) -> Dict[str, Any]:
        return {
            "chief_complaint": "Pending AI analysis (Check API Key)",
            "key_symptoms": [],
            "risk_flags": [],
            "urgency_level": "Medium",
            "confidence_score": 0.5,
            "evidence": "API connection not established. Using default fallback."
        }

intelligence_service = IntelligenceService()
