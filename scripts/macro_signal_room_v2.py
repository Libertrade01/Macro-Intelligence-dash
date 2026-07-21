#!/usr/bin/env python3
"""Macro Signal Room V2 synthesis and historical replay.

Default mode is dry-run. Production writes require --persist and a reviewed
report file. This script deliberately starts from stored Briefing Studio
summaries and never refetches transcripts.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ENV_PATH = Path.home() / ".hermes" / ".env"
DEFAULT_BASE_URL = "https://macro-intelligence-dash.vercel.app"
PROMPT_VERSION = "macro-signal-room-v2.1-room-view-contract"
MODEL_PROVIDER = os.getenv("MACRO_SIGNAL_PROVIDER", "openai-codex")
MODEL_NAME = os.getenv("MACRO_SIGNAL_MODEL", "gpt-5.4")


def load_env_value(*names: str) -> str:
    for name in names:
        value = os.environ.get(name, "").strip()
        if value:
            return value
    if ENV_PATH.exists():
        for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
            if not line or line.lstrip().startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            if key in names:
                value = value.strip().strip('"').strip("'")
                if value:
                    return value
    return ""


def request_json(url: str, secret: str, *, method: str = "GET", payload: Any | None = None, timeout: int = 60) -> dict[str, Any]:
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    headers = {
        "Authorization": f"Bearer {secret}",
        "Accept": "application/json",
        "User-Agent": "Hermes/1.0",
    }
    if payload is not None:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8", errors="replace"))
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"HTTP {exc.code} {url}: {raw}") from exc


def fetch_inputs(base_url: str, secret: str, limit: int) -> dict[str, Any]:
    return request_json(f"{base_url.rstrip('/')}/api/macro/inputs?limit={limit}", secret)


def compact_sections(markdown: str) -> dict[str, str]:
    sections: dict[str, str] = {}
    for match in re.finditer(r"^##\s+(.+?)\s*\n(.*?)(?=^##\s+|\Z)", markdown or "", re.S | re.M):
        name = match.group(1).strip()
        body = re.sub(r"\s+", " ", match.group(2)).strip()
        if name.lower() in {
            "core thesis",
            "market implications",
            "key points",
            "why it matters",
            "trading implications",
            "macro implications",
            "risks",
            "watchlist",
        }:
            sections[name] = body[:1200]
    if not sections:
        sections["summary"] = re.sub(r"\s+", " ", markdown or "").strip()[:1400]
    return sections


def source_name(row: dict[str, Any]) -> str:
    title = str(row.get("title") or "")
    if ":" in title:
        return title.split(":", 1)[0]
    if "speedrun" in title.lower():
        return "Friday Speedrun"
    return str(row.get("desk") or row.get("source") or "Unknown")


def compact_evidence(api_response: dict[str, Any]) -> dict[str, Any]:
    rows = sorted(api_response.get("inputs") or [], key=lambda r: (str(r.get("date") or ""), str(r.get("created_at") or "")))
    inputs = []
    for row in rows:
        sources = row.get("sources") if isinstance(row.get("sources"), list) else []
        inputs.append(
            {
                "slug": row.get("slug"),
                "date": row.get("date"),
                "created_at": row.get("created_at"),
                "type": row.get("type"),
                "source_name": source_name(row),
                "title": row.get("title"),
                "top_story": row.get("top_story"),
                "source_url": row.get("source") or (sources[0] if sources else ""),
                "sections": compact_sections(str(row.get("content_markdown") or "")),
            }
        )
    current = api_response.get("current_overview") or api_response.get("macro_living") or {}
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "current_overview_markdown": current.get("content_markdown", ""),
        "current_overview_json": current.get("content_json"),
        "inputs": inputs,
    }


def build_prompt(evidence: dict[str, Any]) -> str:
    return f"""
You are the synthesis engine behind Macro Signal Room. Return JSON only.

Run a DRY RUN by default. Do not claim production writes.

