import google.generativeai as genai
import json
from typing import Dict, Any, List
from app.core.config import settings

class IntelligenceService:
    def __init__(self):
        if settings.GOOGLE_API_KEY:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def analyze_case(self, text: str, entities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Combines summarization and urgency classification into a single structured call 
        to save latency and tokens.
        """
        if not self.model:
            return self._mock_analysis()

        prompt = f"""
        You are an expert clinical triage assistant. 
        Analyze the following medical text and the extracted entities.
        
        TEXT:
        {text}
        
        EXTRACTED ENTITIES:
        {json.dumps(entities)}
        
        TASK:
        1. Summarize the case structurally: Chief Complaint, Key Symptoms, Risk Flags.
        2. Assign a Triage Urgency Level: Critical, High, Medium, or Low.
        3. Provide clinical evidence for the urgency level.
        4. Suggest potential ICD-10 or standard medical terms if not already mapped.
        
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
            response = await self.model.generate_content_async(prompt)
            # Clean response text in case it includes markdown backticks
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
