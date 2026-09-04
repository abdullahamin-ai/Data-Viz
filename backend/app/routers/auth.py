import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.user import SignupRequest, LoginRequest, AuthResponse, UserOut
from app.routers.deps import current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])
log = logging.getLogger("auth")

@router.get("/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    # Purane sessions ke liye jinke localStorage mein token to hai lekin email
    # save nahi hui thi (login se pehle wale build mein) -- frontend token
    # milte hi ye call karke email fetch/save kar leta hai taake "Signed in
    # as Unknown" na dikhe.
    return user

@router.post("/signup", response_model=AuthResponse, status_code=201)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(409, "An account with this email already exists.")
    user = User(email=payload.email.lower(), password_hash=hash_password(payload.password))
    db.add(user); db.commit(); db.refresh(user)
    log.info("AUTH_SUCCESS | action=signup | user_id=%s", user.id)
    return AuthResponse(access_token=create_access_token(str(user.id)), user=user)

@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        log.warning("AUTH_ERROR | action=login | reason=invalid_credentials")
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password.")
    return AuthResponse(access_token=create_access_token(str(user.id)), user=user)

@router.post("/token", response_model=AuthResponse)
def token(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Swagger's "Authorize" dialog posts here as application/x-www-form-urlencoded
    # (username/password/client_id/client_secret) instead of JSON -- that's the
    # OAuth2 password-flow shape the dialog expects, wired up in deps.py's
    # oauth2_scheme. client_id/client_secret are accepted for parity with that
    # form (Swagger always sends the fields it renders) but this app has no
    # registered OAuth client apps, so only username (email) + password are
    # actually checked here -- same check as /api/auth/login.
    user = db.query(User).filter(User.email == form.username.lower()).first()
    if not user or not verify_password(form.password, user.password_hash):
        log.warning("AUTH_ERROR | action=token | reason=invalid_credentials")
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password.")
    return AuthResponse(access_token=create_access_token(str(user.id)), user=user)