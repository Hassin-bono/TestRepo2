from services.user_service import fetch_user_data, validate_user_access


def handle_get_profile(user_id: int):
    # Calls fetch_user_data with positional user_id and relies on default include_details
    user_info = fetch_user_data(user_id)
    is_allowed = validate_user_access(user_id, "admin")
    return {"user": user_info, "authorized": is_allowed}
