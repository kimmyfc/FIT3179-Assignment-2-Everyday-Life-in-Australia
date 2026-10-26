# Everyday Life in Australia — FIT3179 Data Visualisation 2

**Topic 25 (Volume 16: Community & Everyday Australia):** an interactive data story that combines datasets on time use, recreation, shared public places, volunteering and wellbeing to ask *where Australians spend their everyday lives, which shared places they use, and whether the connections they make are holding up.*

**Live page:** https://kimmyfc.github.io/FIT3179-Assignment-2-Everyday-Life-in-Australia/

**Sketch:** [`sketch.pdf`](sketch.pdf)

Author: Kimberley Carlile (33882959) · Last updated 25 October 2026

## Chart specifications

Every chart is a standalone, human-readable JSON specification in [`docs/specs/`](docs/specs/). There are 16 charts in five sections, plus a small ACT inset for the activity map. All are Vega-Lite.

| # | Chart | Idiom | Spec |
|---|-------|-------|------|
| 01 | Sleep and self-care fill almost half the day | Radial bar chart (24-hour dial) | [`01_daily_time.vl.json`](docs/specs/01_daily_time.vl.json) |
| 02 | Women do twice the housework | Dumbbell chart | [`02_time_by_sex.vl.json`](docs/specs/02_time_by_sex.vl.json) |
| 03 | Canberra is the most active place | **Map:** choropleth + ACT inset | [`03_activity_choropleth.vl.json`](docs/specs/03_activity_choropleth.vl.json), [`03b_act_inset.vl.json`](docs/specs/03b_act_inset.vl.json) |
| 04 | Walking wins in every state | Heatmap | [`04_activity_heatmap.vl.json`](docs/specs/04_activity_heatmap.vl.json) |
| 05 | Half of adults move three times a week | Bullet chart | [`05_frequency_bullet.vl.json`](docs/specs/05_frequency_bullet.vl.json) |
| 06 | Shared places hug the coast | **Map:** dot map | [`06_shared_places_map.vl.json`](docs/specs/06_shared_places_map.vl.json) |
| 07 | Libraries bounced back | Index line chart | [`07_library_recovery.vl.json`](docs/specs/07_library_recovery.vl.json) |
| 08 | Story time fills half of all library programs | Marimekko chart | [`08_library_programs_mekko.vl.json`](docs/specs/08_library_programs_mekko.vl.json) |
| 09 | Two maps, two ways of joining in (cultural attendance) | **Map:** proportional symbols | [`09_culture_symbols.vl.json`](docs/specs/09_culture_symbols.vl.json) |
| 10 | Two maps, two ways of joining in (volunteers) | **Map:** square cartogram | [`10_volunteer_cartogram.vl.json`](docs/specs/10_volunteer_cartogram.vl.json) |
| 11 | Volunteering is a commitment | Ordered bar chart | [`11_volunteer_hours_bars.vl.json`](docs/specs/11_volunteer_hours_bars.vl.json) |
| 12 | Every kind of group involvement fell | Slope chart | [`12_participation_slope.vl.json`](docs/specs/12_participation_slope.vl.json) |
| 13 | Nearly one in five often feel lonely | Waffle chart | [`13_loneliness_waffle.vl.json`](docs/specs/13_loneliness_waffle.vl.json) |
| 14 | We trust institutions more than each other | Diverging stacked bars | [`14_trust_diverging.vl.json`](docs/specs/14_trust_diverging.vl.json) |
| 15 | Younger generations feel they belong less | Dumbbell chart (small multiples) | [`15_belonging_generations.vl.json`](docs/specs/15_belonging_generations.vl.json) |
| 16 | Young people haven't bounced back since 2020 | Multi-line chart | [`16_life_satisfaction.vl.json`](docs/specs/16_life_satisfaction.vl.json) |

The "Focus on a place" selector (and clicking a state on map 03) sets a `focus` parameter declared in specs 03, 04, 05, 10, 13 and 14. [`docs/app.js`](docs/app.js) only embeds the specs, applies a shared theme and passes that parameter between charts.

## Data sources

| Source | Used in |
|--------|---------|
| [ABS, How Australians Use Their Time](https://www.abs.gov.au/statistics/people/people-and-communities/how-australians-use-their-time/latest-release) | 01–02 |
| [Australian Sports Commission, AusPlay](https://www.sportaus.gov.au/ausplay) | 03–05 |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) © OpenStreetMap contributors, ODbL (Overpass export, October 2026) | 06 |
| [ALIA & NSLA, Australian Public Library Statistical Report 2023–24](https://read.alia.org.au/library-statistics) | 07–08 |
| [ABS, General Social Survey](https://www.abs.gov.au/statistics/people/people-and-communities/general-social-survey-summary-results-australia/latest-release) | 09–14, 16 |
| [Scanlon Foundation Research Institute, Mapping Social Cohesion 2025](https://scanloninstitute.org.au/mapping-social-cohesion-2025/) | 15 |
| [ABS ASGS 2021 state and territory boundaries](https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs/edition-3-july-2021-june-2026/access-and-downloads/digital-boundary-files) | all maps |

`scripts/build_data.py` reads the source CSVs in this repository and writes the small files in `docs/data/` (about 0.8 MB in total). It converts AusPlay rates from fractions to percentages and leaves the source CSVs unchanged. `scripts/prepare_boundaries.py` documents how the state boundary GeoJSON was simplified. Maps use an Albers equal-area conic projection (standard parallels 18°S and 36°S), which suits Australia.

```bash
python3 scripts/build_data.py
```

## Preview locally

```bash
python3 -m http.server 8765 --directory docs
```

Then open http://127.0.0.1:8765/. Do not open `docs/index.html` as a `file://` URL; browsers block the data requests in that mode. Vega, Vega-Lite and Vega-Embed are bundled in `docs/vendor/`, so the page does not depend on a CDN.

## Publishing on GitHub Pages

GitHub Pages publishes the repository root from branch `main`. The root `index.html` forwards visitors to `docs/`, where the page lives, so the live URL above opens the visualisation directly.

## Use of generative AI

Generative AI was used in this assignment.
