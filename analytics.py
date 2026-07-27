# analytics.py

from orders import process_order

def generate_daily_report():
    order_data = process_order(order_id=101, user_id=42)
    return f"Processed order for {order_data['user']['name']}"
