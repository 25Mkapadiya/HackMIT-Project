#!/usr/bin/env python3
"""
county_population_density.py

Builds a complete U.S. county-level population density dataset by:
  1. Downloading the Census Bureau's Gazetteer file (county land area, sq mi)
  2. Pulling the most recent Census Population Estimates Program (PEP) data
     via the Census API (county-level total population)
  3. Joining on FIPS code (state+county) and computing density = pop / land_sq_mi
  4. Writing a clean CSV ready to plug into a map visualization

Requires internet access to:
  - www2.census.gov  (Gazetteer files)
  - api.census.gov   (PEP population estimates)

Usage:
    python county_population_density.py
    python county_population_density.py --year 2024 --out counties_density.csv
    python county_population_density.py --census-api-key YOUR_KEY   # optional but recommended

A free Census API key (avoids rate limiting) can be requested instantly at:
    https://api.census.gov/data/key_signup.html
It can also be passed via the CENSUS_API_KEY environment variable.
"""

import argparse
import csv
import io
import os
import sys
import zipfile
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

GAZETTEER_URL_TEMPLATE = (
    "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/"
    # Census serves this file as "{year}_Gaz_..." (capital G) for every vintage
    # published so far, unlike the per-record column names inside the file
    # itself, which are lowercase. A lowercase request 404s.
    "{year}_Gazetteer/{year}_Gaz_counties_national.zip"
)

# Census PEP API changes its exact vintage/variable names slightly year to year.
# POPULATION variable is typically POP_{year} for the "population" endpoint.
PEP_API_URL_TEMPLATE = "https://api.census.gov/data/{year}/pep/population"


def fetch_url(url: str, timeout: int = 30) -> bytes:
    req = Request(url, headers={"User-Agent": "county-density-script/1.0"})
    try:
        with urlopen(req, timeout=timeout) as resp:
            return resp.read()
    except HTTPError as e:
        raise RuntimeError(f"HTTP error {e.code} fetching {url}") from e
    except URLError as e:
        raise RuntimeError(f"Network error fetching {url}: {e.reason}") from e


def download_gazetteer(year: int) -> dict:
    """
    Returns dict: fips (5-digit str) -> {"name": str, "state": str, "land_sq_mi": float}
    """
    url = GAZETTEER_URL_TEMPLATE.format(year=year)
    print(f"[1/3] Downloading Gazetteer file: {url}")
    try:
        raw = fetch_url(url)
    except RuntimeError as e:
        # Gazetteer files aren't published every single year for every vintage;
        # fall back to the most recent known-good year.
        fallback_year = year - 1
        print(f"    -> {e}\n    Retrying with {fallback_year} Gazetteer file...")
        url = GAZETTEER_URL_TEMPLATE.format(year=fallback_year)
        raw = fetch_url(url)

    zf = zipfile.ZipFile(io.BytesIO(raw))
    # The zip contains a single .txt file, tab-delimited
    txt_name = [n for n in zf.namelist() if n.lower().endswith(".txt")][0]
    with zf.open(txt_name) as f:
        raw_text = io.TextIOWrapper(f, encoding="latin-1")
        header_line = raw_text.readline()
        # Census has changed this file's delimiter across vintages — tab through
        # at least 2022, pipe-delimited (with an added GEOIDFQ column) by 2025 —
        # so sniff it from the header instead of assuming one.
        delimiter = "|" if "|" in header_line else "\t"
        text = io.StringIO(header_line + raw_text.read())
        reader = csv.DictReader(text, delimiter=delimiter)
        reader.fieldnames = [name.strip() for name in reader.fieldnames]

        out = {}
        for row in reader:
            row = {k.strip(): (v.strip() if v else v) for k, v in row.items()}
            fips = row.get("GEOID")
            name = row.get("NAME")
            usps = row.get("USPS")
            land_sq_mi = row.get("ALAND_SQMI")
            if not fips or not land_sq_mi:
                continue
            try:
                land_sq_mi = float(land_sq_mi)
            except ValueError:
                continue
            out[fips.zfill(5)] = {
                "name": name,
                "state": usps,
                "land_sq_mi": land_sq_mi,
            }
    print(f"    -> Parsed {len(out)} counties from Gazetteer file")
    return out


# Bulk, key-free county population-estimate totals. Census stopped serving
# api.census.gov requests without a key at some point after this script was
# first written (an unauthenticated call now 302-redirects to an HTML "Missing
# Key" page instead of erroring, so it must be detected by content, not status
# code) — this file-based feed is what the API itself is generated from and
# needs no key at all. See _pep_year_candidates for how {year} is walked back.
PEP_BULK_URL_TEMPLATE = (
    "https://www2.census.gov/programs-surveys/popest/datasets/"
    "2020-{year}/counties/totals/co-est{year}-alldata.csv"
)


def download_pep_population(year: int, api_key: str | None) -> dict:
    """
    Returns dict: fips (5-digit str) -> population (int)
    Tries the requested year, walking backward a few years if that vintage
    isn't published yet (PEP for the current calendar year often lags).
    Prefers the api.census.gov JSON endpoint (works today only with an API
    key — see CENSUS_API_KEY), then falls back to Census's static bulk CSV,
    which needs no key at all and is the more reliable path by default.
    """
    if api_key:
        result = _download_pep_population_api(year, api_key)
        if result:
            return result
        print("    -> API path exhausted, falling back to the key-free bulk CSV feed...")

    result = _download_pep_population_bulk(year)
    if result:
        return result

    raise RuntimeError(
        "Could not fetch PEP population data for any recent vintage from either "
        "api.census.gov or the bulk CSV feed at "
        "www2.census.gov/programs-surveys/popest/datasets/. Pass --year explicitly "
        "or check https://www2.census.gov/programs-surveys/popest/datasets/ for the "
        "latest published vintage."
    )


