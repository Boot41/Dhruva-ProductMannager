import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app import schema as schemas

from app.models.user import User
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)

logger = logging.getLogger(__name__)


# Domain-level exceptions (service layer should not depend on FastAPI)
class EmailAlreadyRegisteredError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


class InvalidTokenError(Exception):
    pass


class UserNotFoundError(Exception):
    pass


def register_user(user_in: schemas.UserCreate, db: Session) -> User:
    """Register a new user or raise EmailAlreadyRegisteredError if email/username exists."""
    # Check for existing email or username
    existing = (
        db.query(User)
        .filter((User.email == user_in.email) | (User.username == user_in.username))
        .first()
    )
    if existing:
        raise EmailAlreadyRegisteredError("Email or username already registered")

    # Hash password and create user
    hashed = hash_password(user_in.password)
    user = User(
        name=user_in.name,
        username=user_in.username,
        hashed_password=hashed,
        email=user_in.email,
        role=user_in.role or "user",
        company=user_in.company,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # In case of race condition where another request created same email/username
        raise EmailAlreadyRegisteredError("Email or username already registered")
    db.refresh(user)
    return user


def login_user(credentials: schemas.UserLogin, db: Session) -> schemas.Token:
    """Authenticate user and return Token with is_theater_admin flag. Raises 401 on failure."""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        logger.info(f"Login failed: email not found: {credentials.email}")
        raise InvalidCredentialsError("Invalid credentials")

    if not verify_password(credentials.password, user.hashed_password):
        logger.info(f"Login failed: password mismatch for user_id={user.id} email={user.email}")
        raise InvalidCredentialsError("Invalid credentials")

    token = create_access_token(subject=user.id)
    return schemas.Token(access_token=token)


def get_current_user_from_token(token: str, db: Session) -> User:
    """Decode token and return the corresponding user or raise 401."""
    data = decode_access_token(token)
    if not data or "sub" not in data:
        raise InvalidTokenError("Invalid token")
    user_id = int(data["sub"])
    user = db.get(User, user_id)
    if not user:
        raise UserNotFoundError("User not found")
    return user