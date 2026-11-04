/* ATLAS — Earth in Motion. Static CesiumJS wallpaper; no build or secret required. */
(() => {
  'use strict';

  const C = window.Cesium;
  const qs = new URLSearchParams(window.location.search);
  const $ = (id) => document.getElementById(id);
  const TERRAIN_ASSET_ID = 1; // Cesium World Terrain; requires a permitted Cesium ion token.
  const ESRI_WORLD_IMAGERY = 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer';
  const STORAGE_KEY = 'atlas-wallpaper-v1';

  // Each target is a visible viewpoint, not a precise footfall or route.
  // range is the near-view *slant distance* (meters) to the target.
  const PLACES = [
    { name: 'TOKYO',       region: 'JAPAN / EAST ASIA',              type: 'CITY',   lon: 139.6503, lat: 35.6762, altitude: 30,   range: 38000,  heading: 35,  pitch: -47, description: '都市の光と、果てしない街並み。' },
    { name: 'MT. FUJI',    region: 'JAPAN / HONSHU',                 type: 'NATURE', lon: 138.7274, lat: 35.3606, altitude: 3776, range: 58000,  heading: 35,  pitch: -38, description: '雲の上にそびえる、孤高の成層火山。' },
    { name: 'NEW YORK',    region: 'UNITED STATES / NORTH AMERICA',type: 'CITY',   lon: -73.9857,lat: 40.7484, altitude: 20,   range: 26000,  heading: 25,  pitch: -48, description: '島の上に伸びる、幾何学的な大都市。' },
    { name: 'EVEREST',     region: 'NEPAL / HIMALAYAS',             type: 'NATURE', lon: 86.9250, lat: 27.9881, altitude: 8849, range: 90000,  heading: 55,  pitch: -35, description: '世界の屋根へ。ヒマラヤの最高峰。' },
    { name: 'PARIS',       region: 'FRANCE / WESTERN EUROPE',       type: 'CITY',   lon: 2.3522,  lat: 48.8566, altitude: 35,   range: 25000,  heading: -30, pitch: -52, description: 'セーヌ河畔に広がる、歴史と都市の模様。' },
    { name: 'MATTERHORN',  region: 'SWITZERLAND / THE ALPS',        type: 'NATURE', lon: 7.6586,  lat: 45.9763, altitude: 4478, range: 46000,  heading: -35, pitch: -35, description: 'アルプスの空を切り取る、鋭い山容。' },
    { name: 'SINGAPORE',   region: 'SINGAPORE / SOUTHEAST ASIA',    type: 'CITY',   lon: 103.8519,lat: 1.2903,  altitude: 30,   range: 28000,  heading: 35,  pitch: -51, description: '海と街が交わる、赤道の都市国家。' },
    { name: 'GRAND CANYON',region:'UNITED STATES / ARIZONA',        type: 'NATURE', lon:-112.1401,lat: 36.0544, altitude: 2200, range: 105000, heading: -65, pitch: -36, description: '長い歳月が刻んだ、大地の断面。' },
    { name: 'HONG KONG',   region: 'CHINA / SOUTH CHINA SEA',       type: 'CITY',   lon: 114.1694,lat: 22.3193, altitude: 50,   range: 27000,  heading: 30,  pitch: -46, description: '山と海のあいだに密集する摩天楼。' },
    { name: 'KILIMANJARO', region: 'TANZANIA / EAST AFRICA',        type: 'NATURE', lon: 37.3556, lat: -3.0674, altitude: 5895, range: 85000,  heading: -40, pitch: -34, description: 'アフリカの大地から立ち上がる独立峰。' },
    { name: 'ISTANBUL',    region: 'TÜRKIYE / BOSPHORUS',           type: 'CITY',   lon: 28.9784, lat: 41.0082, altitude: 40,   range: 45000,  heading: -15, pitch: -50, description: '二つの大陸をつなぐ、青い海峡。' },
    { name: 'MACHU PICCHU',region: 'PERU / THE ANDES',             type: 'NATURE', lon: -72.5450,lat: -13.1631,altitude: 2430, range: 30000,  heading: 60,  pitch: -37, description: 'アンデスの尾根に残る、天空の遺跡。' },
    { name: 'DUBAI',       region: 'UNITED ARAB EMIRATES / GULF',  type: 'CITY',   lon: 55.2708, lat: 25.2048, altitude: 15,   range: 42000,  heading: 20,  pitch: -52, description: '砂漠と海を描き直した、未来都市。' },
    { name: 'AORAKI',      region: 'NEW ZEALAND / SOUTHERN ALPS',  type: 'NATURE', lon: 170.1418,lat: -43.5950,altitude: 3724, range: 50000,  heading: 45,  pitch: -37, description: '氷河に抱かれた、南半球の山岳地帯。' },
    { name: 'ROME',        region: 'ITALY / SOUTHERN EUROPE',       type: 'CITY',   lon: 12.4964, lat: 41.9028, altitude: 35,   range: 26000,  heading: -45, pitch: -50, description: '二千年の時間が折り重なる永遠の都。' },
    { name: 'CAPE TOWN',   region: 'SOUTH AFRICA / ATLANTIC',      type: 'NATURE', lon: 18.4107, lat: -33.9628,altitude: 1085, range: 52000,  heading: -65, pitch: -38, description: 'テーブルマウンテンと大西洋の境界。' }
  ];

  function loadConfig() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch (_) { /* storage can be blocked */ }
    return {
      speed: clamp(Number(saved.speed) || 1, 0.5, 2),
      quality: clamp(Number(saved.quality) || .85, .5, 1),
      fps: [24, 30, 60].includes(Number(saved.fps)) ? Number(saved.fps) : 30,
      labels: typeof saved.labels === 'boolean' ? saved.labels : true,
      shuffle: Boolean(saved.shuffle),
      terrain: Boolean(saved.terrain),
      ionToken: typeof saved.ionToken === 'string' ? saved.ionToken : ''
    };
  }
  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  const config = loadConfig();
  const wallpaper = qs.get('wallpaper') === '1';
  const bare = qs.get('ui') === '0';
  if (qs.has('speed')) config.speed = clamp(Number(qs.get('speed')) || 1, .5, 2);
  if (qs.has('quality')) config.quality = clamp(Number(qs.get('quality')) || .85, .5, 1);
  if (qs.has('fps') && [24,30,60].includes(Number(qs.get('fps')))) config.fps = Number(qs.get('fps'));
  if (qs.get('labels') === '0') config.labels = false;
  if (qs.get('shuffle') === '1') config.shuffle = true;
  document.body.classList.toggle('wallpaper-mode', wallpaper);
  document.body.classList.toggle('hide-hud', bare || !config.labels);

  let viewer;
  const runtime = {
    stage: 'globe', stageElapsed: 0, stageDuration: 5.5,
    flight: null, flightSerial: 0, paused: false, hiddenPause: false,
    index: 0, globeLongitude: 120, nearHeading: 0,
    lastFrame: 0, toastTimer: null, shuttingDown: false,
    sequence: PLACES.map((_, i) => i),
    manualHud: bare || !config.labels
  };

  function saveConfig() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch (_) {} }
  function placeAt(i) { return PLACES[runtime.sequence[(i + runtime.sequence.length) % runtime.sequence.length]]; }
  function inRadians(deg) { return C.Math.toRadians(deg); }
  function cartesian(target) { return C.Cartesian3.fromDegrees(target.lon, target.lat, target.altitude); }
  function targetHpr(target, heading) {
    return new C.HeadingPitchRange(inRadians(heading), inRadians(target.pitch), target.range);
  }
  function phaseDuration(name) {
    const base = { globe: 6, approach: 13, near: 15, depart: 9 }[name] || 10;
    return base / config.speed;
  }
  function formatCoord(value, positive, negative) {
    return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;
  }
  function showToast(message) {
    const toast = $('toast');
    toast.textContent = message;
    toast.classList.add('active');
    clearTimeout(runtime.toastTimer);
    runtime.toastTimer = setTimeout(() => toast.classList.remove('active'), 4400);
  }
  function updateDestination() {
    const target = placeAt(runtime.index);
    $('chapter-number').textContent = `${String(runtime.index + 1).padStart(2, '0')} / ${String(PLACES.length).padStart(2, '0')}`;
    $('category-label').textContent = target.type === 'CITY' ? 'CITY EXPLORATION' : 'NATURAL WONDERS';
    $('destination-region').textContent = target.region;
    $('destination-title').textContent = target.name;
    $('destination-title').classList.toggle('long',target.name.length >= 11);
    $('destination-description').textContent = target.description;
    $('coordinates').textContent = `${formatCoord(target.lat, 'N', 'S')}   ${formatCoord(target.lon, 'E', 'W')}`;
    $('next-text').textContent = `NEXT DESTINATION · ${placeAt(runtime.index + 1).name}`;
  }
  function updateUI() {
    const label = {globe: 'ORBITING THE EARTH', approach: 'APPROACHING DESTINATION', near: 'EXPLORING THE LANDSCAPE', depart: 'RETURNING TO ORBIT'}[runtime.stage];
    $('phase-text').textContent = runtime.paused ? 'FLIGHT PAUSED' : label;
    $('timeline-progress').style.width = `${clamp(runtime.stageElapsed / Math.max(.1,runtime.stageDuration),0,1) * 100}%`;
    $('pause-icon').hidden = runtime.paused;
    $('play-icon').hidden = !runtime.paused;
    $('play-pause').setAttribute('aria-label', runtime.paused ? '再開' : '一時停止');
  }
  function setStage(stage, duration) {
    runtime.stage = stage;
    runtime.stageElapsed = 0;
    runtime.stageDuration = duration ?? phaseDuration(stage);
    updateUI();
  }
  function cancelFlight() {
    runtime.flightSerial++;
    if (viewer) viewer.camera.cancelFlight();
    runtime.flight = null;
  }
  function stopAndResetCamera() {
    cancelFlight();
    // lookAt changes the reference transform; revert before free camera flights.
    viewer.camera.lookAtTransform(C.Matrix4.IDENTITY);
  }
  function flyToTarget(seconds) {
    const target = placeAt(runtime.index);
    const serial = ++runtime.flightSerial;
    const duration = Math.max(.5, seconds);
    runtime.flight = { type: 'approach', remaining: duration };
    viewer.camera.lookAtTransform(C.Matrix4.IDENTITY);
    viewer.camera.flyToBoundingSphere(new C.BoundingSphere(cartesian(target), 0), {
      offset: targetHpr(target, target.heading),
      duration,
      easingFunction: C.EasingFunction.SINUSOIDAL_IN_OUT,
      complete: () => {
        if (serial !== runtime.flightSerial || runtime.paused) return;
        runtime.flight = null;
        runtime.nearHeading = target.heading;
        setStage('near');
      },
      cancel: () => {}
    });
  }
  function beginApproach(seconds = phaseDuration('approach')) {
    setStage('approach', seconds);
    flyToTarget(seconds);
  }
  function beginDepart(seconds = phaseDuration('depart')) {
    const target = placeAt(runtime.index);
    setStage('depart', seconds);
    viewer.camera.lookAtTransform(C.Matrix4.IDENTITY);
    const serial = ++runtime.flightSerial;
    runtime.flight = {type: 'depart', remaining: seconds};
    viewer.camera.flyTo({
      destination: C.Cartesian3.fromDegrees(target.lon, target.lat, 18400000),
      orientation: { heading: 0, pitch: -C.Math.PI_OVER_TWO, roll: 0 },
      duration: Math.max(.5, seconds),
      easingFunction: C.EasingFunction.SINUSOIDAL_IN_OUT,
      complete: () => {
        if (serial !== runtime.flightSerial || runtime.paused) return;
        runtime.flight = null;
        runtime.globeLongitude = target.lon;
        runtime.index = (runtime.index + 1) % PLACES.length;
        updateDestination();
        setStage('globe');
      },
      cancel: () => {}
    });
  }
  function shuffleOrder() {
    const keep = runtime.sequence[runtime.index];
    const rest = PLACES.map((_,i)=>i).filter(i=>i!==keep);
    for (let i=rest.length - 1; i>0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [rest[i],rest[j]] = [rest[j],rest[i]];
    }
    runtime.sequence = config.shuffle ? [keep, ...rest] : PLACES.map((_,i)=>i);
    runtime.index = runtime.sequence.indexOf(keep);
    if (runtime.index === -1) runtime.index = 0;
    updateDestination();
  }
  function jumpTo(newIndex) {
    if (!viewer) return;
    stopAndResetCamera();
    runtime.index = (newIndex + PLACES.length) % PLACES.length;
    updateDestination();
    beginApproach(Math.max(3, 8 / config.speed));
    if (runtime.paused) { runtime.paused = false; updateUI(); }
  }
  function pause() {
    if (runtime.paused || !viewer) return;
    if (runtime.flight) {
      const remaining = Math.max(1, runtime.stageDuration - runtime.stageElapsed);
      const type = runtime.flight.type;
      cancelFlight();
      runtime.flight = {type, remaining};
    }
    runtime.paused = true;
    viewer.clock.shouldAnimate = false;
    updateUI();
  }
  function resume() {
    if (!runtime.paused || !viewer) return;
    runtime.paused = false;
    viewer.clock.shouldAnimate = true;
    if (runtime.flight) {
      const {type, remaining} = runtime.flight;
      runtime.flight = null;
      runtime.stageElapsed = 0;
      runtime.stageDuration = remaining;
      if (type === 'approach') flyToTarget(remaining);
      if (type === 'depart') beginDepart(remaining);
    }
    runtime.lastFrame = 0;
    updateUI();
  }
  function togglePause() { runtime.paused ? resume() : pause(); }
  function animateFrame(timestamp) {
    if (runtime.shuttingDown) return;
    requestAnimationFrame(animateFrame);
    if (!viewer) return;
    if (!runtime.lastFrame) runtime.lastFrame = timestamp;
    const dt = clamp((timestamp - runtime.lastFrame)/1000,0,.08);
    runtime.lastFrame = timestamp;
    if (runtime.paused || document.hidden) return;
    runtime.stageElapsed += dt;
    if (runtime.stage === 'globe') {
      runtime.globeLongitude += dt * 1.1 * config.speed;
      if (runtime.globeLongitude > 180) runtime.globeLongitude -= 360;
      viewer.camera.setView({
        destination: C.Cartesian3.fromDegrees(runtime.globeLongitude, 23, 18400000),
        orientation: { heading: 0, pitch: -C.Math.PI_OVER_TWO, roll: 0 }
      });
      if (runtime.stageElapsed >= runtime.stageDuration) beginApproach();
    } else if (runtime.stage === 'near') {
      const target = placeAt(runtime.index);
      runtime.nearHeading += dt * (4.5 * config.speed); // degrees per second
      viewer.camera.lookAt(cartesian(target), targetHpr(target, runtime.nearHeading));
      if (runtime.stageElapsed >= runtime.stageDuration) beginDepart();
    }
    // The native Cesium flights run in the scene animation system.
    updateUI();
  }

  async function setupImagery() {
    try {
      const imagery = await C.ArcGisMapServerImageryProvider.fromUrl(ESRI_WORLD_IMAGERY, { enablePickFeatures: false });
      viewer.imageryLayers.addImageryProvider(imagery);
    } catch (error) {
      console.warn('Esri satellite imagery unavailable; using map fallback.', error);
      try {
        viewer.imageryLayers.addImageryProvider(new C.OpenStreetMapImageryProvider({url:'https://tile.openstreetmap.org/'}));
        showToast('衛星画像の接続に失敗したため、標準地図で表示しています。');
      } catch (fallbackError) {
        console.error('Imagery unavailable', fallbackError);
        showToast('地図を読み込めません。ネットワーク接続を確認してください。');
      }
    }
  }
  async function setTerrain() {
    const msg = $('terrain-message');
    if (!config.terrain) {
      viewer.terrainProvider = new C.EllipsoidTerrainProvider();
      msg.textContent = '地形を無効にしました。衛星画像は引き続き表示します。';
      return;
    }
    if (!config.ionToken.trim()) {
      config.terrain = false;
      $('terrain').checked = false;
      msg.textContent = '3D地形には Cesium ion トークンが必要です。';
      return;
    }
    msg.textContent = 'Cesium World Terrain に接続しています…';
    try {
      C.Ion.defaultAccessToken = config.ionToken.trim();
      const terrain = await C.CesiumTerrainProvider.fromIonAssetId(TERRAIN_ASSET_ID, {requestVertexNormals:true});
      viewer.terrainProvider = terrain;
      msg.textContent = '3D地形を有効にしました。山岳地帯で立体感が増します。';
      showToast('Cesium World Terrain を有効にしました。');
    } catch (error) {
      console.error('Cesium terrain unavailable', error);
      viewer.terrainProvider = new C.EllipsoidTerrainProvider();
      msg.textContent = 'トークンまたは通信の問題で地形を読み込めませんでした。許可されたアセットを確認してください。';
      showToast('3D地形を読み込めませんでした。平面地球で続行します。');
    }
  }
  function openSettings(open) {
    $('settings').classList.toggle('open',open);
    $('settings').setAttribute('aria-hidden',String(!open));
    $('settings-toggle').setAttribute('aria-expanded',String(open));
  }
  function applyVisualConfig() {
    if (!viewer) return;
    viewer.resolutionScale = config.quality;
    viewer.targetFrameRate = config.fps;
    document.body.classList.toggle('hide-hud', runtime.manualHud || !config.labels);
    updateUI();
  }
  function bindInputs() {
    $('speed').value = String(config.speed);
    $('quality').value = String(config.quality);
    $('fps').value = String(config.fps);
    $('show-labels').checked = config.labels;
    $('shuffle').checked = config.shuffle;
    $('ion-token').value = config.ionToken;
    $('terrain').checked = config.terrain;
    $('speed-value').textContent = `${config.speed.toFixed(2).replace(/0$/,'')}×`;
    $('quality-value').textContent = `${Math.round(config.quality*100)}%`;
    $('speed').addEventListener('input', e => {
      config.speed = Number(e.target.value);
      $('speed-value').textContent = `${config.speed.toFixed(2).replace(/0$/,'')}×`;
      saveConfig();
    });
    $('quality').addEventListener('input', e => {
      config.quality = Number(e.target.value);
      $('quality-value').textContent = `${Math.round(config.quality*100)}%`;
      applyVisualConfig();saveConfig();
    });
    $('fps').addEventListener('change',e => { config.fps = Number(e.target.value);applyVisualConfig();saveConfig(); });
    $('show-labels').addEventListener('change',e => {config.labels = e.target.checked;runtime.manualHud = !config.labels;applyVisualConfig();saveConfig();});
    $('shuffle').addEventListener('change',e=>{config.shuffle = e.target.checked;shuffleOrder();saveConfig();});
    $('apply-terrain').addEventListener('click',async()=>{
      config.terrain = $('terrain').checked;
      config.ionToken = $('ion-token').value.trim();
      saveConfig();
      await setTerrain();
      saveConfig();
    });
    $('play-pause').addEventListener('click',togglePause);
    $('prev').addEventListener('click',()=>jumpTo(runtime.index-1));
    $('next').addEventListener('click',()=>jumpTo(runtime.index+1));
    $('settings-toggle').addEventListener('click',()=>openSettings(!$('settings').classList.contains('open')));
    $('settings-close').addEventListener('click',()=>openSettings(false));
    $('hud-toggle').addEventListener('click',()=>{
      runtime.manualHud = !runtime.manualHud;
      applyVisualConfig();
    });
    $('fullscreen').addEventListener('click',()=>{
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen?.().catch(()=>showToast('全画面表示が利用できません。'));
    });
    window.addEventListener('keydown',e=>{
      const el = e.target;
      if (el && /INPUT|SELECT|TEXTAREA/.test(el.tagName)) return;
      if (['Space','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
      if (e.code === 'Space') togglePause();
      if (e.code === 'ArrowLeft') jumpTo(runtime.index-1);
      if (e.code === 'ArrowRight') jumpTo(runtime.index+1);
      if (e.code === 'KeyH') {runtime.manualHud = !runtime.manualHud;applyVisualConfig();}
      if (e.code === 'KeyS') openSettings(!$('settings').classList.contains('open'));
      if (e.code === 'KeyF') $('fullscreen').click();
      if (e.code === 'Escape') openSettings(false);
    });
    document.addEventListener('visibilitychange',()=>{
      if (document.hidden) {if (!runtime.paused) {runtime.hiddenPause=true;pause();}}
      else if(runtime.hiddenPause){runtime.hiddenPause=false;resume();}
    });
    let controlsTimeout;
    window.addEventListener('pointermove',()=>{
      if(wallpaper)return;
      document.body.classList.add('controls-active');
      clearTimeout(controlsTimeout);
      controlsTimeout=setTimeout(()=>document.body.classList.remove('controls-active'),2500);
    }, {passive:true});
  }
  function renderUtcClock() {
    const now = new Date();
    $('local-time').textContent = `${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')} UTC`;
  }
  async function init() {
    if(!C) {
      $('loading-copy').textContent = 'CesiumJS を読み込めません。ネットワーク接続を確認してください。';
      return;
    }
    try {
      // Do not silently use an embedded Cesium ion default access token.
      if (config.ionToken) C.Ion.defaultAccessToken = config.ionToken;
      viewer = new C.Viewer('globe', {
        baseLayer: false,
        baseLayerPicker: false,
        terrainProvider: new C.EllipsoidTerrainProvider(),
        animation: false, timeline: false, geocoder: false, homeButton: false,
        infoBox: false, sceneModePicker: false, selectionIndicator: false,
        navigationHelpButton: false, fullscreenButton: false,
        shouldAnimate: true,
        useDefaultRenderLoop: true,
        msaaSamples: 1,
        requestRenderMode: false,
        maximumRenderTimeChange: Infinity
      });
      viewer.resolutionScale = config.quality;
      viewer.targetFrameRate = config.fps;
      viewer.scene.globe.enableLighting = false; // Always see cities, even on the dark side.
      viewer.scene.globe.depthTestAgainstTerrain = false;
      viewer.scene.globe.showGroundAtmosphere = true;
      viewer.scene.fog.enabled = true;
      viewer.scene.backgroundColor = C.Color.fromCssColorString('#02060d');
      viewer.scene.screenSpaceCameraController.enableInputs = !wallpaper;
      viewer.camera.setView({
        destination: C.Cartesian3.fromDegrees(runtime.globeLongitude,23,18400000),
        orientation:{heading:0,pitch:-C.Math.PI_OVER_TWO,roll:0}
      });
      if (config.shuffle) shuffleOrder();
      else updateDestination();
      applyVisualConfig();
      bindInputs();
      renderUtcClock();
      setInterval(renderUtcClock,30000);
      await setupImagery();
      if (config.terrain && config.ionToken) {
        // Avoid blocking the wallpaper while the optional terrain loads.
        setTerrain();
      }
      $('loading').classList.add('done');
      $('app').classList.remove('is-loading');
      setStage('globe',5.5/config.speed);
      requestAnimationFrame(animateFrame);
    } catch (error) {
      console.error('ATLAS initialization failed:',error);
      $('loading-copy').textContent = '3D表示に失敗しました。WebGL と GPU 設定を確認してください。';
    }
  }
  window.addEventListener('beforeunload',()=>{runtime.shuttingDown=true;viewer?.destroy();});
  init();
})();