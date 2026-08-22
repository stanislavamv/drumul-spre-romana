"""Serve the course over HTTP for local development.

WHY THIS EXISTS
    `python -m http.server 8777` works fine, and CLAUDE.md still documents it.
    But the port is baked into the command, so two sessions cannot run at once
    — the second fails with "port in use" and the first is not necessarily
    yours to stop.

    This wrapper takes the port from the PORT environment variable, which is
    how the preview tooling assigns one, and falls back to 8777 so the
    documented behaviour is unchanged when PORT is unset.

USAGE
    python tools/serve.py            # PORT env var, else 8777
    python tools/serve.py 9000       # explicit override
"""

import contextlib
import http.server
import os
import socket
import socketserver
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def chosen_port():
    """Explicit argument wins, then PORT, then the historical default."""
    if len(sys.argv) > 1:
        return int(sys.argv[1])
    env = os.environ.get("PORT", "").strip()
    return int(env) if env else 8777


class Server(socketserver.TCPServer):
    # Without this a restart within the TIME_WAIT window fails to bind, which
    # during development is most restarts.
    allow_reuse_address = True

    # Serving on ANY host would expose the whole directory tree to the network.
    # This is a development server for one machine.
    address_family = socket.AF_INET


def main():
    os.chdir(ROOT)
    port = chosen_port()
    handler = http.server.SimpleHTTPRequestHandler
    with contextlib.closing(Server(("127.0.0.1", port), handler)) as httpd:
        print("serving %s on http://127.0.0.1:%d/index.html" % (ROOT, port))
        sys.stdout.flush()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nstopped")


if __name__ == "__main__":
    main()
