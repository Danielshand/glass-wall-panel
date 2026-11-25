/* Glass Wall Panel v3.0.0
   A liquid-glass, full-screen Home Assistant dashboard card for wall tablets.
   One file, no dependencies, no build step. Everything about YOUR home lives in the card's YAML config.
   Device profiles: Fire HD 10, Fire HD 8, iPad (plus an automatic phone layout under 900px wide).
   Gestures: tap a light = on/off, press and slide = dim, hold a single light = color and white picker.
   MIT License. */
const GWP_VERSION = '3.0.0';
const GWP_PROFILES = { fire10: { width: 1280 }, fire8: { width: 1120 }, ipad: { width: 1180 } };
const GWP_RESERVED = ['home', 'lights', 'music', 'security', 'weather'];
const GWP_MMODES = [['fav', 'Favorites'], ['pl', 'Playlists'], ['ar', 'Artists'], ['search', 'Search']];
const GWP_TYPE = { artist: 'Artist', album: 'Album', playlist: 'Playlist', track: 'Song', radio: 'Radio' };
const GWP_COND = { 'clear-night': ['Clear', 'moon'], cloudy: ['Cloudy', 'cloud'], fog: ['Fog', 'cloud'], hail: ['Hail', 'snow'], lightning: ['Lightning', 'storm'],
  'lightning-rainy': ['Thunderstorms', 'storm'], partlycloudy: ['Partly cloudy', 'pcloud'], pouring: ['Heavy rain', 'rain'], rainy: ['Rain', 'rain'], snowy: ['Snow', 'snow'],
  'snowy-rainy': ['Sleet', 'snow'], sunny: ['Sunny', 'sun'], windy: ['Windy', 'cloud'], 'windy-variant': ['Windy', 'cloud'], exceptional: ['Severe weather', 'storm'] };
const GWP_ALARM_LABEL = { disarmed: 'Disarmed', armed_home: 'Armed home', armed_away: 'Armed away', armed_night: 'Armed night', arming: 'Arming', pending: 'Entry delay', triggered: 'ALARM TRIGGERED' };
const GWP_ALARM_MODES = { home: ['alarm_arm_home', 'Arm home', 'armed_home'], away: ['alarm_arm_away', 'Arm away', 'armed_away'], night: ['alarm_arm_night', 'Arm night', 'armed_night'] };
const GWP_WHITES = [[2200, '2200K'], [2700, '2700K'], [3000, '3000K'], [4000, '4000K'], [6500, '6500K']];
const GWP_WHITE_SWATCH = { 2200: '#FF9A4D', 2700: '#FFB463', 3000: '#FFCF8A', 4000: '#FFE7C2', 6500: '#EEF3FF' };
const GWP_COLORS = [['Red', [0, 75], '#FF5F6D'], ['Orange', [25, 85], '#FF8A3D'], ['Gold', [45, 80], '#FFD23F'], ['Green', [120, 55], '#7BE07B'],
  ['Teal', [175, 70], '#3DD6D0'], ['Blue', [225, 70], '#5B8CFF'], ['Violet', [265, 60], '#9B6BFF'], ['Pink', [315, 60], '#FF6FD8']];
