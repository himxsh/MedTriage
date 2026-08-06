"""Password hashing and session tokens — stdlib only (no passlib/bcrypt dep)."""
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Optional

# ponytail: pbkdf2 ceiling ~100k iters; upgrade path = argon2id if audit requires
_PBKDF2_ITERS = 200_000
_SALT_LEN = 16
SESSION_TTL_HOURS = 12
SESSION_COOKIE = "mt_session"
LOCKOUT_AFTER = 5
LOCKOUT_MINUTES = 15


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(_SALT_LEN)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, _PBKDF2_ITERS)
    return f"pbkdf2_sha256${_PBKDF2_ITERS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algo, iters_s, salt_hex, digest_hex = password_hash.split("$", 3)
        if algo != "pbkdf2_sha256":
            return False
        iters = int(iters_s)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(digest_hex)
        digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iters)
        return hmac.compare_digest(digest, expected)
    except (ValueError, TypeError):
        return False


def new_session_token() -> str:
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def session_expiry(now: Optional[datetime] = None) -> datetime:
    return (now or datetime.utcnow()) + timedelta(hours=SESSION_TTL_HOURS)
