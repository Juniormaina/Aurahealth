#!/usr/bin/env python3
"""Capture README screenshots of Aura Health (landing + in-app)."""

from __future__ import annotations

import argparse
from pathlib import Path

from playwright.sync_api import Page, sync_playwright

DEFAULT_URL = "https://aurahealth-delta.vercel.app/"
VIEWPORT = {"width": 1440, "height": 900}


def wait(page: Page, ms: int = 800) -> None:
    page.wait_for_timeout(ms)


def shot(page: Page, path: Path, full_page: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(path), full_page=full_page, type="png")
    print(f"[ok] {path.name}")


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    out = root / "docs" / "readme" / "screenshots"
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=DEFAULT_URL)
    args = parser.parse_args()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport=VIEWPORT,
            device_scale_factor=1.5,
            color_scheme="dark",
        )
        page = context.new_page()
        page.set_default_timeout(25000)
        page.goto(args.url, wait_until="load")
        page.get_by_role("heading", name="Reduce Stress in 5 Minutes a Day").wait_for()
        wait(page, 1200)

        # 1 Landing hero
        shot(page, out / "01-landing-hero.png")

        # 2 Features
        page.locator("#features").scroll_into_view_if_needed()
        wait(page, 900)
        shot(page, out / "02-features.png")

        # 3 Proof
        page.locator("#proof").scroll_into_view_if_needed()
        wait(page, 1100)
        shot(page, out / "03-proof.png")

        # 4 Landing rewards
        page.locator("#rewards").scroll_into_view_if_needed()
        wait(page, 900)
        shot(page, out / "04-rewards-landing.png")

        # 5 Pricing
        page.locator("#pricing").scroll_into_view_if_needed()
        wait(page, 900)
        shot(page, out / "05-pricing.png")

        # Enter guest dashboard
        page.evaluate("window.scrollTo(0, 0)")
        wait(page, 400)
        page.get_by_role("button", name="Enter Dashboard").first.click()
        wait(page, 900)
        page.get_by_role("button", name="Continue as Guest").click()
        page.wait_for_selector("text=+ Check-In", timeout=20000)
        wait(page, 1400)

        # Close guided demo modal (X in top-right of overlay card).
        guide = page.locator("div.fixed.inset-0.z-50")
        if guide.count():
            guide.locator("button").first.click()
            wait(page, 700)

        # 6 Companion dashboard
        shot(page, out / "06-companion.png")

        # 7 AI Coach
        page.get_by_role("navigation", name="Primary").get_by_role("button", name="AI Coach").click(force=True)
        wait(page, 1200)
        shot(page, out / "07-ai-coach.png")

        # 8 In-app Rewards hub
        page.get_by_role("navigation", name="Primary").get_by_role("button", name="Rewards").click(force=True)
        wait(page, 1200)
        shot(page, out / "08-rewards-hub.png")

        context.close()
        browser.close()

    print(f"[done] screenshots in {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
