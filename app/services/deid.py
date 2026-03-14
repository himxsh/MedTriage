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

    def mask_pii(self, text: str, protected_entities: List[dict] = None) -> str:
        """
        Masks common PII like Names, Locations, Phones, and Emails.
        Avoids masking spans provided in protected_entities.
        """
        if not text:
            return ""

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
                    # If the PII span overlaps with a medical entity, assume medical is primary
                    if s_start < p_ent['end'] and s_end > p_ent['start']:
                        is_protected = True
                        break
                if not is_protected:
                    filtered_spans.append((s_start, s_end, s_label))
            spans = filtered_spans

        # Sort spans by start position, then end position
        spans.sort(key=lambda x: x[0])

        if not spans:
            return text
            
        merged_spans = []
        curr_start, curr_end, curr_label = spans[0]
        
        for next_start, next_end, next_label in spans[1:]:
            if next_start < curr_end:
                curr_end = max(curr_end, next_end)
            else:
                merged_spans.append((curr_start, curr_end, curr_label))
                curr_start, curr_end, curr_label = next_start, next_end, next_label
        merged_spans.append((curr_start, curr_end, curr_label))

        # Replace from back to front
        for start, end, label in sorted(merged_spans, key=lambda x: x[0], reverse=True):
            text = text[:start] + f"[{label}]" + text[end:]

        return text

deid_service = DeidService()
