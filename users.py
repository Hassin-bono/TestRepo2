def get_user(id, include_metadata=True):
    user = {
        "id": id,
        "name": "Alice",
    }

    if include_metadata:
        user["metadata"] = {
            "created_at": "2026-07-24T12:00:00Z",
            "source": "database",
        }

    return user
