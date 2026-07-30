"""
Sample Test File: Public Interface / Signature Change (Module Provider)
Use this file along with user_controller.py to test GitSense's AST Signature Mismatch & Cross-file Broken Call Site Detection.
"""

# BEFORE signature: def fetch_user_profile(user_id: int):
# AFTER signature (BREAKING CHANGE): Added new required parameter 'tenant_id' without a default value

def fetch_user_profile(user_id: int, tenant_id: str):
    """Fetch user profile scoped by tenant_id."""
    return {
        "user_id": user_id,
        "tenant_id": tenant_id,
        "name": "Jane Doe",
        "status": "active"
    }
