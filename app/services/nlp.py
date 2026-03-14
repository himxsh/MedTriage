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

    def load_models(self):
        """Lazy load models to save memory during startup"""
        if not self.whisper_model:
            print(f"Loading Whisper model from {self.whisper_path}...")
            self.whisper_model = whisper.load_model("small", download_root=os.path.dirname(self.whisper_path))
        
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

        if not self.bert_model:
            print(f"Loading Relationship BERT model from {self.bert_path}...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.bert_path)
            self.bert_model = AutoModel.from_pretrained(self.bert_path)

    def transcribe_audio(self, audio_path: str) -> str:
        self.load_models()
        result = self.whisper_model.transcribe(audio_path)
        return result["text"]

    def extract_clinical_data(self, text: str) -> Dict[str, Any]:
        self.load_models()
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
        Relationship extraction using BERT. 
        Note: Since we use a base BertModel, we implement a heuristic-semantic 
        bridge to identify Onset, Duration, and Aggravating correlations.
        """
        self.load_models()
        relations = []
        
        # Simple heuristic: look for symptoms followed by temporal or descriptive offsets
        # In a real E2E model, this would be a classification head over entity pairs.
        for i, ent1 in enumerate(entities):
            for j, ent2 in enumerate(entities):
                if i == j: continue
                
                # Logic: If Symptoms and Time/Location appear close, link them
                dist = abs(ent1['start'] - ent2['start'])
                if dist < 50: # Within same clause/sentence range
                    if ent1['label'] == 'DISEASE' and 'time' in ent2['text'].lower():
                        relations.append({"source": ent1['text'], "target": ent2['text'], "type": "Onset"})
                    elif ent1['label'] == 'DISEASE' and ('radiate' in text.lower() or 'left' in ent2['text'].lower()):
                        relations.append({"source": ent1['text'], "target": ent2['text'], "type": "Lateralization/Radiation"})

        return relations

nlp_service = NLPService()
