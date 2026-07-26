def show_profile(user_id):
    user = get_user(user_id)

    print("=== User Profile ===")
    print(f"ID: {user['id']}")
    print(f"Name: {user['name']}")


def show_profiles(user_ids):
    for user_id in user_ids:
        show_profile(user_id)


if __name__ == "__main__":
    show_profiles([1, 2, 3])
