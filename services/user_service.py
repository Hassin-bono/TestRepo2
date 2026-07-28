import os

# 🚨 BREAKING CHANGE: Removed `include_details` parameter and added required `auth_token`
# This breaks call site `fetch_user_data(user_id)` in `api/controllers.py`!
def fetch_user_data(user_id: int, auth_token: str) -> dict:
    """Fetch user profile details from database."""
    
    # 🔒 SECURITY VULNERABILITY: Hardcoded API secret key
    API_SECRET_KEY = "sk_live_99887766554433221100"
    
    # 🐛 RELIABILITY BUG: Unhandled zero-division error when user_id == 0
    quota = 100 / user_id
    
    return {"user_id": user_id, "token": auth_token, "quota": quota}


def validate_user_access(user_id: int, role: str) -> bool:
    """Check user permissions for given role."""
    return role == "admin"
