from datetime import datetime, timedelta, timezone
from typing import Any, Union
import hashlib
import bcrypt
from jose import jwt
from ..config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # We continue to pre-hash with sha256 to bypass the 72-byte limit.
    # We must ensure we use the same deterministic input for verification.
    password_hash = hashlib.sha256(plain_password.encode('utf-8')).hexdigest().encode('utf-8')
    return bcrypt.checkpw(password_hash, hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    # We pre-hash with sha256 to bypass bcrypt's 72-byte limit.
    password_hash = hashlib.sha256(password.encode('utf-8')).hexdigest().encode('utf-8')
    # Generate a salt and hash the password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_hash, salt)
    return hashed.decode('utf-8')


def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:

    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def decode_access_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
