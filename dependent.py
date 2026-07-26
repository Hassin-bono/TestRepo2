


def print_user_profile(user_id: int):
    # Existing usage that relies on the optional parameter.
    user = get_user(user_id, include_metadata=True)

    print(f"User: {user['name']} ({user['id']})")

    metadata = user.get("metadata")
    if metadata:
        print(f"Created: {metadata['created_at']}")
        print(f"Source: {metadata['source']}")


if __name__ == "__main__":
    print_user_profile(42)
