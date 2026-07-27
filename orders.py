# orders.py

from users import get_user_details

def process_order(order_id: int, user_id: int):
    # BROKEN CALL SITE: passes 'include_metadata=True' which is no longer accepted
    user = get_user_details(user_id, include_metadata=True)
    return {
        "order_id": order_id,
        "user": user,
        "status": "processed"
    }
