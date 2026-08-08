from transformers import AutoTokenizer, AutoModel
import torch
import whisper
import os
import spacy
import scispacy
from scispacy.linking import EntityLinker
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types
from app.core.config import settings
from app.services.stt import (
    gemini_stt_prompt,
    pick_stt_plan,
    resolve_whisper_language,
    should_fallback_to_gemini,
    sniff_audio_mime,
)

class NLPService:
    def __init__(self):
        self.whisper_model = None
        self.nlp_ner = None
        self.tokenizer = None
        self.bert_model = None
        self.whisper_path = settings.WHISPER_MODEL_PATH
        self.scispacy_path = settings.SCISPACY_MODEL_PATH
        self.bert_path = settings.CLINICAL_BERT_PATH

    def _load_whisper(self):
        """Lazy load Whisper model only for audio processing."""
        if not self.whisper_model:
            size = (settings.WHISPER_MODEL_SIZE or "small").strip() or "small"
            print(f"Loading Whisper '{size}' from {self.whisper_path}...")
            self.whisper_model = whisper.load_model(
                size, download_root=os.path.dirname(self.whisper_path)
            )

    def _load_ner(self):
        """Lazy load scispaCy for Clinical NER."""
        if not self.nlp_ner:
            print(f"Loading scispaCy model from {self.scispacy_path}...")
            full_path = os.path.join(os.getcwd(), self.scispacy_path)
            self.nlp_ner = spacy.load(full_path)
            
            print("Adding scispaCy EntityLinker (UMLS)...")
            self.nlp_ner.add_pipe(
                "scispacy_linker", 
                config={
                    "resolve_abbreviations": True, 
                    "linker_name": "umls",
                    "max_entities_per_mention": 3
                }
            )

    def _load_bert(self):
        """Lazy load ClinicalBERT for relationship extraction."""
        if not self.bert_model:
            print(f"Loading Relationship BERT model from {self.bert_path}...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.bert_path)
            self.bert_model = AutoModel.from_pretrained(self.bert_path)

    def _transcribe_whisper(self, audio_path: str, language_hint: Optional[str]) -> str:
        self._load_whisper()
        lang = resolve_whisper_language(language_hint)
        if lang is None and settings.WHISPER_LANGUAGE:
            lang = resolve_whisper_language(settings.WHISPER_LANGUAGE)
        kwargs: Dict[str, Any] = {}
        if lang:
            kwargs["language"] = lang
        result = self.whisper_model.transcribe(audio_path, **kwargs)
        return (result.get("text") or "").strip()

    def _transcribe_gemini(
        self, audio_path: str, language_hint: Optional[str], mime_type: Optional[str]
    ) -> str:
        if not settings.GOOGLE_API_KEY:
            raise RuntimeError("GOOGLE_API_KEY required for Gemini STT")

        with open(audio_path, "rb") as f:
            data = f.read()
        mime = sniff_audio_mime(audio_path, mime_type)
        client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        # Same flash family as triage; multimodal STT is good enough for pilot spike
        model_id = "gemini-3.1-flash-lite-preview"
        response = client.models.generate_content(
            model=model_id,
            contents=[
                types.Part.from_bytes(data=data, mime_type=mime),
                gemini_stt_prompt(language_hint),
            ],
        )
        text = (getattr(response, "text", None) or "").strip()
        if not text:
            raise RuntimeError("Gemini STT returned empty transcript")
        return text

    def transcribe_audio(
        self,
        audio_path: str,
        language: Optional[str] = None,
        mime_type: Optional[str] = None,
    ) -> str:
        """Transcribe intake audio. language: hi|en|auto from UI; mime for Gemini."""
        plan = pick_stt_plan(
            settings.STT_BACKEND,
            whisper_ok=True,
            gemini_ok=bool(settings.GOOGLE_API_KEY),
        )
        last_err: Optional[Exception] = None
        for backend in plan:
            try:
                if backend == "whisper":
                    text = self._transcribe_whisper(audio_path, language)
                    if "gemini" in plan and should_fallback_to_gemini(text):
                        print("Whisper transcript empty/short — trying Gemini STT")
                        continue
                    return text
                if backend == "gemini":
                    return self._transcribe_gemini(audio_path, language, mime_type)
            except Exception as e:
                last_err = e
                print(f"STT backend {backend} failed: {e}")
                continue
        if last_err:
            raise last_err
        raise RuntimeError("STT produced no transcript")

    def extract_clinical_data(self, text: str) -> Dict[str, Any]:
        self._load_ner()
        doc = self.nlp_ner(text)
        
        entities = []
        linker = self.nlp_ner.get_pipe("scispacy_linker")
        
        for ent in doc.ents:
            entity_data = {
                "text": ent.text,
                "label": ent.label_,
                "start": ent.start_char,
                "end": ent.end_char,
                "mappings": []
            }
            
            for umls_ent in ent._.kb_ents:
                cui, score = umls_ent
                kb_entry = linker.kb.cui_to_entity[cui]
                entity_data["mappings"].append({
                    "cui": cui,
                    "name": kb_entry.canonical_name,
                    "score": float(score)
                })
            
            entities.append(entity_data)
            
        return {"entities": entities}

    def extract_relationships(self, text: str, entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Hybrid Relationship Extraction:
        Combines entity-to-entity linking with contextual keyword scanning (Smart Context).
        Includes basic negation detection to avoid linking denied symptoms.
        """
        self._load_bert()
        relations = []
        text_lower = text.lower()
        
        # 1. Broad Negation Detection (within a window)
        negation_markers = ["no ", "none", "denies", "denied", "negative", "without", "absent"]
        
        # 2. Key Clinical Modifiers to look for
        modifiers = {
            "Lateralization/Radiation": ["radiat", "spread", "move", "left", "right", "arm", "jaw", "back", "leg", "neck"],
            "Temporal/Onset": ["since", "became", "started", "onset", "began", "prior", "lasted", "frequency"],
            "Severity/Nature": ["severe", "sharp", "dull", "crushing", "mild", "persistent", "constant"]
        }

        for ent in entities:
            # We focus on connecting modifiers to Diseases/Symptoms
            if ent['label'] != 'DISEASE':
                continue
                
            # Define context window (approx 60 chars before/after)
            start_win = max(0, ent['start'] - 65)
            end_win = min(len(text_lower), ent['end'] + 65)
            context = text_lower[start_win:end_win]
            
            # Check for negation in immediate context
            is_negated = any(marker in text_lower[max(0, ent['start']-20):ent['start']] for marker in negation_markers)
            if is_negated:
                continue

            # Scan for modifiers in the context window
            for rel_type, keywords in modifiers.items():
                found_keywords = [kw for kw in keywords if kw in context]
                if found_keywords:
                    # Create the relation
                    # We use the first found keyword as a proxy for the 'target' if no ent2 exists
                    relations.append({
                        "source": ent['text'],
                        "type": rel_type,
                        "evidence": f"...{context.strip()}...",
                        "indicators": found_keywords[:2] # Top 2 indicators
                    })

        # 3. Deduplicate (if multiple keywords triggered the same rel_type for same entity)
        unique_relations = []
        seen = set()
        for r in relations:
            key = (r['source'], r['type'])
            if key not in seen:
                unique_relations.append(r)
                seen.add(key)

        return unique_relations

nlp_service = NLPService()