def _download_pep_population_api(year: int, api_key: str) -> dict | None:
    for attempt_year, attempt_var in _pep_year_candidates(year):
        url = f"{PEP_API_URL_TEMPLATE.format(year=attempt_year)}?get=NAME,{attempt_var}&for=county:*&key={api_key}"
        print(f"[2/3] Fetching PEP population (API): {url.split('&key=')[0]}")
        try:
            raw = fetch_url(url)
        except RuntimeError as e:
            print(f"    -> {e}. Trying next available vintage...")
            continue

        try:
            import json
            data = json.loads(raw)
        except Exception:
            # A bad/missing key doesn't 4xx here — api.census.gov redirects to an
            # HTML "Missing Key" page with a 200, which fails JSON parsing.
            print("    -> Response wasn't valid JSON (often a missing/invalid API key), trying next vintage...")
            continue

        header, *rows = data
        idx_pop = header.index(attempt_var)
        idx_state = header.index("state")
        idx_county = header.index("county")

        out = {}
        for row in rows:
            fips = row[idx_state] + row[idx_county]
            try:
                out[fips] = int(row[idx_pop])
            except (ValueError, TypeError):
                continue
        print(f"    -> Got population for {len(out)} counties (vintage {attempt_year}, var {attempt_var})")
        return out
    return None


def _download_pep_population_bulk(year: int) -> dict | None:
    for attempt_year in range(year, year - 5, -1):
        pop_col = f"POPESTIMATE{attempt_year}"
        url = PEP_BULK_URL_TEMPLATE.format(year=attempt_year)
        print(f"[2/3] Fetching PEP population (bulk CSV, no key required): {url}")
        try:
            raw = fetch_url(url)
        except RuntimeError as e:
            print(f"    -> {e}. Trying next available vintage...")
            continue

        text = io.TextIOWrapper(io.BytesIO(raw), encoding="latin-1")
        reader = csv.DictReader(text)
        if reader.fieldnames is None or pop_col not in reader.fieldnames:
            print(f"    -> {pop_col} not present in this file, trying next vintage...")
            continue

        out = {}
        for row in reader:
            # SUMLEV 040 rows are state-level summaries (COUNTY == "000"); skip them.
            if row.get("COUNTY") == "000":
                continue
            fips = f"{row.get('STATE', '')}{row.get('COUNTY', '')}"
            if len(fips) != 5:
                continue
            try:
                out[fips] = int(row[pop_col])
            except (ValueError, TypeError):
                continue
        print(f"    -> Got population for {len(out)} counties (vintage {attempt_year}, column {pop_col})")
        return out
    return None


def _pep_year_candidates(year: int):
    """Yield (year, variable_name) pairs to try, most recent first."""
    for y in range(year, year - 5, -1):
        yield y, f"POP_{y}"


def merge_and_compute(gazetteer: dict, population: dict) -> list:
    rows = []
    missing = []
    for fips, geo in gazetteer.items():
        pop = population.get(fips)
        if pop is None:
            missing.append(fips)
            continue
        land_sq_mi = geo["land_sq_mi"]
        density = round(pop / land_sq_mi, 2) if land_sq_mi > 0 else None
        rows.append({
            "fips": fips,
            "county_name": geo["name"],
            "state": geo["state"],
            "population": pop,
            "land_area_sq_mi": round(land_sq_mi, 2),
            "population_density_per_sq_mi": density,
        })
    rows.sort(key=lambda r: r["fips"])
    if missing:
        print(f"[!] {len(missing)} counties in Gazetteer had no matching population "
              f"record (likely territories or FIPS code changes). Examples: {missing[:5]}")
    return rows


def write_csv(rows: list, out_path: str):
    fieldnames = ["fips", "county_name", "state", "population",
                  "land_area_sq_mi", "population_density_per_sq_mi"]
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"[3/3] Wrote {len(rows)} counties to {out_path}")


def main():
    parser = argparse.ArgumentParser(description="Build U.S. county population density dataset")
    parser.add_argument("--year", type=int, default=2025,
                         help="Target vintage year for Gazetteer + PEP data (default: 2025 — the most "
                              "recent Population Estimates Program vintage as of 2026)")
    parser.add_argument("--out", type=str, default="county_population_density.csv",
                         help="Output CSV path")
    parser.add_argument("--census-api-key", type=str,
                         default=os.environ.get("CENSUS_API_KEY"),
                         help="Census API key (optional, avoids rate limits). "
                              "Can also set CENSUS_API_KEY env var.")
    args = parser.parse_args()

    try:
        gazetteer = download_gazetteer(args.year)
        population = download_pep_population(args.year, args.census_api_key)
        rows = merge_and_compute(gazetteer, population)
        if not rows:
            print("[ERROR] No rows produced — check source data / year.", file=sys.stderr)
            sys.exit(1)
        write_csv(rows, args.out)
    except RuntimeError as e:
        print(f"[ERROR] {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
