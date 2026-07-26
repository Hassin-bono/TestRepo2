def get_config():
    settings = {
        "debug": True,
        "host": "localhost",
        "port": 8080,
    }

    return settings.get(key)
