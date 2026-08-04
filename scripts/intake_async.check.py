# Smoke: intake must not call sync NLP on the event loop.
from pathlib import Path

src = Path(__file__).resolve().parents[1].joinpath("app/api/v1/intake.py").read_text()
assert "asyncio.to_thread" in src, "intake must offload sync NLP via asyncio.to_thread"
assert "await asyncio.to_thread(nlp_service.extract_clinical_data" in src
assert "await asyncio.to_thread(nlp_service.transcribe_audio" in src
print("intake_async.check: ok")
