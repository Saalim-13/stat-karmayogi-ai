"""Dependency-free password hashing and HS256 JWT helpers for the demo API."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

bearer = HTTPBearer(auto_error=False)


def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or hashlib.sha256(str(datetime.now(timezone.utc)).encode()).digest()[:16]
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 260_000)
    return f"pbkdf2_sha256${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}"


def verify_password(password: str, encoded: str | None) -> bool:
    if not encoded:
        return False
    try:
        algorithm, salt_text, digest_text = encoded.split("$", 2)
        if algorithm != "pbkdf2_sha256":
            return False
        candidate = hash_password(password, base64.urlsafe_b64decode(salt_text.encode()))
        return hmac.compare_digest(candidate, encoded)
    except (ValueError, UnicodeError):
        return False


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _unb64(value: str) -> bytes:
    return base64.urlsafe_b64decode((value + "=" * (-len(value) % 4)).encode())


def create_token(user_id: str, role_id: str) -> str:
    header = _b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    payload = _b64(json.dumps({"sub": user_id, "role": role_id, "exp": int((datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expiry_minutes)).timestamp())}, separators=(",", ":")).encode())
    signature = _b64(hmac.new(settings.jwt_secret.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest())
    return f"{header}.{payload}.{signature}"


def decode_token(token: str) -> dict:
    try:
        header, payload, signature = token.split(".")
        expected = _b64(hmac.new(settings.jwt_secret.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(signature, expected):
            raise ValueError("invalid signature")
        claims = json.loads(_unb64(payload))
        if int(claims["exp"]) < int(datetime.now(timezone.utc).timestamp()):
            raise ValueError("expired token")
        return claims
    except (KeyError, ValueError, UnicodeError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token") from exc


def current_claims(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> dict:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return decode_token(credentials.credentials)


def require_roles(*allowed: str):
    def dependency(claims: dict = Depends(current_claims)) -> dict:
        if claims.get("role") not in allowed:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Your role is not authorized for this action")
        return claims
    return dependency
