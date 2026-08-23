# Self-hosting

Running this on a machine you control, reachable from your own devices
wherever you are, rather than only from the one computer it's checked out on.

## Where this sits relative to `GITHUB.md`

`docs/GITHUB.md` blocks making the repository *public* on one thing that
isn't fixable by a settings change: `audio/` is Google Translate TTS output,
fine for personal study and not licensed for redistribution. Self-hosting
for **just yourself**, reachable only from your own authenticated devices,
is the same posture as running it locally — nobody else's request ever
reaches the audio files. That reasoning stops holding the moment "reachable
by me" becomes "reachable by anyone with the link"; treat that as reopening
the question `GITHUB.md` already goes through, not as a settings toggle.

## Shape of the setup

A container on your own hardware, running `tools/serve.py` under systemd,
reachable over [Tailscale Serve](https://tailscale.com/kb/1312/serve) rather
than a port opened to the public internet. That combination is what removes
most of the usual self-hosting work:

- No TLS certificate to manage — Tailscale Serve provisions one for the
  `*.ts.net` hostname it gives the container.
- No port-forward on your router, so there is nothing for the public
  internet to find. `serve.py` stays bound to `127.0.0.1`, its default —
  Tailscale Serve is what actually faces your tailnet, proxying in to that
  loopback port. The service never needs `HOST=0.0.0.0` in this setup.
- No auth system to write — reachability *is* the access control, scoped to
  devices signed into your tailnet.

## 1. The container

An LXC container is enough — this is a single-threaded-per-request static
file server plus a 6 KB `state.js`, not a workload that benefits from a
full VM's isolation. Debian or Ubuntu, Python 3 (already present on most
templates), and `curl` for the install steps below.

## 2. Get the files onto it

The repo is private, so the least-setup path for a box on your own network
is `rsync` straight from wherever you have it checked out, rather than
provisioning a deploy key for a one-machine copy:

```bash
rsync -avz --exclude .git \
  "/path/to/limba romana/claude portal project/" \
  user@container:/opt/ro-course/
```

**Include `audio/` and `audio-manifest.js` in that copy.** Both are
gitignored build artefacts (`docs/AUDIO.md`) — `rsync` will happily carry
them since it works on the filesystem, not git — and the container has no
reason to regenerate them by running the fetch pipeline itself. That
pipeline is deliberately slow and gentle against Google's endpoint
(`docs/AUDIO.md` — single-threaded, 1.1–2.4 s delay per clip, ~2 h cold); a
fresh fetch for 6,177 clips you already have on disk elsewhere would be
pointless load against an endpoint the project is careful not to hammer.

## 3. Run it as a service

Copy [`deploy/ro-course.service`](../deploy/ro-course.service) to
`/etc/systemd/system/ro-course.service` on the container, adjust its
`WorkingDirectory` and `User`/`Group` to match how you laid the files out,
then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ro-course
sudo systemctl status ro-course
curl -sI http://127.0.0.1:8777/index.html   # expect 200 OK, from on-box
```

## 4. Reach it from your tailnet

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
sudo tailscale serve https / http://localhost:8777
```

**`serve`, not `funnel`.** `tailscale funnel` opens the service to the
public internet through Tailscale's relay — the opposite of what "just me,
remotely" means here. `tailscale serve` keeps it tailnet-only. Worth
double-checking which one a command actually ran, since they're one flag
apart and only one of them matches the audio-licensing reasoning above.

From any other device on the tailnet:

```
https://<container-hostname>.<your-tailnet>.ts.net/index.html
```

## 5. Updating content later

After editing locally and running `tools/stamp_assets.py` (required for any
JS/CSS edit — see `CLAUDE.md`), sync the changed files over and restart:

```bash
rsync -avz --exclude .git --exclude audio --exclude audio-manifest.js \
  "/path/to/limba romana/claude portal project/" \
  user@container:/opt/ro-course/
ssh user@container sudo systemctl restart ro-course
```

`audio/` and `audio-manifest.js` are excluded from this pass deliberately —
they only need copying once, and re-syncing 92 MB on every content edit
would make "update the server" much slower than it needs to be. Re-sync
them only after actually regenerating audio.

## Progress data does not follow you here

`localStorage` is scoped per browser origin (`README.md` — no accounts, no
sync). The self-hosted copy starts blank the first time you open it, even
though it's the same course you've been studying locally. Use the existing
transfer-code or file export/import in Settings to move progress across —
which, usefully, is the exact code path that was just hardened against
malformed input, so moving a real save through it is now a validated
operation rather than a leap of faith.

## If you decide against Tailscale

The `HOST` environment variable `serve.py` now reads exists for this case:
set `HOST=0.0.0.0` (or a specific interface) in the unit's `[Service]`
section if you want `serve.py` reachable directly on the container's own
address instead of fronted by `tailscale serve`. Doing that puts the
network boundary back on you — same caution `serve.py`'s own docstring
gives: nothing should port-forward that address to the public internet
unless "reachable by anyone with the link" is actually the intent, in which
case see the note at the top of this document first.