const GWP_ICONS = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  cup: '<path d="M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 2v3M12 2v3"/>',
  film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  prev: '<path d="M19 20L9 12l10-8z"/><path d="M5 19V5"/>',
  next: '<path d="M5 4l10 8-10 8z"/><path d="M19 5v14"/>',
  cloud: '<path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.8A6 6 0 0 0 4 12.5 3.5 3.5 0 0 0 6.5 19z"/>',
  power: '<path d="M12 3v9"/><path d="M6.3 6.3a8 8 0 1 0 11.4 0"/>',
  pcloud: '<path d="M12 4v1.5M5.6 6.6l1 1M4 12h1.5"/><path d="M8.5 11a3.5 3.5 0 0 1 6.3-1.6"/><path d="M17 20a3.5 3.5 0 1 0-1-6.9A4.5 4.5 0 0 0 7.5 15 2.5 2.5 0 0 0 9 20z"/>',
  rain: '<path d="M17.5 15a4.5 4.5 0 1 0-1.4-8.8A6 6 0 0 0 4 8.5 3.5 3.5 0 0 0 6.5 15z"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',
  snow: '<path d="M17.5 15a4.5 4.5 0 1 0-1.4-8.8A6 6 0 0 0 4 8.5 3.5 3.5 0 0 0 6.5 15z"/><path d="M8 19h.01M12 19h.01M16 19h.01M10 22h.01M14 22h.01"/>',
  storm: '<path d="M17.5 15a4.5 4.5 0 1 0-1.4-8.8A6 6 0 0 0 4 8.5 3.5 3.5 0 0 0 6.5 15z"/><path d="M12 14l-2 4h4l-2 4"/>'
};
const gwpArr = (x) => (Array.isArray(x) ? x : x == null ? [] : [x]);
const gwpEnt = (x) => (typeof x === 'string' ? { entity: x } : x || {});
const gwpSlug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
const gwpHex = (h) => { h = String(h || '').trim(); if (/^#[0-9a-f]{3}$/i.test(h)) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]; return /^#[0-9a-f]{6}$/i.test(h) ? h : '#7dd3fc'; };
const gwpRgba = (h, a) => { h = gwpHex(h); return 'rgba(' + [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(',') + ',' + a + ')'; };
const gwpEsc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const gwpSvg = (name, size, fill) => '<svg aria-hidden="true" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="' + (fill ? 'currentColor' : 'none') + '" stroke="' + (fill ? 'none' : 'currentColor') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (GWP_ICONS[name] || GWP_ICONS.sun) + '</svg>';
const GWP_PLAY = '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
const GWP_PAUSE = '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
const GWP_HEADER_CSS = '.header,.toolbar,app-header{display:none !important}#view{padding-top:0 !important;min-height:100vh !important;height:100vh !important}hui-view-container{padding-top:0 !important;min-height:100vh !important}';
const GWP_HOLD_MS = 500, GWP_KEEP_MS = 3000;

class GlassWallPanel extends HTMLElement {
  static getStubConfig() {
    return { device: 'auto', name: '', rooms: [{ name: 'Living Room', groups: [{ name: 'Lamps', lights: [] }] }] };
  }

  /* ---------- config ---------- */
  setConfig(config) {
    const c = config || {};
    this._c = c;
    const names = {};
    const used = {};
    const rooms = gwpArr(c.rooms).map((r, i) => {
      r = r || {};
      let id = gwpSlug(r.id || r.name) || 'room' + (i + 1);
      if (GWP_RESERVED.indexOf(id) > -1 || used[id]) id = 'room_' + id + (used[id] ? i : '');
      used[id] = true;
      const src = gwpArr(r.groups).length ? gwpArr(r.groups) : gwpArr(r.lights).length ? [{ name: 'Lights', lights: r.lights }] : [];
      const groups = src.map((g) => [g.name || 'Lights', gwpArr(g.lights).map(gwpEnt).filter((l) => l.entity).map((l) => { if (l.name) names[l.entity] = l.name; return [l.entity, l.name || '']; })]).filter((g) => g[1].length);
      return { id, name: r.name || id, tab: r.tab || r.name || id, page: r.page ? id : null, speaker: r.speaker || null, groups,
        scenes: gwpArr(r.scenes).map(gwpEnt).filter((s) => s.entity).map((s) => [s.name || s.entity, s.entity, gwpHex(s.color || '#FFCF8A')]) };
    });
    const m = c.music || {};
    const speakers = gwpArr(m.speakers).map(gwpEnt).filter((s) => s.entity).map((s) => { if (s.name) names[s.entity] = s.name; return [s.entity, s.name || '']; });
    const sec = c.security || {};
    const sensors = gwpArr(sec.sensors).map(gwpEnt).filter((s) => s.entity).map((s) => { if (s.name) names[s.entity] = s.name; return [s.entity, s.name || '', s.type || 'door']; });
    const batteries = gwpArr(sec.batteries).map(gwpEnt).filter((s) => s.entity).map((s) => { if (s.name) names[s.entity] = s.name; return [s.entity, s.name || '']; });
    const w = typeof c.weather === 'string' ? { entity: c.weather } : c.weather || {};
    const tvs = gwpArr(c.tvs).map(gwpEnt).filter((t) => t.entity).map((t) => {
      if (t.name) names[t.entity] = t.name;
      return { id: t.entity, room: t.room ? gwpSlug(t.room) : null, home: !!t.home, appType: t.app_type || 'app',
        apps: gwpArr(t.apps || c.tv_apps).map((a) => [a.name, String(a.id), gwpHex(a.color)]) };
    });
    const allLights = [].concat(...rooms.map((r) => [].concat(...r.groups.map((g) => g[1].map((l) => l[0])))));
    let scenes = gwpArr(c.scenes).map((s) => [s.name || 'Scene', s.entity === 'all_off' || s.action === 'all_off' ? '__alloff' : s.entity, s.note || '', GWP_ICONS[s.icon] ? s.icon : 'sun']).filter((s) => s[1]);
    if (!scenes.length && allLights.length) scenes = [['All off', '__alloff', 'Every light off', 'moon']];
    const hasSec = !!(sec.alarm || sec.camera || sensors.length || batteries.length);
    const tabs = [['home', 'Home']];
    if (allLights.length) tabs.push(['lights', 'Lights']);
    if (speakers.length) tabs.push(['music', 'Music']);
    if (hasSec) tabs.push(['security', 'Security']);
    if (w.entity) tabs.push(['weather', 'Weather']);
    rooms.forEach((r) => { if (r.page) tabs.push([r.id, r.tab]); });
    this._k = { rooms, names, speakers, leader: m.default || (speakers[0] || [''])[0], library: !(m.library === false || m.library === 'none'), maEntry: m.config_entry_id || null,
      alarm: sec.alarm || null, camera: sec.camera || null, cameraName: sec.camera_name || 'Camera', secTitle: sec.title || 'Alarm', sensors, batteries, low: sec.low_battery != null ? Number(sec.low_battery) : 20,
      alarmModes: (gwpArr(sec.modes).length ? gwpArr(sec.modes) : ['home', 'away']).map((x) => GWP_ALARM_MODES[x]).filter(Boolean), alarmCode: sec.code != null ? String(sec.code) : null,
      weather: w.entity || null, place: w.location_name || null, radar: w.radar === false ? false : (typeof w.radar === 'object' && w.radar) || {},
      tvs, allLights, scenes, tabs, hasSec, acc: gwpHex(c.accent), idle: c.idle_seconds != null ? Number(c.idle_seconds) : 120,
      bg: gwpArr(c.background).length >= 2 ? gwpArr(c.background).map(gwpHex) : ['#0f172a', '#312e81', '#0f766e', '#1e3a8a', '#4c1d95'] };
    this._ids = allLights.concat(speakers.map((x) => x[0]), sensors.map((x) => x[0]), batteries.map((x) => x[0]), tvs.map((x) => x.id), [this._k.alarm, this._k.camera, this._k.weather].filter(Boolean));
    this._view = this._view && tabs.some((t) => t[0] === this._view) ? this._view : 'home';
    this._spk = this._k.leader;
    this._sig = null; this._html = null;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      const r = this.shadowRoot;
      r.innerHTML = '<div id="app"></div>';
      this._app = r.getElementById('app');
      /* tap guard (capture phase): never rebuild the screen while a finger is down, so taps are not lost */
      const end = (ms) => { clearTimeout(this._tapT); this._tapT = setTimeout(() => this._endTap(), ms); };
      r.addEventListener('pointerdown', () => { this._tapping = true; end(1500); }, true);
      r.addEventListener('pointerup', () => end(250), true);
      r.addEventListener('pointercancel', () => end(0), true);
      r.addEventListener('click', () => { clearTimeout(this._tapT); this._endTap(); }, true);
      r.addEventListener('click', (e) => this._onClick(e));
      r.addEventListener('change', (e) => this._onChange(e));
      r.addEventListener('pointerdown', (e) => this._onDown(e));
      r.addEventListener('pointermove', (e) => this._onMove(e));
      r.addEventListener('pointerup', (e) => this._onUp(e, false));
      r.addEventListener('pointercancel', (e) => this._onUp(e, true));
      r.addEventListener('focusin', (e) => { if (e.target.classList && e.target.classList.contains('sq')) this._busy = true; });
      r.addEventListener('focusout', (e) => { if (e.target.classList && e.target.classList.contains('sq')) { this._q = e.target.value; this._busy = false; setTimeout(() => this._render(), 50); } });
      r.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('sq')) { this._q = e.target.value; e.target.blur(); this._search(); } });
      if (!document.getElementById('gwp-font')) {
        const l = document.createElement('link');
        l.id = 'gwp-font'; l.rel = 'stylesheet';
        l.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap';
        document.head.appendChild(l);
      }
    }
    if (this._h) this._render();
  }
  connectedCallback() {
    this._tick = setInterval(() => { const mn = new Date().getMinutes(); if (mn !== this._min) { this._min = mn; this._render(); } this._header(); }, 15000);
    this._onResize = () => { this._html = null; this._render(); };
    window.addEventListener('resize', this._onResize);
    this._onLoc = () => setTimeout(() => this._header(), 50);
    window.addEventListener('location-changed', this._onLoc);
    setTimeout(() => this._header(), 0);
  }
  disconnectedCallback() {
    clearInterval(this._tick); clearTimeout(this._idleT);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('location-changed', this._onLoc);
    (this._fcUnsub || []).forEach((u) => u.then((f) => f()).catch(() => {}));
    this._fcUnsub = null;
    if (this._hdr && this._hdr.parentNode) this._hdr.parentNode.removeChild(this._hdr);
    this._hdr = null;
  }
  getCardSize() { return 14; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }

  /* Hide Home Assistant's own header on this dashboard. Add ?edit=1 to the URL to get it back. */
  _header() {
    const want = this._c && this._c.hide_header !== false && new URLSearchParams(location.search).get('edit') !== '1' && this.isConnected;
    if (!want) { if (this._hdr && this._hdr.parentNode) this._hdr.parentNode.removeChild(this._hdr); this._hdr = null; return; }
    if (this._hdr && this._hdr.isConnected) return;
    let n = this;
    for (let i = 0; i < 14 && n; i++) {
      const root = n.getRootNode && n.getRootNode();
      n = root && root.host;
      if (n && n.tagName === 'HUI-ROOT' && n.shadowRoot) {
        const s = document.createElement('style');
        s.textContent = GWP_HEADER_CSS;
        n.shadowRoot.appendChild(s); this._hdr = s;
        this._html = null; this._render();
        return;
      }
    }
  }

  /* ---------- Home Assistant updates (batched: at most one redraw every 0.8 s) ---------- */
  set hass(h) {
    this._h = h;
    const now = Date.now();
    if (!this._last || now - this._last > 800) { this._last = now; this._update(); }
    else if (!this._ut) this._ut = setTimeout(() => { this._ut = null; this._last = Date.now(); this._update(); }, 800 - (now - this._last));
  }
  get hass() { return this._h; }
  _update() {
    const h = this._h;
    if (!h || !this._k) return;
    this._subForecast();
    let sig = '';
    for (const id of this._ids) { const s = h.states[id]; sig += id + (s ? s.state + s.last_updated : '-'); }
    if (sig !== this._sig) { this._sig = sig; if (this._busy) this._dirty = true; else this._render(); }
  }
  _subForecast() {
    const k = this._k, w = this._st(k.weather);
    if (!k.weather || this._fcUnsub || !this._h || !this._h.connection || !w || w.state === 'unavailable') return;
    if (this._fcRetry && Date.now() < this._fcRetry) return;
    this._fc = this._fc || {};
    const subs = ['hourly', 'daily'].map((t) => this._h.connection.subscribeMessage((msg) => {
      this._fc[t] = msg.forecast || [];
      if (this._view === 'weather' && !this._busy) this._render();
    }, { type: 'weather/subscribe_forecast', forecast_type: t, entity_id: k.weather }));
    this._fcUnsub = subs;
    subs.forEach((u) => u.catch(() => {
      if (this._fcUnsub !== subs) return;
      subs.forEach((x) => x.then((f) => f()).catch(() => {}));
      this._fcUnsub = null; this._fcRetry = Date.now() + 30000;
    }));
  }

  /* ---------- Music Assistant library ---------- */
  async _maId() {
    if (this._k.maEntry) return this._k.maEntry;
    if (!this._maFound) {
      const e = await this._h.callWS({ type: 'config_entries/get', domain: 'music_assistant' });
      if (!e || !e.length) throw new Error('no music_assistant entry');
      this._maFound = e[0].entry_id;
    }
    return this._maFound;
  }
  async _ma(service, data) {
    const id = await this._maId();
    const r = await this._h.callService('music_assistant', service, Object.assign({ config_entry_id: id }, data), undefined, false, true);
    return (r && r.response) || {};
  }
  _loadMusic(mode, force) {
    this._md = this._md || {}; this._mts = this._mts || {}; this._ml = this._ml || {};
    if (mode === 'search' || !this._h || this._ml[mode]) return;
    if (!force && this._md[mode] && Date.now() - this._mts[mode] < 300000) return;
    this._ml[mode] = true;
    const lib = (t, extra) => this._ma('get_library', Object.assign({ media_type: t, limit: 60, order_by: 'name' }, extra)).then((r) => r.items || []);
    const job = mode === 'fav' ? Promise.all(['artist', 'playlist', 'album', 'track'].map((t) => lib(t, { favorite: true, limit: 24 }))).then((a) => [].concat(...a))
      : mode === 'pl' ? lib('playlist') : lib('artist', { limit: 100 });
    job.then((items) => { this._md[mode] = items; this._merr = null; })
      .catch(() => { this._md[mode] = []; this._merr = 'Could not reach Music Assistant. If it is installed, set music.config_entry_id in the card config.'; })
      .finally(() => { this._ml[mode] = false; this._mts[mode] = Date.now(); if (this._view === 'music') this._render(); });
  }
  _search() {
    const q = (this._q || '').trim();
    this._md = this._md || {};
    if (!q) return;
    this._msearching = true; this._render();
    this._ma('search', { name: q, media_type: ['artist', 'playlist', 'album', 'track'], limit: 8 })
      .then((r) => { this._md.search = [].concat(r.artists || [], r.playlists || [], r.albums || [], r.tracks || []); this._merr = null; })
      .catch(() => { this._md.search = []; this._merr = 'Search failed. Try again.'; })
      .finally(() => { this._msearching = false; if (this._view === 'music') this._render(); });
  }

  /* ---------- weather radar (an overlay iframe, unloaded when the Weather tab is not showing) ---------- */
  _radarUrl() {
    const r = this._k.radar, cf = (this._h && this._h.config) || {};
    const lat = r.lat != null ? r.lat : cf.latitude, lon = r.lon != null ? r.lon : cf.longitude;
    if (lat == null || lon == null) return null;
    const imp = !cf.unit_system || /F/.test(cf.unit_system.temperature || '');
    return 'https://embed.windy.com/embed2.html?lat=' + lat + '&lon=' + lon + '&detailLat=' + lat + '&detailLon=' + lon + '&zoom=' + (r.zoom || 7) +
      '&level=surface&overlay=radar&product=radar&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=' +
      '&metricWind=' + (imp ? 'mph' : 'km%2Fh') + '&metricTemp=' + (imp ? '%C2%B0F' : '%C2%B0C') + '&radarRange=-1';
  }
  _placeRadar() {
    const ph = this._app && this._app.querySelector('.radarph');
    if (!ph) { if (this._radar) { this._radar.remove(); this._radar = null; } return; }
    if (!this._radar) {
      const url = this._radarUrl();
      if (!url) return;
      const f = document.createElement('iframe');
      f.src = url; f.title = 'Weather radar';
      f.style.cssText = 'position:absolute;border:0;border-radius:18px;z-index:2;display:none';
      this.shadowRoot.appendChild(f); this._radar = f;
    }
    const h = this.getBoundingClientRect(), r = ph.getBoundingClientRect();
    Object.assign(this._radar.style, { display: 'block', left: (r.left - h.left) + 'px', top: (r.top - h.top) + 'px', width: r.width + 'px', height: r.height + 'px' });
  }

  /* ---------- state helpers ---------- */
  _st(id) { return id && this._h && this._h.states[id]; }
  _call(d, s, data) { if (this._h) this._h.callService(d, s, data); }
  _name(id, given) { const s = this._st(id); return given || this._k.names[id] || (s && s.attributes && s.attributes.friendly_name) || id; }
  _place() { return this._k.place || (this._h && this._h.config && this._h.config.location_name) || 'Home'; }
  _lang() { return (this._h && this._h.locale && this._h.locale.language) || navigator.language || 'en-US'; }
  _rawLight(id) {
    const s = this._st(id);
    const off = !s || s.state === 'unavailable' || s.state === 'unknown';
    const on = !off && s.state === 'on';
    const a = (s && s.attributes) || {};
    const pct = on ? (a.brightness ? Math.max(1, Math.round(a.brightness / 2.55)) : 100) : 0;
    const rgb = on && Array.isArray(a.rgb_color) ? a.rgb_color : [255, 190, 120];
    const modes = a.supported_color_modes || [];
    return { id, off, on, pct, rgb, modes, minK: a.min_color_temp_kelvin || 2200, maxK: a.max_color_temp_kelvin || 6500, kelvin: a.color_temp_kelvin, name: this._name(id) };
  }
  /* what the finger just asked for wins over the old state until Home Assistant reports a newer one */
  _light(id) {
    const l = this._rawLight(id);
    const s = this._st(id);
    this._pct = this._pct || {};
    if (l.on) this._pct[id] = l.pct;
    const o = this._opt && this._opt[id];
    if (o) {
      if (l.off || Date.now() > o.until || (s && s.last_updated) !== o.stamp) delete this._opt[id];
      else { l.on = o.on; l.pct = o.on ? (o.pct != null ? o.pct : (this._pct[id] || 100)) : 0; }
    }
    return l;
  }
  _expect(ids, on, pct) {
    this._opt = this._opt || {};
    ids.forEach((id) => { const s = this._st(id); this._opt[id] = { on, pct, until: Date.now() + GWP_KEEP_MS, stamp: s && s.last_updated }; });
    clearTimeout(this._optT);
    this._optT = setTimeout(() => { this._html = null; this._render(); }, GWP_KEEP_MS + 100);
  }
  _fill(ids, livePct) {
    const ls = ids.map((id) => this._light(id));
    const live = ls.filter((l) => !l.off);
    if (!live.length) return { cls: 'offl', style: '', value: 'Offline', on: 0, live: 0 };
    const on = live.filter((l) => l.on);
    if (!on.length && livePct == null) return { cls: '', style: '', value: 'Off', on: 0, live: live.length };
    const p = livePct != null ? livePct : Math.round(on.reduce((t, l) => t + l.pct, 0) / on.length);
    const c = (on[0] || live[0]).rgb;
    const rgba = (al) => 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + al + ')';
    return { cls: 'lit', style: 'background:linear-gradient(90deg,' + rgba(0.62) + ' 0 ' + p + '%,' + rgba(0.16) + ' ' + p + '% 100%);border-color:' + rgba(0.6), value: p + '%', on: on.length, live: live.length, rgb: c, p };
  }
  _player(id) {
    const p = this._st(id);
    const a = (p && p.attributes) || {};
    const playing = !!p && p.state === 'playing';
    return { id, off: !p || p.state === 'unavailable', playing, title: a.media_title || (playing ? 'Playing' : 'Nothing playing'), artist: a.media_artist || '',
      art: a.entity_picture || '', vol: a.volume_level != null ? Math.round(a.volume_level * 100) : 0, members: a.group_members || [], name: this._name(id) };
  }
  /* speaker groups follow whichever zone is leading (group_members[0]) */
  _leaderOf(id) { const m = this._player(id).members; return m.length > 1 ? m[0] : id; }
  _inGroup(id) { return this._player(id).members.length > 1; }
  _joined(id) { return this._inGroup(id) && this._leaderOf(id) !== id; }
  _target() {
    const s = this._leaderOf(this._spk || this._k.leader);
    if (this._player(s).playing) return s;
    const f = this._k.speakers.map((x) => x[0]).find((x) => this._player(x).playing && this._leaderOf(x) === x);
    return f || s;
  }

  /* ---------- input ---------- */
  _poke() {
    clearTimeout(this._idleT);
    if (!(this._k.idle > 0)) return;
    this._idleT = setTimeout(() => { if (this._view !== 'home' || this._sel) { this._view = 'home'; this._sel = null; this._render(); } }, this._k.idle * 1000);
  }
  _endTap() { this._tapping = false; if (this._pending) { this._pending = false; this._render(); } }
  _onDown(e) {
    this._poke();
    const t = e.target;
    if (t.matches && t.matches('input[type=range]')) { this._busy = true; this._rangeBusy = true; return; }
    const el = t.closest && t.closest('[data-drag]');
    if (!el || el.classList.contains('offl')) return;
    const ids = el.dataset.drag.split(',');
    const on = ids.map((id) => this._light(id)).filter((l) => !l.off && l.on);
    const start = on.length ? Math.round(on.reduce((n, l) => n + l.pct, 0) / on.length) : 0;
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
    this._d = { el, ids, x: e.clientX, w: el.getBoundingClientRect().width || 200, start, pct: start, moved: false, hold: el.dataset.hold, t0: Date.now() };
    this._busy = true;
  }
  _onMove(e) {
    const d = this._d;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 8) return;
    d.moved = true;
    d.pct = Math.max(1, Math.min(100, Math.round(d.start + (dx / d.w) * 100)));
    const f = this._fill(d.ids, d.pct);
    d.el.className = d.el.className.replace(/\b(lit|offl)\b/g, '').trim() + ' lit';
    d.el.setAttribute('style', f.style);
    const v = d.el.querySelector('.tv'); if (v) v.textContent = d.pct + '%';
  }
  _onUp(e, cancelled) {
    if (this._rangeBusy) { this._rangeBusy = false; setTimeout(() => this._release(), 400); return; }
    const d = this._d;
    if (!d) return;
    this._d = null;
    if (!cancelled) {
      const live = d.ids.filter((id) => !this._rawLight(id).off);
      if (d.moved) {
        if (live.length) { this._call('light', 'turn_on', { entity_id: live, brightness_pct: d.pct }); this._expect(live, true, d.pct); }
      } else if (Date.now() - d.t0 >= GWP_HOLD_MS && d.hold && d.hold.indexOf('sel:') === 0) {
        this._sel = d.hold.slice(4);
      } else if (live.length) {
        const anyOn = live.some((id) => this._light(id).on);
        this._call('light', anyOn ? 'turn_off' : 'turn_on', { entity_id: live });
        this._expect(live, !anyOn, null);
      }
    }
    this._release();
  }
  _release() { this._busy = false; this._dirty = false; this._html = null; this._render(); }
  _allOff() { const ids = this._k.allLights.filter((x) => !this._rawLight(x).off); if (ids.length) { this._call('light', 'turn_off', { entity_id: ids }); this._expect(ids, false, null); } }
  _onClick(e) {
    this._poke();
    const el = e.target.closest && e.target.closest('[data-a]');
    if (!el) return;
    const a = el.dataset.a, id = el.dataset.id;
    if (a === 'view') { this._view = id; this._sel = null; this._render(); return; }
    if (a === 'scene') {
      if (id === '__alloff') this._allOff(); else this._call('scene', 'turn_on', { entity_id: id });
      this._lastScene = el.dataset.name; this._render(); return;
    }
    if (a === 'alloff') { this._allOff(); this._render(); return; }
    if (a === 'grp') {
      const ids = id.split(',').filter((x) => !this._rawLight(x).off);
      const anyOn = ids.some((x) => this._light(x).on);
      if (ids.length) { this._call('light', anyOn ? 'turn_off' : 'turn_on', { entity_id: ids }); this._expect(ids, !anyOn, null); }
      this._render(); return;
    }
    if (a === 'closesel') { this._sel = null; this._render(); return; }
    if (a === 'kelvin') { this._call('light', 'turn_on', { entity_id: this._sel, color_temp_kelvin: Number(id) }); return; }
    if (a === 'hs') { this._call('light', 'turn_on', { entity_id: this._sel, hs_color: id.split('|').map(Number) }); return; }
    if (a === 'spk') { this._spk = id; this._render(); return; }
    if (a === 'mmode') { this._mmode = id; this._render(); return; }
    if (a === 'pickfor') { this._spk = id; this._view = 'music'; this._sel = null; this._render(); return; }
    if (a === 'msearch') { const i = this.shadowRoot.querySelector('.sq'); if (i) this._q = i.value; this._search(); return; }
    if (a === 'playm') {
      this._call('music_assistant', 'play_media', { entity_id: this._spk, media_id: el.dataset.uri, media_type: el.dataset.type, enqueue: 'replace' });
      this._toast = 'Playing ' + el.dataset.name + ' on ' + this._player(this._spk).name;
      clearTimeout(this._toastT); this._toastT = setTimeout(() => { this._toast = null; this._render(); }, 3500);
      this._render(); return;
    }
    if (a === 'play') { this._call('media_player', 'media_play_pause', { entity_id: id }); return; }
    if (a === 'next') { this._call('media_player', 'media_next_track', { entity_id: id }); return; }
    if (a === 'prev') { this._call('media_player', 'media_previous_track', { entity_id: id }); return; }
    if (a === 'join') {
      if (this._inGroup(id)) this._call('media_player', 'unjoin', { entity_id: id });
      else { const t = this._target(); if (t !== id) this._call('media_player', 'join', { entity_id: t, group_members: [id] }); }
      return;
    }
    if (a === 'alarm') { const d = { entity_id: this._k.alarm }; if (this._k.alarmCode) d.code = this._k.alarmCode; this._call('alarm_control_panel', id, d); return; }
    if (a === 'tvpower') { const t = this._st(id); this._call('media_player', t && t.state !== 'off' && t.state !== 'unavailable' ? 'turn_off' : 'turn_on', { entity_id: id }); return; }
    if (a === 'tvvol') { this._call('media_player', el.dataset.dir === 'up' ? 'volume_up' : 'volume_down', { entity_id: id }); return; }
    if (a === 'tvmute') { const t = this._st(id); this._call('media_player', 'volume_mute', { entity_id: id, is_volume_muted: !(t && t.attributes.is_volume_muted) }); return; }
    if (a === 'tvapp') {
      const t = this._st(id), launch = () => this._call('media_player', 'play_media', { entity_id: id, media_content_type: el.dataset.kind || 'app', media_content_id: el.dataset.app });
      if (t && t.state !== 'off' && t.state !== 'unavailable') launch(); else { this._call('media_player', 'turn_on', { entity_id: id }); setTimeout(launch, 8000); }
      return;
    }
  }
  _onChange(e) {
    const el = e.target;
    if (!el.dataset || !el.dataset.a) return;
    const v = Number(el.value);
    if (el.dataset.a === 'bri') this._call('light', 'turn_on', { entity_id: el.dataset.id, brightness_pct: Math.max(1, v) });
    if (el.dataset.a === 'vol') this._call('media_player', 'volume_set', { entity_id: el.dataset.id, volume_level: Math.max(0, Math.min(1, v / 100)) });
    this._rangeBusy = false;
    setTimeout(() => this._release(), 300);
  }

  /* ---------- pieces ---------- */
  _chip(ids, name) {
    const f = this._fill(ids);
    return '<button class="chip ' + f.cls + '" style="' + f.style + '" data-drag="' + ids.join(',') + '"' +
      ' aria-label="' + gwpEsc(name + ', ' + f.value + '. Tap to toggle, drag to dim.') + '"><span class="tn">' + gwpEsc(name) + '</span><span class="tv">' + f.value + '</span></button>';
  }
  _tile(id) {
    const l = this._light(id);
    const f = this._fill([id]);
    const dot = l.on ? 'background:rgb(' + l.rgb.join(',') + ');box-shadow:0 0 14px rgb(' + l.rgb.join(',') + ')' : '';
    return '<button class="tile ' + f.cls + (this._sel === id ? ' selr' : '') + '" style="' + f.style + '" data-drag="' + id + '" data-hold="sel:' + id + '"' +
      ' aria-label="' + gwpEsc(l.name + ', ' + f.value + '. Tap to toggle, drag to dim, hold for color.') + '"><span class="dot" style="' + dot + '"></span>' +
      '<span class="tt"><span class="tn">' + gwpEsc(l.name) + '</span><span class="tv">' + f.value + '</span></span></button>';
  }
  _roomIds(r) { return [].concat(...r.groups.map((g) => g[1].map((x) => x[0]))); }
  _roomStatus(r) {
    const ls = this._roomIds(r).map((id) => this._light(id));
    const live = ls.filter((l) => !l.off), on = live.filter((l) => l.on);
    if (!live.length) return 'Offline';
    return (on.length ? on.length + ' of ' + live.length + ' on' : 'All off') + (live.length < ls.length ? ' · ' + (ls.length - live.length) + ' offline' : '');
  }
  _speakerCard(id, compact) {
    if (!compact) id = this._target();
    const m = this._player(id), tgt = this._target();
    const art = m.art ? '<img class="art" src="' + gwpEsc(m.art) + '" alt="">' : '<div class="art"></div>';
    const pick = '<button class="ghost' + (id === tgt ? '' : ' wide') + '" data-a="pickfor" data-id="' + id + '">Pick music</button>';
    const btns = id === tgt ? pick : '<div class="g2">' + pick + '<button class="ghost wide" data-a="join" data-id="' + id + '">' + gwpEsc(this._inGroup(id) ? 'Leave group' : 'Join ' + this._player(tgt).name) + '</button></div>';
    return '<div class="np">' + art + '<div class="npt"><p class="t1">' + gwpEsc(m.title) + '</p><p class="t2">' + gwpEsc(m.artist || (m.off ? 'Offline' : m.name)) + '</p></div></div>' +
      '<div class="ctrls">' + (compact ? '' : '<button class="rb" data-a="prev" data-id="' + id + '" aria-label="Previous track">' + gwpSvg('prev', 20) + '</button>') +
      '<button class="pb" data-a="play" data-id="' + id + '" aria-label="' + (m.playing ? 'Pause' : 'Play') + '">' + (m.playing ? GWP_PAUSE : GWP_PLAY) + '</button>' +
      (compact ? '' : '<button class="rb" data-a="next" data-id="' + id + '" aria-label="Next track">' + gwpSvg('next', 20) + '</button>') +
      '<label class="vl"><span>Vol</span><input type="range" min="0" max="100" value="' + m.vol + '" data-a="vol" data-id="' + id + '" aria-label="Volume"></label></div>' + btns;
  }
  _groupLabel() {
    const t = this._target(), n = this._player(t).members.filter((x) => x !== t).length;
    return this._player(t).name + (n ? ' + ' + n + ' more' : '');
  }
  _security() {
    const k = this._k, a = this._st(k.alarm);
    const alarm = a ? a.state : 'unavailable';
    const isOn = (id) => { const s = this._st(id); return !!s && s.state === 'on'; };
    const kind = (t) => k.sensors.filter((d) => (t === 'door' ? d[2] === 'door' || d[2] === 'window' : d[2] === t));
    const low = k.batteries.filter((b) => { const s = this._st(b[0]); return s && !isNaN(parseFloat(s.state)) && parseFloat(s.state) < k.low; })
      .map((b) => this._name(b[0]) + ' ' + Math.round(parseFloat(this._st(b[0]).state)) + '%');
    return { alarm, label: GWP_ALARM_LABEL[alarm] || (alarm === 'unavailable' ? 'Offline' : alarm), doors: kind('door'), open: kind('door').filter((d) => isOn(d[0])),
      motions: kind('motion').map((d) => [this._name(d[0]), isOn(d[0])]), leaks: kind('leak'), wet: kind('leak').filter((d) => isOn(d[0])), low };
  }
  _tvCard(tv, wide) {
    const id = tv.id, name = this._name(id), s = this._st(id);
    if (!s) return '<div class="room tvc dim' + (wide ? ' tvw' : '') + '"><div class="rhead"><span class="tt"><span class="tn big">' + gwpEsc(name) + '</span><span class="ts">Not found in Home Assistant</span></span>' +
      '<span class="pw">' + gwpSvg('power', 18) + '</span></div></div>';
    const a = s.attributes || {};
    const off = s.state === 'unavailable';
    const on = !off && s.state !== 'off';
    const status = off ? 'Offline' : on ? 'On' + (a.is_volume_muted ? ' · muted' : '') : 'Off';
    const apps = tv.apps.map(([n, app, c]) => '<button class="app" style="background:' + gwpRgba(c, .22) + ';border-color:' + gwpRgba(c, .7) + '" data-a="tvapp" data-id="' + id + '" data-kind="' + gwpEsc(tv.appType) + '" data-app="' + gwpEsc(app) + '">' + gwpEsc(n) + '</button>').join('');
    return '<div class="room tvc' + (wide ? ' tvw' : '') + '"><div class="rhead"><span class="tt"><span class="tn big">' + gwpEsc(name) + '</span><span class="ts">' + gwpEsc(status) + '</span></span>' +
      '<button class="pwl ' + (on ? 'on' : '') + '" data-a="tvpower" data-id="' + id + '" aria-label="' + (on ? 'Turn TV off' : 'Turn TV on') + '">' + gwpSvg('power', 16) + (on ? 'Off' : 'On') + '</button></div>' +
      (apps ? '<div class="apps">' + apps + '</div>' : '') +
      '<div class="tvrow"><button class="tvb" data-a="tvvol" data-dir="down" data-id="' + id + '" aria-label="Volume down">−</button>' +
      '<button class="tvb sm" data-a="tvmute" data-id="' + id + '">' + (a.is_volume_muted ? 'Unmute' : 'Mute') + '</button>' +
      '<button class="tvb" data-a="tvvol" data-dir="up" data-id="' + id + '" aria-label="Volume up">+</button></div></div>';
  }
  _alarmChip(sec) { return this._k.alarm ? '<span class="pill ' + (sec.alarm === 'disarmed' ? 'ok' : sec.alarm === 'triggered' ? 'bad' : 'warn') + '">' + gwpEsc(sec.label) + '</span>' : ''; }
  _camImg(cls) {
    const cam = this._st(this._k.camera);
    return cam && cam.attributes.entity_picture ? '<img class="' + cls + '" src="' + gwpEsc(cam.attributes.entity_picture) + '" alt="' + gwpEsc(this._k.cameraName) + '">' : '';
  }
  _lightSummary() {
    const k = this._k;
    const on = k.allLights.filter((id) => this._light(id).on).length;
    const rooms = k.rooms.filter((r) => this._roomIds(r).some((id) => this._light(id).on)).length;
    return on ? on + (on === 1 ? ' light' : ' lights') + ' on in ' + rooms + (rooms === 1 ? ' room' : ' rooms') : 'Every light is off';
  }

  /* ---------- views ---------- */
  _home() {
    const k = this._k, sec = this._security();
    const scenes = k.scenes.map(([n, id, d, ic]) => '<button class="scene ' + (this._lastScene === n ? 'act' : '') + '" data-a="scene" data-id="' + gwpEsc(id) + '" data-name="' + gwpEsc(n) + '">' +
      '<span class="ic">' + gwpSvg(ic, 18) + '</span><span class="tt"><span class="tn big">' + gwpEsc(n) + '</span><span class="ts">' + gwpEsc(d) + '</span></span></button>').join('');
    const visible = k.rooms.filter((r) => this._roomIds(r).some((id) => !this._light(id).off));
    const rooms = visible.map((r) => {
      const f = this._fill(this._roomIds(r));
      const dest = r.page || 'lights';
      const glow = f.on ? 'background:rgba(' + f.rgb.join(',') + ',.55);box-shadow:0 0 18px rgba(' + f.rgb.join(',') + ',.6)' : '';
      return '<div class="room"><button class="rhead" data-a="view" data-id="' + dest + '" aria-label="Open ' + gwpEsc(r.name) + '"><span class="tt"><span class="tn big">' + gwpEsc(r.name) + '</span><span class="ts">' + this._roomStatus(r) + '</span></span>' +
        '<span class="go" style="' + glow + '">' + gwpSvg('chev', 15) + '</span></button>' +
        r.groups.slice(0, 2).map((g) => this._chip(g[1].map((x) => x[0]), g[0])).join('') + '</div>';
    }).join('') + k.tvs.filter((t) => t.home).map((t) => this._tvCard(t, true)).join('');
    const left = (scenes ? '<section class="card"><div class="hd"><h2>Scenes</h2><p>' + gwpEsc(this._lastScene ? this._lastScene + ' sent' : 'Tap to set the mood') + '</p></div><div class="g4">' + scenes + '</div></section>' : '') +
      '<section class="card grow scroll"><div class="hd"><h2>Rooms</h2><p>' + (k.allLights.length ? this._lightSummary() : '') + '</p></div>' +
      (rooms ? '<div class="g3">' + rooms + '</div>' : '<p class="ts">Add rooms and lights to this card\'s config to see them here.</p>') + '</section>';
    const music = k.speakers.length ? '<section class="card' + (k.hasSec ? '' : ' grow') + '"><div class="hd"><h2>Music</h2><p>' + gwpEsc(this._groupLabel()) + '</p></div>' + this._speakerCard(k.leader, false) + '</section>' : '';
    let secCard = '';
    if (k.hasSec) {
      const rows = (sec.doors.length ? '<div class="kv"><span>Doors and windows</span><b class="' + (sec.open.length ? 'warnt' : 'okt') + '">' + (sec.open.length ? gwpEsc(sec.open.map((d) => this._name(d[0])).join(', ')) + ' open' : 'All closed') + '</b></div>' : '') +
        sec.motions.map(([n, on]) => '<div class="kv"><span>' + gwpEsc(n) + '</span><b>' + (on ? 'Detected' : 'Clear') + '</b></div>').join('') +
        (sec.leaks.length ? '<div class="kv"><span>Water leak</span><b class="' + (sec.wet.length ? 'badt' : 'okt') + '">' + (sec.wet.length ? 'WET' : 'Dry') + '</b></div>' : '') +
        (k.batteries.length ? '<div class="kv"><span>Low batteries</span><b class="' + (sec.low.length ? 'warnt' : 'okt') + '">' + gwpEsc(sec.low.length ? sec.low.join(', ') : 'None') + '</b></div>' : '');
      secCard = '<section class="card grow"><div class="hd"><h2>Security</h2>' + this._alarmChip(sec) + '</div>' + rows + this._camImg('camsm') + '<button class="ghost push" data-a="view" data-id="security">Open security</button></section>';
    }
    const right = music + secCard;
    return '<div class="row"><div class="col c7">' + left + '</div>' + (right ? '<div class="col c5">' + right + '</div>' : '') + '</div>';
  }
  _lights() {
    const rooms = this._k.rooms.filter((r) => r.groups.length).map((r) => '<div class="lroom"><div class="lrh"><h3>' + gwpEsc(r.name) + '</h3><span class="ts">' + this._roomStatus(r) + '</span></div>' +
      '<div class="g6">' + this._roomIds(r).map((id) => this._tile(id)).join('') + '</div></div>').join('');
    return '<section class="card grow scroll"><div class="hd"><div><h2 class="h2b">Every light, by room</h2><p>' + this._lightSummary() + '. Drag to dim, hold for color.</p></div>' +
      '<button class="ghost" data-a="alloff">All off</button></div>' + rooms + '</section>';
  }
  _music() {
    const k = this._k, tgt = this._target();
    if (!this._st(this._spk) && k.speakers.length) this._spk = k.leader;
    const sp = this._player(this._spk);
    let library = '';
    if (k.library) {
      const mode = this._mmode || 'fav';
      this._loadMusic(mode);
      const tabs = GWP_MMODES.map(([id, l]) => '<button class="mtab ' + (mode === id ? 'act' : '') + '" data-a="mmode" data-id="' + id + '">' + l + '</button>').join('');
      const items = (this._md || {})[mode];
      const tile = (it) => {
        const t = it.media_type, ar = t === 'artist';
        const sub = t === 'track' && it.artists && it.artists[0] ? it.artists[0].name : GWP_TYPE[t] || t;
        const img = it.image ? '<img src="' + gwpEsc(it.image) + '" alt="" loading="lazy">' : '<span class="ph">' + gwpEsc((it.name || '?').charAt(0)) + '</span>';
        return '<button class="mt' + (ar ? ' ar' : '') + '" data-a="playm" data-uri="' + gwpEsc(it.uri) + '" data-type="' + gwpEsc(t) + '" data-name="' + gwpEsc(it.name) + '">' + img +
          '<span class="tn">' + gwpEsc(it.name) + '</span><span class="ts">' + gwpEsc(sub) + '</span></button>';
      };
      const empty = { fav: 'Nothing favorited yet. Mark artists or playlists as favorites in Music Assistant and they show up here.', pl: 'No playlists yet.', ar: 'No artists yet.', search: 'Search your music providers for any artist, song, album or playlist.' };
      const body = mode === 'search' && this._msearching ? '<p class="ts">Searching…</p>'
        : mode === 'search' && !items ? '<p class="ts">' + empty.search + '</p>'
        : !items ? '<p class="ts">Loading…</p>'
        : this._merr ? '<p class="ts">' + gwpEsc(this._merr) + '</p>'
        : items.length ? '<div class="mgrid">' + items.map(tile).join('') + '</div>' : '<p class="ts">' + empty[mode] + '</p>';
      const sbar = mode === 'search' ? '<div class="sbar"><input class="sq" type="search" enterkeyhint="search" placeholder="Artist, song, album or playlist" value="' + gwpEsc(this._q || '') + '"><button class="ghost" data-a="msearch">Search</button></div>' : '';
      library = '<section class="card c7 grow"><div class="hd"><div class="mtabs">' + tabs + '</div><p>Plays on <b>' + gwpEsc(sp.name) + '</b></p></div>' + sbar + '<div class="mscroll">' + body + '</div></section>';
    }
    const zones = k.speakers.map(([id]) => {
      const p = this._player(id), sel = id === this._spk, ing = this._inGroup(id), joined = this._joined(id);
      const st = (p.off ? 'Offline' : joined ? 'With ' + this._player(this._leaderOf(id)).name : ing ? 'Leading +' + (p.members.length - 1) : p.playing ? 'Playing' : 'Idle') + ' · vol ' + p.vol;
      const jb = p.off ? '' : ing ? '<button class="jn on" data-a="join" data-id="' + id + '">Leave</button>' : id === tgt ? '<span class="lead">Source</span>' : '<button class="jn" data-a="join" data-id="' + id + '">Join</button>';
      return '<div class="zone sm ' + (sel ? 'act' : '') + '"><button class="zpick" data-a="spk" data-id="' + id + '"><span class="tn">' + gwpEsc(p.name) + '</span><span class="ts">' + gwpEsc(st) + '</span></button>' + jb + '</div>';
    }).join('');
    const art = sp.art ? '<img class="art" src="' + gwpEsc(sp.art) + '" alt="">' : '<div class="art"></div>';
    return '<div class="row">' + library + '<div class="col ' + (library ? 'c5' : 'grow') + '"><section class="card"><div class="np">' + art + '<div class="npt"><p class="t1">' + gwpEsc(sp.title) + '</p><p class="t2">' + gwpEsc((sp.artist ? sp.artist + ' · ' : '') + sp.name) + '</p></div></div>' +
      '<div class="ctrls"><button class="rb" data-a="prev" data-id="' + sp.id + '" aria-label="Previous track">' + gwpSvg('prev', 20) + '</button>' +
      '<button class="pb" data-a="play" data-id="' + sp.id + '" aria-label="' + (sp.playing ? 'Pause' : 'Play') + '">' + (sp.playing ? GWP_PAUSE : GWP_PLAY) + '</button>' +
      '<button class="rb" data-a="next" data-id="' + sp.id + '" aria-label="Next track">' + gwpSvg('next', 20) + '</button>' +
      '<label class="vl"><span>Vol</span><input type="range" min="0" max="100" value="' + sp.vol + '" data-a="vol" data-id="' + sp.id + '" aria-label="Volume"></label></div></section>' +
      '<section class="card grow scroll"><div class="hd"><h2>Speakers</h2><p>Tap one to play there</p></div><div class="zl">' + zones + '</div></section></div></div>';
  }
  _securityView() {
    const k = this._k, sec = this._security();
    const camImg = k.camera ? (this._camImg('cam') || '<div class="cam ph">Camera unavailable</div>') : '';
    const modes = k.alarm ? [['alarm_disarm', 'Disarm', 'disarmed']].concat(k.alarmModes)
      .map(([svc, l, s]) => '<button class="mode ' + (sec.alarm === s ? 'act' : '') + '" data-a="alarm" data-id="' + svc + '">' + l + '</button>').join('') : '';
    const list = k.sensors.map(([id, , t]) => {
      const s = this._st(id), on = s && s.state === 'on', off = !s || s.state === 'unavailable';
      const txt = off ? 'Offline' : t === 'motion' ? (on ? 'Motion' : 'Clear') : t === 'leak' ? (on ? 'WET' : 'Dry') : (on ? 'Open' : 'Closed');
      return '<div class="li"><span>' + gwpEsc(this._name(id)) + '</span><b class="' + (off ? '' : on ? (t === 'motion' ? '' : t === 'leak' ? 'badt' : 'warnt') : 'okt') + '">' + txt + '</b></div>';
    }).join('');
    const bats = k.batteries.map(([id]) => {
      const s = this._st(id), val = s && !isNaN(parseFloat(s.state)) ? Math.round(parseFloat(s.state)) : null;
      return '<div class="kv"><span>' + gwpEsc(this._name(id)) + '</span><b class="' + (val == null ? '' : val < k.low ? 'badt' : 'okt') + '">' + (val == null ? '—' : val + '%') + '</b></div>';
    }).join('');
    const right = (camImg ? '<section class="card grow"><div class="hd"><h2>' + gwpEsc(k.cameraName) + '</h2></div>' + camImg + '</section>' : '') +
      (bats ? '<section class="card' + (camImg ? '' : ' grow scroll') + '"><div class="hd"><h2>Batteries</h2></div><div class="g2 kvg">' + bats + '</div></section>' : '');
    return '<div class="row"><section class="card c5 grow scroll"><div class="hd"><h2 class="h2b">' + gwpEsc(k.alarm ? k.secTitle : 'Sensors') + '</h2>' + this._alarmChip(sec) + '</div>' +
      (modes ? '<div class="g3">' + modes + '</div>' : '') + '<div class="list">' + (list || '<p class="ts">No sensors configured.</p>') + '</div></section>' +
      (right ? '<div class="col c7">' + right + '</div>' : '') + '</div>';
  }
  _weatherView() {
    const k = this._k, w = this._st(k.weather), lang = this._lang();
    const radar = k.radar === false ? '' : '<section class="card c7 grow"><div class="hd"><h2>Radar</h2><p>Live, centered on ' + gwpEsc(this._place()) + '</p></div><div class="radarph"></div></section>';
    if (!w || w.state === 'unavailable') return '<div class="row"><section class="card c5 grow center"><p class="t1">Forecast is reconnecting…</p><p class="t2">It will fill in by itself.</p></section>' + radar + '</div>';
    const a = w.attributes || {}, fc = this._fc || {}, cond = GWP_COND[w.state] || [w.state, 'cloud'];
    const ws = a.wind_speed_unit || '';
    const today = (fc.daily || [])[0] || {};
    const ic = (c, n) => gwpSvg((GWP_COND[c] || ['', 'cloud'])[1], n);
    const r0 = (x) => (x == null ? '—' : Math.round(x));
    const stats = [['Feels like', r0(a.apparent_temperature != null ? a.apparent_temperature : a.temperature) + '°'], ['High / low', r0(today.temperature) + '° / ' + r0(today.templow) + '°'],
      ['Humidity', r0(a.humidity) + '%'], ['Wind', r0(a.wind_speed) + ' ' + ws]]
      .map(([l, v]) => '<div class="wst"><span class="ts">' + l + '</span><b>' + gwpEsc(v) + '</b></div>').join('');
    const hours = (fc.hourly || []).slice(0, 8).map((h) => {
      const t = new Date(h.datetime).toLocaleTimeString(lang, { hour: 'numeric' }).replace(' ', '').toLowerCase();
      return '<div class="hr1"><span>' + t + '</span>' + ic(h.condition, 20) + '<b>' + r0(h.temperature) + '°</b>' + (h.precipitation_probability ? '<span class="pp">' + r0(h.precipitation_probability) + '%</span>' : '<span>&nbsp;</span>') + '</div>';
    }).join('');
    const days = (fc.daily || []).slice(0, 6);
    const lo = Math.min(...days.map((d) => (d.templow != null ? d.templow : d.temperature))), hi = Math.max(...days.map((d) => d.temperature));
    const span = Math.max(1, hi - lo);
    const dayRows = days.map((d, i) => {
      const dl = d.templow != null ? d.templow : d.temperature;
      const name = i === 0 ? 'Today' : new Date(d.datetime).toLocaleDateString(lang, { weekday: 'short' });
      return '<div class="day"><span>' + name + '</span>' + ic(d.condition, 20) + '<span class="ts">' + gwpEsc((GWP_COND[d.condition] || [d.condition])[0]) + '</span>' +
        '<span class="lo">' + r0(dl) + '°</span><span class="bar"><i style="left:' + ((dl - lo) / span * 100) + '%;right:' + ((hi - d.temperature) / span * 100) + '%"></i></span><span>' + r0(d.temperature) + '°</span></div>';
    }).join('');
    return '<div class="row"><div class="col ' + (radar ? 'c5' : 'grow') + '"><section class="card"><div class="wxnow"><div class="wxic">' + ic(w.state, 40) + '</div>' +
      '<div><p class="wxbig">' + r0(a.temperature) + '°</p></div><div><p class="wxc">' + gwpEsc(cond[0]) + '</p><p class="wxs">' + gwpEsc(this._place()) + '</p></div></div>' +
      '<div class="wxstats">' + stats + '</div></section>' +
      '<section class="card grow scroll"><div class="hd"><h2>Next hours</h2></div><div class="hours">' + (hours || '<p class="ts">Loading forecast…</p>') + '</div>' +
      '<div class="hd"><h2>This week</h2></div><div class="days">' + dayRows + '</div></section></div>' + radar + '</div>';
  }
  _roomView(r) {
    const all = this._roomIds(r);
    const wide = r.groups.length > 2;
    const groups = r.groups.map((g) => {
      const ids = g[1].map((x) => x[0]);
      const anyOn = ids.some((id) => this._light(id).on);
      return '<div class="grp"><div class="gh"><h3>' + gwpEsc(g[0]) + '</h3><button class="mini" data-a="grp" data-id="' + ids.join(',') + '">' + (anyOn ? 'Turn off' : 'Turn on') + '</button></div>' +
        '<div class="' + (wide ? 'g3' : 'g4') + '">' + ids.map((id) => this._tile(id)).join('') + '</div></div>';
    }).join('');
    const scenes = r.scenes.map(([n, id, sw]) => '<button class="rscene ' + (this._lastScene === n ? 'act' : '') + '" data-a="scene" data-id="' + gwpEsc(id) + '" data-name="' + gwpEsc(n) + '"><span class="sw" style="background:' + sw + '"></span>' + gwpEsc(n) + '</button>').join('');
    const f = this._fill(all);
    const master = all.length ? '<button class="chip whole ' + f.cls + '" style="' + f.style + '" data-drag="' + all.join(',') + '" aria-label="Whole room, ' + f.value + '"><span class="tn">Whole room</span><span class="tv">' + f.value + '</span></button>' : '';
    const tv = this._k.tvs.filter((t) => t.room === r.id).map((t) => this._tvCard(t)).join('');
    const sp = r.speaker ? this._player(r.speaker) : null;
    const side = (scenes ? '<section class="card' + (sp ? '' : ' grow scroll') + '"><div class="hd"><h2>Scenes</h2><p>Tap to set the mood</p></div><div class="g2">' + scenes + '</div></section>' : '') +
      (sp ? '<section class="card grow"><div class="hd"><h2>' + gwpEsc(sp.name) + '</h2><p>' + (sp.playing ? 'Playing' : 'Idle') + '</p></div>' + this._speakerCard(r.speaker, true) + '</section>' : '');
    return '<div class="row"><section class="card c8 grow scroll"><div class="hd"><div><h2 class="h2b">' + gwpEsc(r.name) + '</h2><p>' + this._roomStatus(r) + '</p></div>' + master + '</div>' + (wide ? '<div class="grps">' + groups + '</div>' : groups) +
      (tv ? '<div class="grp rtv"><div class="gh"><h3>TV</h3></div>' + tv + '</div>' : '') + '</section>' + (side ? '<div class="col c5">' + side + '</div>' : '') + '</div>';
  }
  _selSheet() {
    const l = this._light(this._sel);
    const hasCt = l.modes.indexOf('color_temp') > -1;
    const hasColor = l.modes.some((mo) => ['xy', 'hs', 'rgb', 'rgbw', 'rgbww'].indexOf(mo) > -1);
    const whites = hasCt ? '<p class="lab">White</p><div class="g5">' + GWP_WHITES.filter(([kv]) => kv >= l.minK - 50 && kv <= l.maxK + 50)
      .map(([kv, lab]) => '<button class="swb" data-a="kelvin" data-id="' + kv + '" aria-label="' + lab + '" style="background:' + GWP_WHITE_SWATCH[kv] + '"></button>').join('') + '</div><div class="kl"><span>Warm</span><span>Cool</span></div>' : '';
    const colors = hasColor ? '<p class="lab">Color</p><div class="g4">' + GWP_COLORS.map(([n, hs, sw]) => '<button class="swc" data-a="hs" data-id="' + hs.join('|') + '" aria-label="' + n + '" style="background:' + sw + '"></button>').join('') + '</div>' : '';
    const note = !hasCt && !hasColor ? '<p class="note">This light does brightness only.</p>' : !hasColor ? '<p class="note">This light does warm to cool white, not colors.</p>' : '';
    return '<aside class="sheet" aria-label="Light settings"><div class="sh"><span class="sdot" style="background:rgb(' + l.rgb.join(',') + ');box-shadow:0 0 26px rgb(' + l.rgb.join(',') + ')"></span>' +
      '<div><p class="t1">' + gwpEsc(l.name) + '</p><p class="t2">' + (l.off ? 'Offline' : l.on ? l.pct + '%' : 'Off') + '</p></div></div>' +
      '<p class="lab">Brightness</p><input type="range" min="1" max="100" value="' + (l.pct || 50) + '" data-a="bri" data-id="' + l.id + '" aria-label="Brightness">' +
      whites + colors + note + '<button class="done" data-a="closesel">Done</button></aside>';
  }

  /* ---------- render ---------- */
  _device() {
    const d = this._c.device;
    if (GWP_PROFILES[d]) return d;
    const ua = navigator.userAgent || '';
    if (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ipad';
    return window.innerWidth < 1100 ? 'fire8' : 'fire10';
  }
  _render() {
    if (!this.shadowRoot || !this._h || !this._k || this._busy) return;
    if (this._tapping) { this._pending = true; return; }
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => {
      this._raf = null;
      if (this._tapping) { this._pending = true; return; }
      if (!this._busy) this._draw();
    });
  }
  _draw() {
    const k = this._k, c = this._c, lang = this._lang();
    const now = new Date();
    const hr = now.getHours();
    const v = this._view;
    const room = k.rooms.find((r) => r.page && r.page === v);
    const hello = (hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening') + (c.name ? ', ' + c.name : '');
    const title = v === 'home' ? hello : room ? room.name : (k.tabs.find((t) => t[0] === v) || ['', hello])[1];
    const date = now.toLocaleDateString(lang, { weekday: 'long', month: 'long', day: 'numeric' });
    const time = now.toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]\.?M\.?/i, '');
    const w = this._st(k.weather);
    const weather = w && w.attributes.temperature != null && w.state !== 'unavailable' ? '<button class="wx" data-a="view" data-id="weather">' + gwpSvg((GWP_COND[w.state] || ['', 'cloud'])[1], 18) + gwpEsc(this._place()) + ' ' + Math.round(w.attributes.temperature) + '°</button>' : '';
    const tabs = k.tabs.length > 1 ? '<nav aria-label="Pages">' + k.tabs.map(([id, l]) => '<button class="tab ' + (v === id ? 'act' : '') + '" data-a="view" data-id="' + id + '">' + gwpEsc(l) + '</button>').join('') + '</nav>' : '';
    let body = v === 'lights' ? this._lights() : v === 'music' ? this._music() : v === 'security' ? this._securityView() : v === 'weather' ? this._weatherView() : room ? this._roomView(room) : this._home();
    if (this._sel) body += this._selSheet();
    if (this._toast) body += '<div class="toast" role="status">' + gwpEsc(this._toast) + '</div>';

    /* fit the 1280-wide design to whatever tablet this is */
    const dev = this._device();
    const phone = window.matchMedia('(max-width:900px)').matches;
    const hostW = this.clientWidth || window.innerWidth;
    const availH = Math.max(320, window.innerHeight - Math.max(0, this.getBoundingClientRect().top));
    let s = phone ? 1 : Math.max(0.55, Math.min(2, hostW / GWP_PROFILES[dev].width));
    if (Math.abs(s - 1) < 0.02) s = 1;
    this.style.height = phone ? '' : availH + 'px';
    this.style.overflow = phone ? '' : 'hidden';
    const fit = phone ? '' : 'width:' + Math.round(hostW / s) + 'px;height:' + Math.round(availH / s) + 'px;' + (s !== 1 ? 'transform:scale(' + s.toFixed(4) + ');transform-origin:0 0;' : '');

    const lite = !!c.lite;
    const blur = c.blur != null ? c.blur : 14;
    const acc = k.acc;
    const glass = lite ? 'background:rgba(22,30,52,.88);border:1px solid rgba(255,255,255,.14);'
      : 'background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(' + blur + 'px) saturate(160%);-webkit-backdrop-filter:blur(' + blur + 'px) saturate(160%);';
    const anim = !lite && c.animate === true;
    const html = '<style>' +
      ':host{display:block;position:relative}*{box-sizing:border-box}button{font:inherit;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}p,h1,h2,h3{margin:0}' +
      '@keyframes gwpa{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}' +
      '.root{position:relative;height:100vh;padding:20px 26px 22px;display:flex;flex-direction:column;gap:16px;overflow:hidden;font-family:Manrope,system-ui,-apple-system,"Segoe UI",sans-serif;color:#fff;' +
      'background:linear-gradient(-45deg,' + k.bg.join(',') + ');background-size:400% 400%;' + (anim ? 'animation:gwpa 30s ease infinite;' : '') + '}' +
      '@media (prefers-reduced-motion:reduce){.root{animation:none}}' +
      'header{display:flex;align-items:center;justify-content:space-between;gap:16px}header>div:first-child{min-width:0}' +
      '.date{font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.72);white-space:nowrap}h1{font-size:28px;font-weight:800;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      'nav{display:flex;gap:2px;padding:5px;border-radius:999px;background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.14);min-width:0;overflow-x:auto;scrollbar-width:none}nav::-webkit-scrollbar{display:none}' +
      '.tab{flex:none;border:0;border-radius:999px;min-height:44px;padding:0 14px;font-size:14px;font-weight:800;background:transparent;color:rgba(255,255,255,.88);white-space:nowrap}' +
      '.tab.act{background:' + acc + ';color:#0b1020;box-shadow:0 0 20px ' + gwpRgba(acc, .45) + '}' +
      '.hr{display:flex;align-items:center;gap:14px;flex:none}.wx{display:flex;align-items:center;gap:8px;height:40px;padding:0 14px;border-radius:999px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.14);font-size:15px;font-weight:700;color:#fff;white-space:nowrap}.wx svg{color:' + acc + '}' +
      '.clock{font-size:42px;font-weight:800;letter-spacing:-.03em;font-variant-numeric:tabular-nums}' +
      '.row{flex:1;min-height:0;display:flex;gap:16px}.col{display:flex;flex-direction:column;gap:16px;min-width:0;min-height:0}' +
      '.grow{flex:1}.c7{flex:7}.c5{flex:5}.c6{flex:6}.c8{flex:8}.col.grow,.card.grow{min-height:0}' +
      '.card{' + glass + 'box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 12px 32px rgba(0,0,0,.26);border-radius:26px;padding:16px 18px;display:flex;flex-direction:column;gap:12px;min-height:0;min-width:0}' +
      '.col>.grow{flex:1}.scroll{overflow-y:auto;scrollbar-width:none}.scroll::-webkit-scrollbar{display:none}.center{align-items:center;justify-content:center;gap:16px}' +
      '.hd{display:flex;justify-content:space-between;align-items:center;gap:12px;flex:none}.hd p{font-size:13px;font-weight:600;color:rgba(255,255,255,.72)}' +
      'h2{font-size:18px;font-weight:800}.h2b{font-size:22px}h3{font-size:14px;font-weight:800}' +
      '.g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}' +
      '.g4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.g5{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.g6{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}' +
      '.tn{font-size:14px;font-weight:800;line-height:1.2}.tn.big{font-size:16px}.ts{font-size:12px;font-weight:600;color:rgba(255,255,255,.74)}.tv{font-size:13px;font-weight:700;font-variant-numeric:tabular-nums}' +
      '.tt{display:flex;flex-direction:column;gap:2px;text-align:left;min-width:0}' +
      '.scene{min-height:86px;padding:12px 14px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;gap:8px}' +
      '.scene.act,.rscene.act{background:' + gwpRgba(acc, .24) + ';border-color:' + acc + '}' +
      '.ic{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.12);color:' + acc + '}' +
      '.room{border-radius:20px;padding:8px;background:rgba(0,0,0,.18);border:1px solid rgba(255,255,255,.10);display:flex;flex-direction:column;gap:8px}' +
      '.rhead{border:0;background:none;padding:4px 6px;min-height:44px;display:flex;align-items:center;justify-content:space-between;gap:8px}' +
      '.go{width:30px;height:30px;flex:none;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.10)}' +
      '.chip,.tile{touch-action:pan-y;user-select:none;-webkit-user-select:none;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07)}' +
      '.chip{height:46px;padding:0 12px;border-radius:14px;display:flex;align-items:center;justify-content:space-between;gap:8px}.chip .tn{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.chip.whole{width:300px;height:54px;border-radius:18px;flex:none}' +
      '.tile{height:96px;padding:10px 12px;border-radius:16px;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;text-align:left;overflow:hidden}' +
      '.offl{opacity:.45;background:rgba(0,0,0,.22);border-color:rgba(255,255,255,.08)}.selr{box-shadow:0 0 0 2px #fff}' +
      '.dot{width:12px;height:12px;flex:none;border-radius:50%;background:rgba(255,255,255,.28)}' +
      '.lroom{display:flex;flex-direction:column;gap:10px}.lrh{display:flex;align-items:baseline;gap:12px}' +
      '.grp{display:flex;flex-direction:column;gap:8px}.gh{display:flex;align-items:center;justify-content:space-between}.gh h3{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.72)}' +
      '.mini{min-height:36px;padding:0 14px;border-radius:999px;font-size:13px;font-weight:800;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.18)}' +
      '.rscene{min-height:52px;padding:0 12px;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);display:flex;align-items:center;gap:10px;font-size:14px;font-weight:800;text-align:left}' +
      '.sw{width:22px;height:22px;flex:none;border-radius:50%}' +
      '.np{display:flex;gap:14px;align-items:center}.art{width:64px;height:64px;flex:none;border-radius:16px;object-fit:cover;background:linear-gradient(135deg,#1e3a8a,#0f766e);border:1px solid rgba(255,255,255,.18)}' +
      '.npt{min-width:0}.t1{font-size:18px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.t2{font-size:13px;font-weight:600;color:rgba(255,255,255,.74)}' +
      '.ctrls{display:flex;align-items:center;gap:10px}' +
      '.rb{width:48px;height:48px;flex:none;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.18)}' +
      '.pb{width:56px;height:56px;flex:none;border-radius:50%;border:0;display:grid;place-items:center;background:' + acc + ';color:#0b1020;box-shadow:0 0 22px ' + gwpRgba(acc, .45) + '}' +
      '.vl{flex:1;min-width:0;display:flex;align-items:center;gap:10px;font-size:13px;font-weight:700;color:rgba(255,255,255,.74)}' +
      'input[type=range]{flex:1;min-width:0;width:100%;height:32px;accent-color:' + acc + '}' +
      '.ghost{align-self:flex-start;min-height:44px;padding:0 18px;border-radius:999px;font-size:14px;font-weight:800;background:' + gwpRgba(acc, .16) + ';border:1px solid ' + gwpRgba(acc, .6) + '}' +
      '.ghost.wide{align-self:stretch;border-radius:14px}.ghost.push{margin-top:auto}' +
      '.zone{border-radius:18px;padding:10px 10px 10px 14px;display:flex;align-items:center;gap:10px;background:rgba(0,0,0,.18);border:1px solid rgba(255,255,255,.10)}.zone.act{background:' + gwpRgba(acc, .22) + ';border-color:' + acc + '}' +
      '.zpick{flex:1;min-width:0;min-height:48px;border:0;background:none;padding:0;display:flex;flex-direction:column;justify-content:center;gap:2px;text-align:left}' +
      '.jn{min-height:40px;padding:0 14px;border-radius:999px;font-size:13px;font-weight:800;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.22)}.jn.on{background:' + acc + ';color:#0b1020}' +
      '.lead{font-size:12px;font-weight:800;color:rgba(255,255,255,.66);padding:0 8px}' +
      '.pill{font-size:13px;font-weight:800;padding:6px 12px;border-radius:999px;white-space:nowrap}.pill.ok{background:rgba(134,239,172,.16);color:#86efac}.pill.warn{background:rgba(252,211,77,.18);color:#fcd34d}.pill.bad{background:rgba(248,113,113,.25);color:#fecaca}' +
      '.kv,.li{display:flex;justify-content:space-between;gap:12px;font-size:15px;font-weight:600}.kv span,.li span{color:rgba(255,255,255,.82)}.kv b{text-align:right}.li{padding:11px 4px;border-bottom:1px solid rgba(255,255,255,.12);font-size:16px}.kvg{gap:8px 24px}' +
      '.okt{color:#86efac}.warnt{color:#fcd34d}.badt{color:#fca5a5}' +
      '.mode{min-height:58px;border-radius:16px;font-size:16px;font-weight:800;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16)}.mode.act{background:' + acc + ';color:#0b1020;border-color:transparent}' +
      '.cam{width:100%;flex:1;min-height:160px;border-radius:18px;object-fit:cover;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12)}.cam.ph{display:grid;place-items:center;color:rgba(255,255,255,.7);font-weight:600}' +
      '.sheet{position:absolute;top:100px;right:26px;width:330px;padding:18px;border-radius:26px;background:rgba(14,20,38,.95);border:1px solid rgba(255,255,255,.18);box-shadow:0 24px 60px rgba(0,0,0,.5);display:flex;flex-direction:column;gap:12px;z-index:5}' +
      '.sh{display:flex;align-items:center;gap:12px}.sdot{width:44px;height:44px;flex:none;border-radius:50%}' +
      '.lab{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.72)}' +
      '.swb{height:44px;border-radius:12px;border:0}.swc{height:44px;border-radius:50%;border:0}.kl{display:flex;justify-content:space-between;font-size:11px;font-weight:600;color:rgba(255,255,255,.66)}' +
      '.note{font-size:13px;font-weight:600;line-height:1.45;color:rgba(255,255,255,.72)}' +
      '.done{min-height:46px;border-radius:14px;border:0;font-size:15px;font-weight:800;background:' + acc + ';color:#0b1020}' +
      '.pw{width:44px;height:44px;flex:none;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.18)}' +
      '.tvrow{display:grid;grid-template-columns:1fr 1.4fr 1fr;gap:8px}.tvb{height:46px;border-radius:14px;font-size:20px;font-weight:800;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14)}.tvb.sm{font-size:14px}' +
      '.pwl{flex:none;white-space:nowrap;min-height:44px;padding:0 14px;border-radius:999px;display:flex;align-items:center;gap:8px;font-size:13px;font-weight:800;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.18)}.pwl.on{background:' + acc + ';color:#0b1020;border-color:transparent}' +
      '.apps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.app{min-height:46px;border-radius:14px;font-size:14px;font-weight:800;border:1px solid}' +
      '.tvw{grid-column:span 2;padding:10px 12px;gap:10px}.tvw .apps{grid-template-columns:repeat(4,minmax(0,1fr))}.tvw .app{min-height:52px;font-size:15px}.tvw .tvb{height:48px}.tvw .tvrow{grid-template-columns:1fr 2fr 1fr}' +
      '.tvc.dim{opacity:.55}.grps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 18px}.grps .tile{height:76px}.rtv .apps{grid-template-columns:repeat(4,minmax(0,1fr))}' +
      '.wxnow{display:flex;align-items:center;gap:18px}.wxbig{font-size:64px;font-weight:800;letter-spacing:-.04em;line-height:1}.wxic{width:72px;height:72px;flex:none;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.10);color:' + acc + '}' +
      '.wxc{font-size:20px;font-weight:800}.wxs{font-size:14px;font-weight:600;color:rgba(255,255,255,.78)}' +
      '.wxstats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.wst{border-radius:14px;padding:8px 10px;background:rgba(0,0,0,.18);display:flex;flex-direction:column;gap:2px}.wst b{font-size:16px}' +
      '.hours{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px}.hr1{border-radius:14px;padding:8px 4px;background:rgba(255,255,255,.06);display:flex;flex-direction:column;align-items:center;gap:4px;font-size:12px;font-weight:700;color:rgba(255,255,255,.8)}.hr1 b{font-size:15px;color:#fff}.hr1 svg{color:' + acc + '}.pp{color:' + acc + '}' +
      '.days{display:flex;flex-direction:column;gap:2px}.day{display:grid;grid-template-columns:52px 24px 1fr 38px 120px 38px;align-items:center;gap:10px;padding:7px 4px;border-bottom:1px solid rgba(255,255,255,.10);font-size:14px;font-weight:700}.day svg{color:' + acc + '}' +
      '.bar{position:relative;height:6px;border-radius:3px;background:rgba(255,255,255,.12)}.bar i{position:absolute;top:0;bottom:0;border-radius:3px;background:linear-gradient(90deg,' + acc + ',#fcd34d)}.lo{color:rgba(255,255,255,.65);text-align:right}' +
      '.radarph{flex:1;min-height:300px;border-radius:18px;background:rgba(0,0,0,.25)}' +
      '.mtabs{display:flex;gap:6px;flex-wrap:wrap}.mtab{min-height:42px;padding:0 16px;border-radius:999px;font-size:14px;font-weight:800;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14)}.mtab.act{background:' + acc + ';color:#0b1020;border-color:transparent}' +
      '.mscroll{flex:1;min-height:0;overflow-y:auto;margin:0 -4px;padding:0 4px;scrollbar-width:none}.mscroll::-webkit-scrollbar{display:none}.mgrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px 12px;align-content:start}' +
      '.mt{border:0;background:none;padding:0;display:flex;flex-direction:column;gap:4px;text-align:left;min-width:0}.mt img,.mt .ph{width:100%;aspect-ratio:1;border-radius:14px;object-fit:cover;background:linear-gradient(135deg,#1e3a8a,#0f766e);display:grid;place-items:center;font-size:30px;font-weight:800;box-shadow:0 8px 20px rgba(0,0,0,.25)}' +
      '.mt.ar img,.mt.ar .ph{border-radius:50%}.mt .tn,.mt .ts{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mt:active img{transform:scale(.96)}' +
      '.sbar{display:flex;gap:8px}.sbar .ghost{align-self:auto}.sq{flex:1;min-width:0;height:46px;border-radius:14px;border:1px solid rgba(255,255,255,.22);background:rgba(0,0,0,.25);color:#fff;font:inherit;font-size:16px;padding:0 14px}.sq::placeholder{color:rgba(255,255,255,.55)}' +
      '.zl{display:flex;flex-direction:column;gap:8px}.zone.sm{padding:6px 8px 6px 12px}.zone.sm .zpick{min-height:40px}' +
      '.toast{position:absolute;left:50%;bottom:28px;transform:translateX(-50%);padding:12px 22px;border-radius:999px;background:rgba(14,20,38,.95);border:1px solid rgba(255,255,255,.2);font-size:15px;font-weight:800;z-index:6;box-shadow:0 12px 30px rgba(0,0,0,.4);white-space:nowrap}' +
      '.camsm{width:100%;flex:1;min-height:0;max-height:230px;border-radius:16px;object-fit:cover;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12)}' +
      'button:focus-visible{outline:2px solid #fff;outline-offset:2px}' +
      /* Fire HD 8: same layout, tighter chrome so targets stay finger-sized after scaling */
      '.d-fire8.root{padding:14px 18px 16px;gap:12px}.d-fire8 .row,.d-fire8 .col{gap:12px}.d-fire8 .card{padding:13px 14px;border-radius:22px;gap:10px}.d-fire8 h1{font-size:24px}.d-fire8 .clock{font-size:36px}' +
      '.d-fire8 .tab{padding:0 11px;font-size:13px}.d-fire8 .g6{grid-template-columns:repeat(5,minmax(0,1fr))}.d-fire8 .mgrid{grid-template-columns:repeat(4,minmax(0,1fr))}.d-fire8 .date{font-size:12px}.d-fire8 .chip.whole{width:240px}' +
      /* iPad: 4:3 screen, so use the extra height and respect the home-indicator safe area */
      '.d-ipad.root{padding:22px 26px calc(22px + env(safe-area-inset-bottom))}.d-ipad .tile{height:104px}.d-ipad .grps .tile{height:84px}.d-ipad .scene{min-height:96px}.d-ipad .camsm{max-height:300px}.d-ipad .chip{height:50px}' +
      /* phones: one scrolling column */
      '@media (max-width:900px){' +
      '.root{height:auto;min-height:100vh;overflow:visible;padding:14px 14px calc(28px + env(safe-area-inset-bottom));gap:14px}' +
      'header{flex-wrap:wrap;gap:8px 12px}h1{font-size:22px}.clock{font-size:30px}.wx{height:34px;font-size:14px}' +
      'nav{order:3;width:100%}.row{flex-direction:column;flex:none}.col{flex:none}.c5,.c6,.c7,.c8{flex:none}.card.grow,.col>.grow{flex:none}' +
      '.scroll{overflow:visible}.hd{flex-wrap:wrap}' +
      '.g3{grid-template-columns:minmax(0,1fr)}.g4{grid-template-columns:repeat(2,minmax(0,1fr))}.g6,.d-fire8 .g6{grid-template-columns:repeat(2,minmax(0,1fr))}' +
      '.sheet .g4{grid-template-columns:repeat(4,minmax(0,1fr))}.swc{aspect-ratio:1;height:auto}' +
      '.g2{grid-template-columns:minmax(0,1fr)}.kvg{grid-template-columns:minmax(0,1fr)}' +
      '.grps{grid-template-columns:minmax(0,1fr)}.rtv .apps{grid-template-columns:repeat(2,minmax(0,1fr))}.chip.whole,.d-fire8 .chip.whole{width:100%}.tile{height:88px}' +
      '.ghost.push{margin-top:4px}' +
      '.tvw{grid-column:auto}.tvw .apps{grid-template-columns:repeat(2,minmax(0,1fr))}.hours{grid-template-columns:repeat(4,minmax(0,1fr))}.wxstats{grid-template-columns:repeat(2,minmax(0,1fr))}.day{grid-template-columns:44px 22px 1fr 34px 64px 34px;gap:6px}.wxbig{font-size:52px}.radarph{min-height:380px}' +
      '.mgrid,.d-fire8 .mgrid{grid-template-columns:repeat(3,minmax(0,1fr))}.mscroll{overflow:visible}.toast{bottom:calc(20px + env(safe-area-inset-bottom));white-space:normal;width:90%;text-align:center}' +
      '.cam{min-height:200px}' +
      '.sheet{position:fixed;left:0;right:0;top:auto;bottom:0;width:auto;max-height:85vh;overflow-y:auto;border-radius:26px 26px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom))}' +
      '}' +
      '</style><div class="root d-' + dev + '" style="' + fit + '"><header><div><p class="date">' + gwpEsc(date) + '</p><h1>' + gwpEsc(title) + '</h1></div>' +
      tabs + '<div class="hr">' + weather + '<p class="clock">' + time + '</p></div></header>' + body + '</div>';
    if (html !== this._html) {
      /* skip redraws that change nothing; keep scroll positions across the ones that do */
      const keep = Array.prototype.map.call(this._app.querySelectorAll('.scroll,.mscroll'), (el) => el.scrollTop);
      const sameView = this._drawn === v;
      this._html = html; this._drawn = v;
      this._app.innerHTML = html;
      if (sameView) this._app.querySelectorAll('.scroll,.mscroll').forEach((el, i) => { if (keep[i]) el.scrollTop = keep[i]; });
    }
    this._placeRadar();
    if (v === 'weather') requestAnimationFrame(() => this._placeRadar());
  }
}
if (!customElements.get('glass-wall-panel')) customElements.define('glass-wall-panel', GlassWallPanel);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === 'glass-wall-panel')) window.customCards.push({ type: 'glass-wall-panel', name: 'Glass Wall Panel', description: 'Full-screen liquid-glass dashboard for wall tablets (Fire HD 10, Fire HD 8, iPad)', preview: false });
console.info('%c GLASS-WALL-PANEL %c v' + GWP_VERSION + ' ', 'background:#7dd3fc;color:#0b1020;font-weight:700', 'background:#0f172a;color:#fff');
