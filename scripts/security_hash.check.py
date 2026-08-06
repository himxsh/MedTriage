#!/usr/bin/env python3
"""ponytail: one check for password hash verify — fails if logic breaks."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.security import hash_password, verify_password, hash_token, new_session_token

h = hash_password("correct-horse")
assert verify_password("correct-horse", h)
assert not verify_password("wrong", h)
assert hash_token("a") != hash_token("b")
assert len(new_session_token()) >= 32
print("✓ security hash check passed")