Rules:
- Fetching is already done. Use EVIDENCE_JSON only.
- Synthesize across sources. Do not concatenate summaries.
- No lookahead in historical revisions. Use publication date chronology.
- Do not create one revision per episode. Revisions are material changes only.
- Founder profiles, company stories, market plumbing, and trading psychology are peripheral unless they have genuine macro implications.
- Every important claim needs evidence objects with slug, source, claim.
- If evidence is insufficient, say insufficient evidence.
- Enforce content limits exactly.

Return this top-level dry-run object:
{{
  "dry_run": true,
  "total_inputs_found": number,
  "earliest_publication_date": "YYYY-MM-DD",
  "latest_publication_date": "YYYY-MM-DD",
  "usable_inputs": number,
  "rejected_or_malformed": [{{"slug":"", "reason":""}}],
  "proposed_revision_count": number,
  "proposed_regime_change_count": number,
  "source_coverage_through_time": [],
  "insufficient_evidence_periods": [],
  "first_three_revisions": [],
  "last_three_revisions": [],
  "regime_changes": [],
  "current_v2_payload": {{
    "schema_version": 2,
    "prompt_version": "macro-signal-room-v2.1-room-view-contract",
    "generated_at": "ISO timestamp",
    "through_date": "YYYY-MM-DD",
    "input_count": number,
    "source_count": number,
    "sources": ["1000x Network", "Forward Guidance", "Capital Flows Research", "Friday Speedrun"],
    "room_view": {{"headline":"max 80 chars", "thesis":"max 280 chars", "primary_view":"max 45 chars", "horizon":"1–4 weeks", "confidence":"low | medium | high", "bias":"max 150 chars", "invalidation":"max 170 chars"}},
    "revision": {{"changed":"max 180 chars", "held":"max 180 chars", "impact":"max 180 chars", "material_change": true, "trigger_slugs":[], "evidence":[]}},
    "next_tests": [],
    "regime": {{"label":"max 75 chars", "definition":"max 190 chars", "bias":"max 140 chars", "invalidation":"max 160 chars", "since":"ISO timestamp or null", "previous_label":"Prior regime or null", "changed":false, "change_reason":null}},
    "drivers": [],
    "source_alignment": []
  }},
  "schema_and_persistence_needed_before_write": []
}}

V2.1 Room View constraints:
- Never use "House View", "house view", or "house-view" anywhere.
- input_count is usable inputs. source_count is distinct source names, normally 4.
- drivers exactly 4, ordered causal nodes chosen from Growth, Inflation, Policy, Rates, Liquidity, USD, Credit, Positioning, Risk.
- Each driver has id, name, state max 35 chars, direction, summary max 170 chars, transmission max 150 chars, causes_next, evidence max 3.
- causes_next must reference the next driver id. The fourth causes_next must be null.
- next_tests exactly 3 or 4; title max 65, description max 130, window max 20, confirmation max 140, invalidation max 140.
- source_alignment positions keys must exactly match the active driver ids with aligned | mixed | not_aligned | no_view.
- source stance max 150 chars. evidence max 3 per source.

