def fetch_user_data(user_id: int, include_details: bool = True) -> dict:
    """Fetch user profile details from database."""
    return {"user_id": user_id, "active": True}


def validate_user_access(user_id: int, role: str) -> bool:
    """Check user permissions for given role."""
    return role == "admin"
