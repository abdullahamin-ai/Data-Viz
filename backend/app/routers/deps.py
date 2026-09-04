from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.security import decode_access_token
from app.models.user import User

# tokenUrl only tells Swagger's "Authorize" dialog which endpoint to POST
# username/password/client_id/client_secret to for its built-in OAuth2
# password-flow login form. It does not change how tokens that were already
# issued by /api/auth/login, /api/auth/signup, or /api/auth/token are
# validated below -- that's still the same JWT decode as before.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

def current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    try:
        user_id = int(decode_access_token(token))
    except Exception:
        raise HTTPException(401, "Invalid or expired authentication token.")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(401, "User no longer exists.")
    return user