EVIDENCE_JSON:
{json.dumps(evidence, ensure_ascii=False)}
""".strip()


def run_hermes(prompt: str) -> dict[str, Any]:
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".txt", delete=False) as f:
        f.write(prompt)
        prompt_path = f.name
    try:
        result = subprocess.run(
            [
                "hermes",
                "-z",
                Path(prompt_path).read_text(encoding="utf-8"),
                "--provider",
                MODEL_PROVIDER,
                "-m",
                MODEL_NAME,
                "-t",
                "terminal,file",
            ],
            capture_output=True,
            text=True,
            timeout=900,
        )
    finally:
        Path(prompt_path).unlink(missing_ok=True)
    if result.returncode != 0:
        raise SystemExit(result.stderr.strip() or "Hermes synthesis failed")
    raw = result.stdout.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return json.loads(raw)


def collect_evidence_slugs(payload: dict[str, Any]) -> list[str]:
    slugs: set[str] = set()
    for item in (payload.get("revision") or {}).get("evidence") or []:
        if item.get("slug"):
            slugs.add(str(item["slug"]))
    for driver in payload.get("drivers") or []:
        for item in driver.get("evidence") or []:
            if item.get("slug"):
                slugs.add(str(item["slug"]))
    return sorted(slugs)


def validate_report(report: dict[str, Any], fetched_count: int) -> list[str]:
    issues: list[str] = []
    if report.get("total_inputs_found") != fetched_count:
        issues.append(f"total_inputs_found={report.get('total_inputs_found')} but fetched={fetched_count}")
    payload = report.get("current_v2_payload") or {}
    room_view = payload.get("room_view") or payload.get("call") or {}
    revision = payload.get("revision") or {}
    if payload.get("schema_version") != 2:
        issues.append("current_v2_payload.schema_version must be 2")
    if re.search(r"house[- ]view|house macro", json.dumps(report), re.I):
        issues.append("House View terminology is not allowed")
    if payload.get("source_count") == payload.get("input_count"):
        issues.append("source_count and input_count are conflated")
    if not payload.get("sources"):
        issues.append("sources is required")
    if len(room_view.get("headline", "")) > 80:
        issues.append("room_view.headline exceeds 80 chars")
    if len(room_view.get("thesis", "")) > 280:
        issues.append("room_view.thesis exceeds 280 chars")
    if len(room_view.get("primary_view", "")) > 45:
        issues.append("room_view.primary_view exceeds 45 chars")
    if len(room_view.get("bias", "")) > 150:
        issues.append("room_view.bias exceeds 150 chars")
    if len(room_view.get("invalidation", "")) > 170:
        issues.append("room_view.invalidation exceeds 170 chars")
    if not revision.get("held") and not revision.get("unchanged"):
        issues.append("revision.held is required")
    drivers = payload.get("drivers") or []
    if len(drivers) != 4:
        issues.append("drivers must contain exactly 4 nodes")
    for driver in drivers:
        if len(driver.get("state", "")) > 35:
            issues.append(f"driver state too long: {driver.get('name')}")
        if len(driver.get("summary", "")) > 170:
            issues.append(f"driver summary too long: {driver.get('name')}")
        if not driver.get("transmission"):
            issues.append(f"driver transmission missing: {driver.get('name')}")
    driver_ids = [driver.get("id") for driver in drivers]
    for index, driver in enumerate(drivers):
        expected_next = driver_ids[index + 1] if index < len(driver_ids) - 1 else None
        if driver.get("causes_next") != expected_next:
            issues.append(f"driver causes_next invalid: {driver.get('name')}")
    for source in payload.get("source_alignment") or []:
        if set((source.get("positions") or {}).keys()) != set(driver_ids):
            issues.append(f"source alignment keys do not match drivers: {source.get('source')}")
        if len(source.get("stance", "")) > 150:
            issues.append(f"source stance too long: {source.get('source')}")
    return issues


def markdown_from_v2(payload: dict[str, Any]) -> str:
    room_view = payload.get("room_view") or payload.get("call") or {}
    revision = payload.get("revision") or {}
    regime = payload.get("regime") or {}
    lines = [
        "## Room View",
        "",
        f"- **Headline:** {room_view.get('headline', '')}",
        f"- **Thesis:** {room_view.get('thesis', '')}",
        f"- **Bias:** {room_view.get('bias', '')}",
        f"- **Invalidation:** {room_view.get('invalidation', '')}",
        "",
        "## What Changed",
        "",
        f"- {revision.get('changed', '')}",
        f"- **Held:** {revision.get('held') or revision.get('unchanged', '')}",
        f"- **Impact:** {revision.get('impact', '')}",
        "",
        "## Regime",
        "",
        f"- **{regime.get('label', '')}:** {regime.get('definition') or regime.get('description', '')}",
        "",
        "## Drivers",
        "",
    ]
    for driver in payload.get("drivers") or []:
        lines.append(f"- **{driver.get('name')}:** {driver.get('summary')} Transmission: {driver.get('transmission') or driver.get('causes_next', '')}")
    return "\n".join(lines).strip()


def persist_report(report: dict[str, Any], base_url: str, secret: str) -> None:
    payload = report["current_v2_payload"]
    briefing_payload = {
        "slug": "macro-living",
        "type": "macro_briefing",
        "title": "Macro Signal Room",
        "date": payload["through_date"],
        "status": "ready",
        "source_count": payload.get("source_count"),
        "top_story": (payload.get("room_view") or payload.get("call") or {}).get("headline"),
        "content_markdown": markdown_from_v2(payload),
        "content_json": payload,
        "prompt_version": PROMPT_VERSION,
        "evidence_slugs": collect_evidence_slugs(payload),
    }
    request_json(f"{base_url.rstrip('/')}/api/briefings", secret, method="POST", payload=briefing_payload)

    seen_regimes: set[tuple[str, str]] = set()
    for record in (report.get("first_three_revisions") or []) + (report.get("last_three_revisions") or []):
        if not record.get("payload"):
            continue
        request_json(
            f"{base_url.rstrip('/')}/api/macro/revisions",
            secret,
            method="POST",
            payload={
                "version": record.get("version"),
                "effective_at": record.get("effective_at"),
                "through_date": record.get("through_date"),
                "trigger_slugs": record.get("trigger_slugs") or [],
                "material_change": record.get("material_change", True),
                "change_summary": record.get("change_summary"),
                "payload": record.get("payload"),
                "metadata": record.get("metadata") or {"prompt_version": PROMPT_VERSION},
            },
        )
    for change in report.get("regime_changes") or []:
        key = (str(change.get("effective_at")), str(change.get("to") or change.get("to_regime")))
        if key in seen_regimes:
            continue
        seen_regimes.add(key)
        request_json(
            f"{base_url.rstrip('/')}/api/macro/regime-changes",
            secret,
            method="POST",
            payload={
                "from_regime": change.get("from") or change.get("from_regime"),
                "to_regime": change.get("to") or change.get("to_regime"),
                "effective_at": change.get("effective_at"),
                "reason": change.get("reason"),
                "trigger_slugs": change.get("trigger_slugs") or [],
                "evidence": change.get("evidence") or [],
            },
        )


def main() -> int:
    parser = argparse.ArgumentParser(description="Macro Signal Room V2 dry-run/backfill worker")
    parser.add_argument("--base-url", default=load_env_value("MACRO_BRIEFING_STUDIO_URL", "BRIEFING_STUDIO_MACRO_URL") or DEFAULT_BASE_URL)
    parser.add_argument("--limit", type=int, default=80)
    parser.add_argument("--out", default=str(Path.home() / "macro_signal_room_v2_dryrun.json"))
    parser.add_argument("--from-report", help="Use an existing dry-run report instead of regenerating")
    parser.add_argument("--persist", action="store_true", help="Write reviewed V2 payload and revisions to production")
    args = parser.parse_args()

    secret = load_env_value("BRIEFING_INGEST_SECRET")
    if not secret:
        raise SystemExit("Missing BRIEFING_INGEST_SECRET")

    if args.from_report:
        report = json.loads(Path(args.from_report).read_text(encoding="utf-8"))
        fetched_count = int(report.get("total_inputs_found") or 0)
    else:
        api_response = fetch_inputs(args.base_url, secret, args.limit)
        fetched_count = len(api_response.get("inputs") or [])
        evidence = compact_evidence(api_response)
        report = run_hermes(build_prompt(evidence))

    issues = validate_report(report, fetched_count)
    if issues:
        report["validation_issues"] = issues

    out_path = Path(args.out)
    out_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"DRY_RUN_REPORT {out_path}")
    print(json.dumps({
        "dry_run": not args.persist,
        "total_inputs_found": report.get("total_inputs_found"),
        "usable_inputs": report.get("usable_inputs"),
        "proposed_revision_count": report.get("proposed_revision_count"),
        "proposed_regime_change_count": report.get("proposed_regime_change_count"),
        "validation_issues": issues,
    }, indent=2))

    if args.persist:
        if issues:
            raise SystemExit("Refusing to persist report with validation issues")
        persist_report(report, args.base_url, secret)
        print("PERSISTED macro-living V2 plus available revisions/regime changes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
