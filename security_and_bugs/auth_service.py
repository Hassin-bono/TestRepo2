"""
Sample Test File: Security & Runtime Bug Scenarios
Use this file to test GitSense AI's Security Reviewer and Bug Predictor.
"""

def authenticate_user(db_connection, username_input: str, password_input: str):
    # 🚨 SECURITY BUG: SQL Injection via raw f-string query formatting
    raw_query = f"SELECT * FROM users WHERE username = '{username_input}' AND password = '{password_input}'"
    cursor = db_connection.cursor()
    cursor.execute(raw_query)
    user_record = cursor.fetchone()
    
    # 🚨 RUNTIME BUG: Unvalidated property access / potential None dereference
    # If user_record is None, user_record["role"] will raise TypeError / AttributeError
    user_role = user_record["role"]
    
    # 🚨 UNDEFINED VARIABLE BUG: References variable 'auth_logger' which is not defined or imported
    auth_logger.info(f"User {username_input} logged in with role {user_role}")
    
    return {"user_id": user_record["id"], "role": user_role}
