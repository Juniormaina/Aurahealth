#!/usr/bin/env python3
"""Optional local engine hook for local-free-motion.

Never calls paid APIs. Default path restamps the procedural JSON/PNG.
If LOCAL_SVD_SCRIPT points at a local open-weight wrapper, that script is
executed instead (still a local subprocess).
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json-path", required=True)
    parser.add_argument("--engine", default="python")
    parser.add_argument("--prompt", default="")
    args = parser.parse_args()

    json_path = Path(args.json_path)
    if not json_path.exists():
        print(json.dumps({"ok": False, "error": f"missing frame json: {json_path}"}))
        return 1

    payload = json.loads(json_path.read_text(encoding="utf-8"))
    svd = os.environ.get("LOCAL_SVD_SCRIPT", "").strip()

    if args.engine == "svd" and svd:
        script = Path(svd)
        if not script.exists():
            print(json.dumps({
                "ok": False,
                "engine": "svd",
                "error": f"LOCAL_SVD_SCRIPT not found: {script}",
                "fallback": "procedural",
            }))
            return 2
        proc = subprocess.run(
            [sys.executable, str(script), "--json-path", str(json_path), "--prompt", args.prompt],
            check=False,
            capture_output=True,
            text=True,
        )
        print(json.dumps({
            "ok": proc.returncode == 0,
            "engine": "svd",
            "returncode": proc.returncode,
            "stdout": proc.stdout[-4000:],
            "stderr": proc.stderr[-2000:],
        }))
        return 0 if proc.returncode == 0 else 3

    payload["python_hook"] = {
        "engine": args.engine,
        "ok": True,
        "note": "Local Python hook acknowledged the procedural frame. No commercial renderer invoked.",
    }
    json_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps({
        "ok": True,
        "engine": "python",
        "json_path": str(json_path),
        "cost": 0,
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
