/** India ED quick-intake templates — B1.3. Prefill hints; clinician edits freely. */
export interface IntakeTemplate {
  id: string;
  labelEn: string;
  labelHi: string;
  hint: string;
}

export const INDIA_ED_TEMPLATES: IntakeTemplate[] = [
  {
    id: 'chest_pain',
    labelEn: 'Chest pain',
    labelHi: 'सीने में दर्द',
    hint:
      'Chief complaint: chest pain.\nOnset: \nSeverity (1-10): \nRadiation: \nAssociated: SOB / diaphoresis / nausea / syncope\nCardiac hx / risk factors: \nECG done?: \n',
  },
  {
    id: 'fever',
    labelEn: 'Fever',
    labelHi: 'बुखार',
    hint:
      'Chief complaint: fever.\nDuration: \nMax temperature: \nChills / rigor: \nCough / urine / rash / travel: \nHydration / oral intake: \n',
  },
  {
    id: 'trauma',
    labelEn: 'Trauma',
    labelHi: 'चोट / ट्रॉमा',
    hint:
      'Chief complaint: trauma.\nMechanism (RTA / fall / assault): \nTime of injury: \nLOC / amnesia: \nBleeding / deformity / open wounds: \nTetanus status: \n',
  },
  {
    id: 'breathlessness',
    labelEn: 'Breathlessness',
    labelHi: 'सांस फूलना',
    hint:
      'Chief complaint: breathlessness.\nOnset / duration: \nAt rest or exertion: \nWheeze / cough / chest pain: \nSpO2 if known: \nAsthma / COPD / cardiac hx: \n',
  },
  {
    id: 'abdominal',
    labelEn: 'Abdominal pain',
    labelHi: 'पेट दर्द',
    hint:
      'Chief complaint: abdominal pain.\nLocation / radiation: \nOnset: \nVomiting / diarrhea / constipation: \nFever / urinary symptoms: \nLMP / pregnancy possible: \n',
  },
  {
    id: 'pregnancy',
    labelEn: 'Pregnancy-related',
    labelHi: 'गर्भावस्था संबंधी',
    hint:
      'Chief complaint: pregnancy-related concern.\nGestational age / LMP: \nBleeding / pain / discharge: \nFetal movements: \nBP / headache / vision changes: \nANC site: \n',
  },
  {
    id: 'snake_bite',
    labelEn: 'Snake bite',
    labelHi: 'साँप काटने',
    hint:
      'Chief complaint: snake bite.\nTime of bite: \nSite of bite: \nSnake seen / type if known: \nLocal swelling / bleeding / neuro symptoms: \nTourniquet used?: \nASV given?: \n',
  },
  {
    id: 'stroke_symptom',
    labelEn: 'Stroke symptoms',
    labelHi: 'स्ट्रोक लक्षण',
    hint:
      'Chief complaint: possible stroke.\nLast known well: \nFace / arm / speech (FAST): \nGlucose if known: \nBP: \nPrior stroke / AF: \n',
  },
];
