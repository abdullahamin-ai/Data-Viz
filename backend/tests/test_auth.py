from app.core.security import hash_password, verify_password, create_access_token, decode_access_token

def test_password_and_token():
    password = "StrongPass123!"
    hashed = hash_password(password)
    assert verify_password(password, hashed)
    token = create_access_token("123")
    assert decode_access_token(token) == "123"
