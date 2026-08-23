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


class Server(socketserver.ThreadingMixIn, socketserver.TCPServer):
    # Threading is not an optimisation here, it is required. A plain TCPServer
    # handles one connection at a time, and HTTP/1.1 keep-alive means the
    # browser holds that connection open waiting to reuse it. index.html pulls
    # in forty-odd scripts over about six parallel connections, so the first
    # one parks on the server and every other request queues behind it: the
    # page stops loading after the first <script src>, and even curl cannot
    # connect. `python -m http.server` does not have this problem because its
    # command line has used ThreadingHTTPServer since Python 3.7 — this class
    # has to match it.
    daemon_threads = True

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
    # TCPServer is its own context manager and closes the socket on exit.
    # contextlib.closing() looks equivalent but calls .close(), which
    # socketserver does not define — it is server_close() — so wrapping it
    # turned every Ctrl+C into an AttributeError traceback after "stopped".
    with Server(("127.0.0.1", port), handler) as httpd:
        print("serving %s on http://127.0.0.1:%d/index.html" % (ROOT, port))
        sys.stdout.flush()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nstopped")


if __name__ == "__main__":
    main()
