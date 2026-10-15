/*
 * Loads each chart from its own Vega-Lite or Vega JSON file in specs/.
 * This file only supplies the shared theme and links the "focus on a place"
 * selector to the charts that declare a `focus` parameter.
 */

const theme = {
  background: null,
  font: 'Nunito, Arial, sans-serif',
  view: {stroke: null},
  axis: {
    labelColor: '#5C5F7A', titleColor: '#5C5F7A', domainColor: '#CDD3E0', tickColor: '#CDD3E0',
    gridColor: '#EEF2F8', labelFontSize: 12, titleFontSize: 12, titleFontWeight: 'normal'
  },
  legend: {labelColor: '#5C5F7A', titleColor: '#5C5F7A', labelFontSize: 12, titleFontSize: 12, titleFontWeight: 'normal'},
  header: {labelColor: '#1B1F4B'}
};

const charts = {
  'chart-routines': 'specs/01_daily_time.vl.json',
  'chart-gender': 'specs/02_time_by_sex.vl.json',
  'chart-sport-map': 'specs/03_activity_choropleth.vl.json',
  'chart-act-inset': 'specs/03b_act_inset.vl.json',
  'chart-heatmap': 'specs/04_activity_heatmap.vl.json',
  'chart-frequency': 'specs/05_frequency_bullet.vl.json',
  'chart-places': 'specs/06_shared_places_map.vl.json',
  'chart-library-trend': 'specs/07_library_recovery.vl.json',
  'chart-library-programs': 'specs/08_library_programs_mekko.vl.json',
  'chart-culture-map': 'specs/09_culture_symbols.vl.json',
  'chart-cartogram': 'specs/10_volunteer_cartogram.vl.json',
  'chart-hours': 'specs/11_volunteer_hours_bars.vl.json',
  'chart-trends': 'specs/12_participation_slope.vl.json',
  'chart-waffle': 'specs/13_loneliness_waffle.vl.json',
  'chart-trust': 'specs/14_trust_diverging.vl.json',
  'chart-belonging': 'specs/15_belonging_generations.vl.json',
  'chart-satisfaction': 'specs/16_life_satisfaction.vl.json'
};

const names = {
  AUS: 'Australia', NSW: 'New South Wales', VIC: 'Victoria', QLD: 'Queensland', SA: 'South Australia',
  WA: 'Western Australia', TAS: 'Tasmania', NT: 'Northern Territory', ACT: 'Australian Capital Territory'
};

const views = {};
let sport = [];
let community = [];

async function embed(id, url) {
  try {
    const result = await vegaEmbed('#' + id, url, {actions: false, renderer: 'svg', config: theme, tooltip: {theme: 'light'}});
    views[id] = result.view;
  } catch (error) {
    console.error(id, error);
    document.getElementById(id).innerHTML = '<p class="chart-error">This chart could not load.</p>';
  }
}

function hasFocus(view) {
  try { view.signal('focus'); return true; } catch { return false; }
}

async function setFocus(state) {
  document.getElementById('state-select').value = state;
  const s = sport.find(d => d.state === state);
  const c = community.find(d => d.state === state);
  document.getElementById('state-summary').textContent = state === 'AUS'
    ? `National: ${s.weekly.toFixed(1)}% active at least weekly`
    : `${names[state]}: ${s.weekly.toFixed(1)}% active at least weekly`;
  document.getElementById('lonely-value').textContent = c.lonely.toFixed(1) + '%';
  document.getElementById('lonely-place').textContent = names[state];
  document.getElementById('trust-place').textContent = names[state];
  await Promise.all(Object.values(views).filter(hasFocus).map(view => view.signal('focus', state).runAsync()));
}

async function start() {
  [sport, community] = await Promise.all([
    fetch('data/sport.json').then(r => r.json()),
    fetch('data/community.json').then(r => r.json())
  ]);
  await Promise.all(Object.entries(charts).map(([id, url]) => embed(id, url)));

  views['chart-sport-map']?.addEventListener('click', (_event, item) => {
    const state = item?.datum?.properties?.state;
    if (state) setFocus(state);
  });
  document.getElementById('state-select').addEventListener('change', event => setFocus(event.target.value));
  document.getElementById('act-rate').textContent = sport.find(d => d.state === 'ACT').weekly.toFixed(1) + '%';
  await setFocus('AUS');
}

window.addEventListener('DOMContentLoaded', () => start().catch(error => {
  console.error(error);
  document.querySelectorAll('.chart').forEach(el => {
    el.innerHTML = '<p class="chart-error">Data could not load. Preview this page through a web server, not a file:// URL.</p>';
  });
}));
