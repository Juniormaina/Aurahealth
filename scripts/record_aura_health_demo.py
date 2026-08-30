#!/usr/bin/env python3
"""
Aura Health — cinematic browser walkthrough recorder (Playwright).

Records a ~25s 1920x1080 walkthrough of https://aurahealth-delta.vercel.app/
and writes aura_health_demo.mp4 in the project root (or --out).

Setup:
  python -m venv .venv-demo
  .venv-demo\\Scripts\\pip install -r scripts/requirements-demo.txt
  .venv-demo\\Scripts\\python -m playwright install chromium
  .venv-demo\\Scripts\\python scripts/record_aura_health_demo.py

Usage:
  python scripts/record_aura_health_demo.py
  python scripts/record_aura_health_demo.py --url http://127.0.0.1:3000
  python scripts/record_aura_health_demo.py --out ./aura_health_demo.mp4
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import Page, sync_playwright

DEFAULT_URL = "https://aurahealth-delta.vercel.app/"
VIEWPORT = {"width": 1920, "height": 1080}
DEVICE_SCALE = 1.25  # slight cinematic “retina” density without blowing file size
TARGET_FPS = 60
REFLECTION = "Feeling a bit overwhelmed with work today"

# Guarantee glass / landscape polish while recording (production CSS can vary by CDN cache).
STYLING_INJECTOR = """
html { scroll-behavior: smooth !important; }
body {
  background: linear-gradient(180deg, #1e3b2b 0%, #0d1f17 100%) !important;
  background-attachment: fixed !important;
}
.glass-panel, .aura-card, .aura-card-gradient, .aura-module-card,
.landing-hero-header, .navbar-gradient, .modal-sheet, .sidebar, .astra-glass {
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28), 0 0 24px rgba(126, 217, 205, 0.18) !important;
}
.hero-scene-shade {
  background:
    radial-gradient(ellipse 78% 62% at 50% 46%, rgba(6, 16, 14, 0.58) 0%, rgba(6, 16, 14, 0.28) 52%, transparent 74%),
    linear-gradient(180deg, rgba(6, 14, 12, 0.42) 0%, rgba(6, 14, 12, 0.18) 40%, rgba(6, 16, 14, 0.4) 100%) !important;
}
.landing-cta, .btn-primary {
  box-shadow: 0 8px 28px rgba(47, 122, 115, 0.35), 0 0 18px rgba(126, 217, 205, 0.28) !important;
}
*, *::before, *::after {
  transition-duration: 0.35s !important;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.35s !important;
    transition-duration: 0.35s !important;
  }
}
"""


def wait(page: Page, ms: int) -> None:
    """Built-in pause so the walkthrough feels human-paced."""
    page.wait_for_timeout(ms)


def smooth_scroll(page: Page, y: int, duration_ms: int = 1200) -> None:
    page.evaluate(
        """([y, duration]) => new Promise((resolve) => {
          const start = window.scrollY;
          const delta = y - start;
          const t0 = performance.now();
          const step = (now) => {
            const t = Math.min(1, (now - t0) / duration);
            const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            window.scrollTo(0, start + delta * ease);
            if (t < 1) requestAnimationFrame(step);
            else resolve();
          };
          requestAnimationFrame(step);
        })""",
        [y, duration_ms],
    )


def set_range_value(page: Page, locator, value: int) -> None:
    locator.evaluate(
        """(el, v) => {
          el.value = String(v);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }""",
        value,
    )


def enter_dashboard_as_guest(page: Page) -> None:
    page.get_by_role("button", name="Enter Dashboard").first.click()
    wait(page, 900)
    page.get_by_role("button", name="Continue as Guest").click()
    wait(page, 1600)
    # Dismiss guided-demo banner noise if present; stay on companion home.
    page.wait_for_selector("text=+ Check-In", timeout=20000)


def run_walkthrough(page: Page) -> None:
    page.add_style_tag(content=STYLING_INJECTOR)

    # --- 0:00–0:05 Hero & landing overview ---
    wait(page, 1800)
    smooth_scroll(page, 420, 1400)
    wait(page, 900)
    smooth_scroll(page, 0, 900)
    wait(page, 700)

    enter_dashboard_as_guest(page)

    # --- 0:05–0:12 AI companion & check-in ---
    page.get_by_role("button", name="+ Check-In").first.click()
    wait(page, 1000)
    notes = page.locator("textarea").first
    notes.click()
    notes.fill("")
    notes.type(REFLECTION, delay=28)
    wait(page, 900)
    # Close check-in and show Astra chat response to the same reflection.
    page.locator(".modal-sheet").locator("button").first.click()
    wait(page, 700)

    sidebar = page.get_by_role("navigation", name="Primary")
    sidebar.get_by_role("button", name="AI Coach").click()
    wait(page, 900)
    coach_input = page.get_by_placeholder("Ask Astra a medical question, or chat about your streak & routine...")
    coach_input.click()
    coach_input.fill("")
    coach_input.type(REFLECTION, delay=22)
    wait(page, 400)
    page.locator("form").filter(has=coach_input).locator("button[type='submit']").click()
    # Allow Astra reply (API or local fallback).
    wait(page, 2800)

    # --- 0:12–0:18 Rewards hub ---
    sidebar = page.get_by_role("navigation", name="Primary")
    sidebar.get_by_role("button", name="Rewards").click()
    wait(page, 1100)
    page.get_by_text("Your Balance").first.scroll_into_view_if_needed()
    wait(page, 800)
    page.get_by_text("Interactive Benefit Calculator").first.scroll_into_view_if_needed()
    wait(page, 700)
    slider = page.locator("input[type='range']").first
    slider.scroll_into_view_if_needed()
    for amount in (350, 600, 900, 1200):
        set_range_value(page, slider, amount)
        wait(page, 450)
    wait(page, 700)

    # --- 0:18–0:25 Search & back to dashboard ---
    page.keyboard.press("Control+K")
    search_dialog = page.get_by_role("dialog", name="Global search")
    try:
        search_dialog.wait_for(state="visible", timeout=2500)
    except Exception:
        page.get_by_role("button", name="Search (⌘K)").click()
        search_dialog.wait_for(state="visible", timeout=8000)
    wait(page, 700)
    search = search_dialog.get_by_placeholder("Search features, actions, and data...")
    search.click()
    search.fill("")
    search.type("rewards", delay=40)
    wait(page, 1200)
    search.fill("")
    search.type("check-in", delay=40)
    wait(page, 1100)
    page.keyboard.press("Escape")
    wait(page, 600)
    page.get_by_role("navigation", name="Primary").get_by_role("button", name="Companion").click()
    wait(page, 1400)


def find_ffmpeg() -> str | None:
    found = shutil.which("ffmpeg")
    if found:
        return found
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        pass
    env_cache = os.environ.get("PLAYWRIGHT_BROWSERS_PATH")
    search_roots = [Path.home() / "AppData" / "Local" / "ms-playwright"]
    if env_cache:
        search_roots.append(Path(env_cache))
    for root in search_roots:
        if not root.exists():
            continue
        hits = list(root.rglob("ffmpeg.exe")) + list(root.rglob("ffmpeg"))
        if hits:
            return str(hits[0])
    return None


def convert_to_mp4(webm_path: Path, mp4_path: Path, fps: int = TARGET_FPS) -> None:
    ffmpeg = find_ffmpeg()
    if not ffmpeg:
        # Fallback: copy WebM beside the requested name so the run still produces a file.
        fallback = mp4_path.with_suffix(".webm")
        shutil.copy2(webm_path, fallback)
        print(
            f"[warn] ffmpeg not found — saved Playwright capture as {fallback}\n"
            f"       Install ffmpeg, then run:\n"
            f"       ffmpeg -y -i \"{fallback}\" -r {fps} -c:v libx264 -pix_fmt yuv420p "
            f"-movflags +faststart \"{mp4_path}\"",
            file=sys.stderr,
        )
        return

    cmd = [
        ffmpeg,
        "-y",
        "-i",
        str(webm_path),
        "-r",
        str(fps),
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(mp4_path),
    ]
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as exc:
        fallback = mp4_path.with_suffix(".webm")
        shutil.copy2(webm_path, fallback)
        print(
            f"[warn] ffmpeg encode failed ({exc.stderr[-400:] if exc.stderr else exc})\n"
            f"       saved raw capture as {fallback}",
            file=sys.stderr,
        )
        return
    print(f"[ok] wrote {mp4_path} ({VIEWPORT['width']}x{VIEWPORT['height']} @ {fps}fps)")


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description="Record Aura Health demo walkthrough")
    parser.add_argument("--url", default=DEFAULT_URL, help="Base URL to record")
    parser.add_argument(
        "--out",
        type=Path,
        default=root / "aura_health_demo.mp4",
        help="Output MP4 path",
    )
    parser.add_argument("--headed", action="store_true", help="Show the browser window")
    args = parser.parse_args()
    args.out = args.out.resolve()
    args.out.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="aura-demo-") as tmp:
        video_dir = Path(tmp) / "video"
        video_dir.mkdir()

        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=not args.headed,
                args=[
                    "--autoplay-policy=no-user-gesture-required",
                    "--disable-lcd-text",
                    "--force-device-scale-factor=1",
                ],
            )
            context = browser.new_context(
                viewport=VIEWPORT,
                device_scale_factor=DEVICE_SCALE,
                record_video_dir=str(video_dir),
                record_video_size=VIEWPORT,
                color_scheme="dark",
                locale="en-US",
            )
            page = context.new_page()
            page.set_default_timeout(25000)
            print(f"[rec] loading {args.url}")
            page.goto(args.url, wait_until="load")
            page.get_by_role("heading", name="Reduce Stress in 5 Minutes a Day").wait_for(timeout=20000)
            run_walkthrough(page)
            # Finalize WebM before converting.
            page.close()
            context.close()
            browser.close()

        webms = sorted(video_dir.glob("*.webm"))
        if not webms:
            print("[error] Playwright did not produce a video file", file=sys.stderr)
            return 1
        convert_to_mp4(webms[0], args.out)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
