import spacy
import re
from typing import List

class DeidService:
    def __init__(self):
        # We use the standard web model for general entity extraction (Person, Org)
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            # Fallback if not loaded
            self.nlp = None

    def mask_pii(self, text: str, protected_entities: List[dict] = None) -> (str, List[dict]):
        """
        Masks common PII like Names, Locations, Phones, and Emails.
        Returns: (masked_text, updated_protected_entities)
        """
        if not text:
            return "", []

        spans = []

        # 1. Regex for Email
        for match in re.finditer(r'[\w\.-]+@[\w\.-]+\.\w+', text):
            spans.append((match.start(), match.end(), "EMAIL"))

        # 2. Regex for Phone
        for match in re.finditer(r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b', text):
            spans.append((match.start(), match.end(), "PHONE"))

        # 3. SpaCy NER for Person/Org/GPE
        if self.nlp:
            doc = self.nlp(text)
            for ent in doc.ents:
                if ent.label_ in ["PERSON", "ORG", "GPE"]:
                    spans.append((ent.start_char, ent.end_char, ent.label_))
        
        # 4. Filter out spans that overlap with protected entities
        if protected_entities:
            filtered_spans = []
            for s_start, s_end, s_label in spans:
                is_protected = False
                for p_ent in protected_entities:
                    if s_start < p_ent['end'] and s_end > p_ent['start']:
                        is_protected = True
                        break
                if not is_protected:
                    filtered_spans.append((s_start, s_end, s_label))
            spans = filtered_spans

        # Sort spans by start position
        spans.sort(key=lambda x: x[0])

        if not spans:
            return text, protected_entities if protected_entities else []
            
        # 5. Process Replacements and adjust offsets for protected entities
        masked_text = text
        current_entities = [dict(e) for e in protected_entities] if protected_entities else []
        
        # We replace from back to front to avoid breaking index logic of the masking itself, 
        # BUT we need to track how replacing a span at index 'i' affects entities at index > 'i'.
        # For simplicity in logic, we'll sort replacements front-to-back and track a cumulative delta.
        
        cumulative_delta = 0
        sorted_spans = sorted(spans, key=lambda x: x[0])
        
        final_text = ""
        last_idx = 0
        
        for start, end, label in sorted_spans:
            tag = f"[{label}]"
            tag_len = len(tag)
            old_len = end - start
            delta = tag_len - old_len
            
            # 1. Append text before this span
            final_text += text[last_idx:start]
            # 2. Append the tag
            final_text += tag
            
            # 3. Adjust all protected entities that occur AFTER this start point
            for ent in current_entities:
                # If the entity is after this replacement, shift its start/end
                if ent['start'] >= start:
                    ent['start'] += delta
                    ent['end'] += delta
            
            last_idx = end
            
        final_text += text[last_idx:]
        return final_text, current_entities

deid_service = DeidService()
