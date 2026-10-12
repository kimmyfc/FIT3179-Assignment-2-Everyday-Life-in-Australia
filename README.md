# Everyday Australia — FIT3179 Assignment 2

This repository contains a critique draft of a single-page data visualisation about routines, recreation, community and wellbeing in Australia. The GitHub Pages webpage is in [`docs/`](docs/). It contains twelve Vega or Vega-Lite charts, including a choropleth, a proportional-symbol map and a square cartogram. All four sections remain visible on one scrolling page.

## Preview locally

```bash
python3 -m http.server 8765 --directory docs
```

Open `http://127.0.0.1:8765/`. The page uses local copies of Vega, Vega-Lite and Vega-Embed, so no chart library CDN is needed. Do not open `docs/index.html` with a `file://` URL; browsers block its data fetches in that mode.

## Data and method

`scripts/build_data.py` reads the supplied ABS and AusPlay CSV extracts and writes the compact data file used by the charts. It converts AusPlay rates from fractions to percentages and leaves the source CSVs unchanged. Run it from the repository root:

```bash
python3 scripts/build_data.py
```

The state map uses the ABS 2021 generalised state and territory boundary layer ([STE_GEN](https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/STE/MapServer/1)). `scripts/prepare_boundaries.py` documents the service query and prepares its GeoJSON for Vega. It retains each state or territory's largest mainland or main-island polygon for a small national display, and the page shows the ACT separately.

The page links to the original [ABS Time Use](https://www.abs.gov.au/statistics/people/people-and-communities/how-australians-use-their-time/latest-release), [ABS General Social Survey](https://www.abs.gov.au/statistics/people/people-and-communities/general-social-survey-summary-results-australia/latest-release), [AusPlay](https://www.sportaus.gov.au/ausplay), and [ABS boundaries](https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs/edition-3-july-2021-june-2026/access-and-downloads/digital-boundary-files) pages.

## Before submission

This is a critique draft. Confirm the final chart interpretations, check the exact survey notes and reliability flags, and publish the assessed version as a publicly accessible GitHub Page. The assignment specification says only Vega or Vega-Lite visuals are marked; all chart marks in this draft use them.
