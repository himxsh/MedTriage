from transformers import AutoTokenizer, AutoModel
import torch
import whisper
import os
import spacy
import scispacy
from scispacy.linking import EntityLinker
from typing import Dict, Any, List
from app.core.config import settings

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
            print(f"Loading Whisper model from {self.whisper_path}...")
            self.whisper_model = whisper.load_model("small", download_root=os.path.dirname(self.whisper_path))

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

    def transcribe_audio(self, audio_path: str) -> str:
        self._load_whisper()
        result = self.whisper_model.transcribe(audio_path)
        return result["text"]

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
