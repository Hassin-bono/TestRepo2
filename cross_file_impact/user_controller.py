"""
Sample Test File: Importer / Consumer Call Site
Use this file along with user_service.py to test GitSense's Cross-File Resolution.
"""

from demo_test_suite.cross_file_impact.user_service import fetch_user_profile

def get_current_user_profile(user_id: int):
    # 🚨 BROKEN CALL SITE: Calls fetch_user_profile with 1 argument (user_id),
    # but the updated signature requires 2 arguments (user_id, tenant_id)!
    # GitSense will flag this as a Confirmed Breaking Change / TypeError.
    profile = fetch_user_profile(user_id)
    return profile
