"""Prepare a lightweight display map from the official ABS 2021 STE_GEN layer.

Source: https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/STE/MapServer/1
Query parameters used for the downloaded GeoJSON:
  where=1=1, outFields=STATE_CODE_2021,STATE_NAME_2021,
  returnGeometry=true, maxAllowableOffset=0.02,
  geometryPrecision=3, outSR=4326, f=geojson.

Usage: python3 scripts/prepare_boundaries.py /path/to/abs-states-small.geojson
Only the largest mainland/main-island polygon of each state is retained for the
national-scale display. The ACT is rendered in a separate inset on the page.
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CODES = {"1": "NSW", "2": "VIC", "3": "QLD", "4": "SA", "5": "WA", "6": "TAS", "7": "NT", "8": "ACT"}


def signed_area(ring):
    return sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(ring, ring[1:])) / 2


def main_polygon(geometry):
    polygons = geometry["coordinates"] if geometry["type"] == "MultiPolygon" else [geometry["coordinates"]]
    valid = [p for p in polygons if p and abs(signed_area(p[0])) > 0.000001]
    polygon = max(valid, key=lambda p: abs(signed_area(p[0])))
    rings = []
    for i, ring in enumerate(polygon):
        if abs(signed_area(ring)) <= 0.000001:
            continue
        # Vega's geographic renderer needs consistent outer and hole winding.
        if (signed_area(ring) < 0) != (i == 0):
            ring = list(reversed(ring))
        rings.append(ring)
    return {"type": "Polygon", "coordinates": rings}


def main(source):
    geo = json.loads(Path(source).read_text())
    features = []
    for feature in geo["features"]:
        props = feature.get("properties") or {}
        code = props.get("state_code_2021")
        if code not in CODES or not feature.get("geometry"):
            continue
        features.append({"type": "Feature", "properties": {"state": CODES[code], "name": props["state_name_2021"]}, "geometry": main_polygon(feature["geometry"])})
    if len(features) != 8:
        raise ValueError(f"Expected eight state/territory features, got {len(features)}")
    output = ROOT / "docs/data/aus-states.geojson"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps({"type": "FeatureCollection", "features": features}, separators=(",", ":")))
    print(f"Wrote {output} ({output.stat().st_size:,} bytes)")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python3 scripts/prepare_boundaries.py /path/to/abs-states-small.geojson")
    main(sys.argv[1])
