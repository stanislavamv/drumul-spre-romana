"""Regenerate audio-manifest.js from whatever clips are currently in audio/.

Runs independently of the downloader, so the manifest can be rebuilt mid-fetch
or after dropping in hand-made recordings. Shares fetch_audio.write_manifest(),
so there is exactly one implementation and the two cannot drift apart.

Passes force=True: rebuilding from the full ro-strings.json is the recovery
path when the manifest is already wrong, so the shrink guard would only get in
the way here.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fetch_audio import write_manifest  # noqa: E402

write_manifest(force=True)
