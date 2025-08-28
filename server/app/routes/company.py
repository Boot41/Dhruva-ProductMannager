from fastapi import APIRouter, Depends, status, HTTPException
import logging
from sqlalchemy.orm import Session
from typing import List

from app import schema as schemas
from app.core.db import get_db
from app.models import User

router = APIRouter(prefix="/company", tags=["company"])
logger = logging.getLogger(__name__)

# Search employees by name within a company
@router.get("/{company_name}/employees/search", response_model=List[schemas.UserOut])
def search_employees_by_name(
    company_name: str,
    q: str,
    db: Session = Depends(get_db)
):
    try:
        employees = ( 
            db.query(User)
            .filter(User.company == company_name)
            .filter(User.name.ilike(f"{q}%"))  # case-insensitive, starts with query
            .all()
        )
        return employees
    except Exception as e:
        logger.error(f"Error searching employees in {company_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search employees: {str(e)}"
        )