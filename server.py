def start_server():
    host = get_config("host")
    port = get_config("port")
    debug = get_config("debug")

    print(f"Starting server on {host}:{port}")
    print(f"Debug mode: {'enabled' if debug else 'disabled'}")


if __name__ == "__main__":
    start_server()
