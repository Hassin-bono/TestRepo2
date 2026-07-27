# users.py

def get_user_details(user_id: int):
    """
    Fetch user details from database.
    Updated signature: 'include_metadata' parameter removed.
    """
    return {"id": user_id, "name": "Jane Doe"
