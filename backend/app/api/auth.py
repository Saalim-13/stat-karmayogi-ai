from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.security import create_token, current_claims, hash_password, verify_password
from app.repositories import learner_repository
from app.services.competency_engine import ROLE_MODELS

router = APIRouter(prefix="/api/auth", tags=["auth"])
LEARNER_ROLES = {"statistical-officer", "data-analyst", "survey-officer"}


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=10, max_length=128)
    role_id: str = "statistical-officer"
    preferred_language: str = Field(default="en", max_length=12)


class LoginIn(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=1, max_length=128)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterIn) -> dict:
    if req.role_id not in LEARNER_ROLES:
        raise HTTPException(status_code=422, detail="Only learner roles can self-register")
    try:
        user = learner_repository.create_identity(req.name, req.email, req.role_id, hash_password(req.password), req.preferred_language)
    except Exception as exc:
        raise HTTPException(status_code=409, detail="An account with this email already exists") from exc
    return {"user": user, "access_token": create_token(user["id"], user["role_id"]), "token_type": "bearer"}


@router.post("/login")
def login(req: LoginIn) -> dict:
    user = learner_repository.get_user_by_email(req.email)
    if not user or not verify_password(req.password, user.get("password_hash")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    safe_user = {key: value for key, value in user.items() if key != "password_hash"}
    return {"user": safe_user, "access_token": create_token(user["id"], user["role_id"]), "token_type": "bearer"}


@router.get("/me")
def me(claims: dict = Depends(current_claims)) -> dict:
    user = learner_repository.get_user(claims["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="Account no longer exists")
    return user
