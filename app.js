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
    {"name": "TOKYO", "region": "JAPAN / EAST ASIA", "type": "CITY", "lon": 139.7454, "lat": 35.6586, "altitude": 30.0, "range": 2400, "heading": 35, "pitch": -62, "landmark": "東京タワー", "description": "芝公園と都心に囲まれた、赤い塔。"},
    {"name": "MT. FUJI", "region": "JAPAN / HONSHU", "type": "NATURE", "lon": 138.7274, "lat": 35.3606, "altitude": 3776.0, "range": 18000, "heading": 35, "pitch": -45, "landmark": "富士山の火口", "description": "山頂の火口から裾野へ広がる稜線。"},
    {"name": "NEW YORK", "region": "UNITED STATES / NORTH AMERICA", "type": "CITY", "lon": -73.9857, "lat": 40.7484, "altitude": 20.0, "range": 3200, "heading": 25, "pitch": -62, "landmark": "エンパイア・ステート・ビル", "description": "マンハッタンの格子状の街並み。"},
    {"name": "EVEREST", "region": "NEPAL / HIMALAYAS", "type": "NATURE", "lon": 86.925, "lat": 27.9881, "altitude": 8849.0, "range": 25000, "heading": 55, "pitch": -45, "landmark": "エベレスト山頂", "description": "氷河と鋭い稜線が連なるヒマラヤ。"},
    {"name": "PARIS", "region": "FRANCE / WESTERN EUROPE", "type": "CITY", "lon": 2.2945, "lat": 48.8583, "altitude": 35.0, "range": 2200, "heading": -30, "pitch": -62, "landmark": "エッフェル塔", "description": "セーヌ川とシャン・ド・マルス公園。"},
    {"name": "MATTERHORN", "region": "SWITZERLAND / THE ALPS", "type": "NATURE", "lon": 7.6586, "lat": 45.9763, "altitude": 4478.0, "range": 12000, "heading": -35, "pitch": -45, "landmark": "マッターホルン", "description": "アルプスを象徴する、ピラミッド形の峰。"},
    {"name": "SINGAPORE", "region": "SINGAPORE / SOUTHEAST ASIA", "type": "CITY", "lon": 103.8607, "lat": 1.2834, "altitude": 15.0, "range": 3000, "heading": 35, "pitch": -60, "landmark": "マリーナ・ベイ・サンズ", "description": "湾と庭園に囲まれた、三つのタワー。"},
    {"name": "GRAND CANYON", "region": "UNITED STATES / ARIZONA", "type": "NATURE", "lon": -112.1401, "lat": 36.0544, "altitude": 2200.0, "range": 26000, "heading": -65, "pitch": -50, "landmark": "グランドキャニオン", "description": "コロラド川が刻んだ大峡谷。"},
    {"name": "HONG KONG", "region": "CHINA / SOUTH CHINA SEA", "type": "CITY", "lon": 114.1652, "lat": 22.293, "altitude": 10.0, "range": 6500, "heading": 30, "pitch": -58, "landmark": "ビクトリア・ハーバー", "description": "香港島と九龍を隔てる港。"},
    {"name": "KILIMANJARO", "region": "TANZANIA / EAST AFRICA", "type": "NATURE", "lon": 37.3556, "lat": -3.0674, "altitude": 5895.0, "range": 22000, "heading": -40, "pitch": -45, "landmark": "キボ峰の火口", "description": "アフリカの大地から立ち上がる独立峰。"},
    {"name": "ISTANBUL", "region": "TÜRKIYE / BOSPHORUS", "type": "CITY", "lon": 28.9802, "lat": 41.0086, "altitude": 40.0, "range": 2200, "heading": -15, "pitch": -65, "landmark": "アヤソフィア", "description": "旧市街のドームと海峡を望む。"},
    {"name": "MACHU PICCHU", "region": "PERU / THE ANDES", "type": "NATURE", "lon": -72.545, "lat": -13.1631, "altitude": 2430.0, "range": 5500, "heading": 60, "pitch": -60, "landmark": "マチュピチュ遺跡", "description": "アンデスの尾根に並ぶ石造遺跡。"},
    {"name": "DUBAI", "region": "UNITED ARAB EMIRATES / GULF", "type": "CITY", "lon": 55.2744, "lat": 25.1972, "altitude": 15.0, "range": 3200, "heading": 20, "pitch": -65, "landmark": "ブルジュ・ハリファ", "description": "超高層塔を囲む人工湖と街区。"},
    {"name": "AORAKI", "region": "NEW ZEALAND / SOUTHERN ALPS", "type": "NATURE", "lon": 170.1418, "lat": -43.595, "altitude": 3724.0, "range": 14000, "heading": 45, "pitch": -45, "landmark": "アオラキ／マウント・クック", "description": "氷河に抱かれた南半球の高峰。"},
    {"name": "ROME", "region": "ITALY / SOUTHERN EUROPE", "type": "CITY", "lon": 12.4922, "lat": 41.8902, "altitude": 35.0, "range": 1800, "heading": -45, "pitch": -65, "landmark": "コロッセオ", "description": "楕円形の円形闘技場と古代ローマの遺跡。"},
    {"name": "CAPE TOWN", "region": "SOUTH AFRICA / ATLANTIC", "type": "NATURE", "lon": 18.4107, "lat": -33.9628, "altitude": 1085.0, "range": 11000, "heading": -65, "pitch": -50, "landmark": "テーブルマウンテン", "description": "平らな山頂と大西洋の海岸線。"},
    {"name": "SYDNEY", "region": "AUSTRALIA / NEW SOUTH WALES", "type": "CITY", "lon": 151.2153, "lat": -33.8568, "altitude": 10.0, "range": 2600, "heading": 30, "pitch": -65, "landmark": "シドニー・オペラハウス", "description": "白い屋根と港、ハーバーブリッジ。"},
    {"name": "ULURU", "region": "AUSTRALIA / NORTHERN TERRITORY", "type": "NATURE", "lon": 131.0369, "lat": -25.3444, "altitude": 860.0, "range": 9000, "heading": -30, "pitch": -55, "landmark": "ウルル", "description": "赤い大地に浮かぶ巨大な一枚岩。"},
    {"name": "SAN FRANCISCO", "region": "UNITED STATES / CALIFORNIA", "type": "CITY", "lon": -122.4783, "lat": 37.8199, "altitude": 10.0, "range": 7000, "heading": 45, "pitch": -60, "landmark": "ゴールデンゲートブリッジ", "description": "海峡に架かる橋と湾の入口。"},
    {"name": "YOSEMITE", "region": "UNITED STATES / CALIFORNIA", "type": "NATURE", "lon": -119.5332, "lat": 37.7459, "altitude": 2695.0, "range": 12000, "heading": 40, "pitch": -50, "landmark": "ハーフドーム", "description": "氷河が削った谷と花崗岩の岩壁。"},
    {"name": "AGRA", "region": "INDIA / UTTAR PRADESH", "type": "CITY", "lon": 78.0421, "lat": 27.1751, "altitude": 170.0, "range": 1800, "heading": 0, "pitch": -70, "landmark": "タージ・マハル", "description": "白い霊廟と左右対称の庭園。"},
    {"name": "VICTORIA FALLS", "region": "ZAMBIA & ZIMBABWE / AFRICA", "type": "NATURE", "lon": 25.8572, "lat": -17.9243, "altitude": 900.0, "range": 6500, "heading": 25, "pitch": -65, "landmark": "ビクトリアの滝", "description": "大河が細い峡谷へ落ち込む境界。"},
    {"name": "GIZA", "region": "EGYPT / GREATER CAIRO", "type": "CITY", "lon": 31.1342, "lat": 29.9792, "altitude": 60.0, "range": 2500, "heading": 35, "pitch": -65, "landmark": "ギザの大ピラミッド", "description": "砂漠と市街地の境に並ぶピラミッド。"},
    {"name": "BORA BORA", "region": "FRENCH POLYNESIA / PACIFIC", "type": "NATURE", "lon": -151.7415, "lat": -16.5004, "altitude": 727.0, "range": 18000, "heading": -30, "pitch": -65, "landmark": "ボラボラ島とラグーン", "description": "サンゴ礁が描く青い環。"},
    {"name": "BARCELONA", "region": "SPAIN / CATALONIA", "type": "CITY", "lon": 2.1744, "lat": 41.4036, "altitude": 30.0, "range": 2000, "heading": 35, "pitch": -65, "landmark": "サグラダ・ファミリア", "description": "聖堂を囲む八角形の街区。"},
    {"name": "BLUE HOLE", "region": "BELIZE / CARIBBEAN", "type": "NATURE", "lon": -87.5347, "lat": 17.316, "altitude": 0.0, "range": 2200, "heading": 20, "pitch": -80, "landmark": "グレート・ブルーホール", "description": "サンゴ礁に開いた、深い青の円。"},
    {"name": "VENICE", "region": "ITALY / ADRIATIC", "type": "CITY", "lon": 12.3378, "lat": 45.4343, "altitude": 5.0, "range": 2000, "heading": -25, "pitch": -65, "landmark": "サン・マルコ広場", "description": "大運河とラグーンに囲まれた広場。"},
    {"name": "SANTORINI", "region": "GREECE / AEGEAN", "type": "NATURE", "lon": 25.3753, "lat": 36.4618, "altitude": 150.0, "range": 7000, "heading": 30, "pitch": -65, "landmark": "イアとカルデラ", "description": "断崖に沿う白い集落と火山の海。"},
    {"name": "LONDON", "region": "UNITED KINGDOM / ENGLAND", "type": "CITY", "lon": -0.0754, "lat": 51.5055, "altitude": 10.0, "range": 2200, "heading": 35, "pitch": -65, "landmark": "タワーブリッジ", "description": "テムズ川とロンドン塔を結ぶ風景。"},
    {"name": "NIAGARA", "region": "CANADA & UNITED STATES", "type": "NATURE", "lon": -79.0747, "lat": 43.0799, "altitude": 170.0, "range": 3500, "heading": -30, "pitch": -65, "landmark": "ホースシュー滝", "description": "馬蹄形に曲がる滝と川の流れ。"},
    {"name": "KYOTO", "region": "JAPAN / KANSAI", "type": "CITY", "lon": 135.785, "lat": 34.9949, "altitude": 100.0, "range": 1600, "heading": -35, "pitch": -65, "landmark": "清水寺", "description": "東山の緑と寺院、京都の街並み。"},
    {"name": "TWELVE APOSTLES", "region": "AUSTRALIA / VICTORIA", "type": "NATURE", "lon": 143.1051, "lat": -38.6657, "altitude": 50.0, "range": 5500, "heading": 30, "pitch": -65, "landmark": "十二使徒の海食柱", "description": "南極海の波が削った海岸の岩柱。"},
    {"name": "ANGKOR", "region": "CAMBODIA / SIEM REAP", "type": "CITY", "lon": 103.867, "lat": 13.4125, "altitude": 65.0, "range": 3000, "heading": 0, "pitch": -70, "landmark": "アンコール・ワット", "description": "大きな濠に囲まれた寺院の幾何学。"},
    {"name": "MILFORD SOUND", "region": "NEW ZEALAND / FIORDLAND", "type": "NATURE", "lon": 167.9234, "lat": -44.6158, "altitude": 1692.0, "range": 13000, "heading": 35, "pitch": -55, "landmark": "ミトレピークとフィヨルド", "description": "切り立つ山と深く入り込んだ海。"},
    {"name": "MONT SAINT MICHEL", "region": "FRANCE / NORMANDY", "type": "CITY", "lon": -1.5115, "lat": 48.6361, "altitude": 80.0, "range": 2200, "heading": -25, "pitch": -65, "landmark": "モン・サン・ミシェル", "description": "干潟に浮かぶ修道院の島。"},
    {"name": "HORSESHOE BEND", "region": "UNITED STATES / ARIZONA", "type": "NATURE", "lon": -111.5104, "lat": 36.8791, "altitude": 1300.0, "range": 4500, "heading": 30, "pitch": -70, "landmark": "ホースシューベンド", "description": "砂岩の台地を馬蹄形に巡る川。"},
    {"name": "BEIJING", "region": "CHINA / NORTH CHINA", "type": "CITY", "lon": 116.3972, "lat": 39.9163, "altitude": 50.0, "range": 3000, "heading": 0, "pitch": -70, "landmark": "紫禁城", "description": "中軸線に沿って並ぶ宮殿と中庭。"},
    {"name": "MOUNT ETNA", "region": "ITALY / SICILY", "type": "NATURE", "lon": 14.9994, "lat": 37.751, "altitude": 3350.0, "range": 15000, "heading": -25, "pitch": -55, "landmark": "エトナ山の山頂火口", "description": "溶岩の色と火口群が描く火山の表情。"},
    {"name": "WASHINGTON", "region": "UNITED STATES / DISTRICT OF COLUMBIA", "type": "CITY", "lon": -77.0353, "lat": 38.8895, "altitude": 10.0, "range": 3500, "heading": 0, "pitch": -70, "landmark": "ワシントン記念塔", "description": "ナショナル・モールの芝生と反射池。"},
    {"name": "NAMIB", "region": "NAMIBIA / NAMIB DESERT", "type": "NATURE", "lon": 15.2919, "lat": -24.7606, "altitude": 600.0, "range": 6500, "heading": 35, "pitch": -70, "landmark": "デッドフレイ", "description": "赤い砂丘に囲まれた白い窪地。"}
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
  let terrainActive = false;
  const runtime = {
    stage: 'globe', stageElapsed: 0, stageDuration: 5.5,
    transition: null, pose: null, pendingIndex: null, manualSkip: false, paused: false, hiddenPause: false,
    index: 0, globeLongitude: 120, globeLatitude: 23, nearHeading: 0,
    lastFrame: 0, toastTimer: null, shuttingDown: false,
    sequence: PLACES.map((_, i) => i),
    manualHud: bare || !config.labels
  };

  function saveConfig() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch (_) {} }
  function placeAt(i) { return PLACES[runtime.sequence[(i + runtime.sequence.length) % runtime.sequence.length]]; }
  function inRadians(deg) { return C.Math.toRadians(deg); }
  function cartesian(target) { return C.Cartesian3.fromDegrees(target.lon, target.lat, terrainActive ? target.altitude : 0); }
  function targetHpr(target, heading) {
    return new C.HeadingPitchRange(inRadians(heading), inRadians(target.pitch), target.range);
  }
  function phaseDuration(name) {
    const base = { globe: 6, align: 9, approach: 16, near: 15, depart: 9 }[name] || 10;
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
    $('destination-description').textContent = `${target.landmark} — ${target.description}`;
    $('coordinates').textContent = `${formatCoord(target.lat, 'N', 'S')}   ${formatCoord(target.lon, 'E', 'W')}`;
    $('next-text').textContent = `NEXT DESTINATION · ${placeAt(runtime.index + 1).name}`;
  }
  function updateUI() {
    const label = {globe: 'ORBITING THE EARTH', align: 'MOVING ABOVE DESTINATION', approach: 'APPROACHING DESTINATION', near: 'EXPLORING THE LANDSCAPE', depart: 'RETURNING TO ORBIT'}[runtime.stage];
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
  // A single world-coordinate camera timeline avoids jumps between chapters.
  const ORBIT_ALTITUDE = 18400000;
  function axesAt(lon, lat) {
    const p = inRadians(lat), l = inRadians(lon);
    const cp = Math.cos(p), sp = Math.sin(p), cl = Math.cos(l), sl = Math.sin(l);
    return {
      east: new C.Cartesian3(-sl,cl,0),
      north: new C.Cartesian3(-sp*cl,-sp*sl,cp),
      up: new C.Cartesian3(cp*cl,cp*sl,sp)
    };
  }
  function unit(v) { return C.Cartesian3.normalize(v,new C.Cartesian3()); }
  function orientPose(position, focus, directionHint, upHint) {
    const direction=unit(directionHint);
    let up=C.Cartesian3.subtract(upHint,C.Cartesian3.multiplyByScalar(direction,C.Cartesian3.dot(upHint,direction),new C.Cartesian3()),new C.Cartesian3());
    if(C.Cartesian3.magnitudeSquared(up)<1e-8) {
      const other=Math.abs(direction.z)<.95?C.Cartesian3.UNIT_Z:C.Cartesian3.UNIT_X;
      up=C.Cartesian3.subtract(other,C.Cartesian3.multiplyByScalar(direction,C.Cartesian3.dot(other,direction),new C.Cartesian3()),new C.Cartesian3());
    }
    const right=unit(C.Cartesian3.cross(direction,up,new C.Cartesian3()));
    up=unit(C.Cartesian3.cross(right,direction,new C.Cartesian3()));
    return {position,focus,direction,up};
  }
  function makePose(position,focus,upHint) {
    return orientPose(position,focus,C.Cartesian3.subtract(focus,position,new C.Cartesian3()),upHint);
  }
  function globePose(lon,lat) {
    return makePose(C.Cartesian3.fromDegrees(lon,lat,ORBIT_ALTITUDE),C.Cartesian3.ZERO,axesAt(lon,lat).north);
  }
  function overheadPose(target) {
    const a=axesAt(target.lon,target.lat), h=inRadians(target.heading);
    const up=C.Cartesian3.add(
      C.Cartesian3.multiplyByScalar(a.north,Math.cos(h),new C.Cartesian3()),
      C.Cartesian3.multiplyByScalar(a.east,Math.sin(h),new C.Cartesian3()),new C.Cartesian3());
    return makePose(C.Cartesian3.fromDegrees(target.lon,target.lat,ORBIT_ALTITUDE),cartesian(target),up);
  }
  function nearPose(target,heading) {
    const a=axesAt(target.lon,target.lat),h=inRadians(heading),p=inRadians(target.pitch);
    const horizontal=Math.cos(p)*target.range;
    const offset=C.Cartesian3.add(
      C.Cartesian3.add(
        C.Cartesian3.multiplyByScalar(a.east,-Math.sin(h)*horizontal,new C.Cartesian3()),
        C.Cartesian3.multiplyByScalar(a.north,-Math.cos(h)*horizontal,new C.Cartesian3()),
        new C.Cartesian3()),
      C.Cartesian3.multiplyByScalar(a.up,-Math.sin(p)*target.range,new C.Cartesian3()),new C.Cartesian3());
    const focus=cartesian(target);
    return makePose(C.Cartesian3.add(focus,offset,new C.Cartesian3()),focus,a.up);
  }
  function setPose(pose) {
    runtime.pose=pose;
    viewer.camera.setView({destination:pose.position,orientation:{direction:pose.direction,up:pose.up}});
  }
  function smootherStep(x) {
    const t=clamp(x,0,1);
    return t*t*t*(t*(t*6-15)+10);
  }
  function greatCircle(a,b,t) {
    const d=clamp(C.Cartesian3.dot(a,b),-1,1);
    if(d>.9999)return unit(C.Cartesian3.lerp(a,b,t,new C.Cartesian3()));
    if(d<-1+1e-12){
      let axis=C.Cartesian3.cross(a,C.Cartesian3.UNIT_Z,new C.Cartesian3());
      if(C.Cartesian3.magnitudeSquared(axis)<1e-8)axis=C.Cartesian3.cross(a,C.Cartesian3.UNIT_X,new C.Cartesian3());
      const tangent=unit(axis);
      return unit(C.Cartesian3.add(
        C.Cartesian3.multiplyByScalar(a,Math.cos(Math.PI*t),new C.Cartesian3()),
        C.Cartesian3.multiplyByScalar(tangent,Math.sin(Math.PI*t),new C.Cartesian3()),
        new C.Cartesian3()));
    }
    const omega=Math.acos(d),denom=Math.sin(omega);
    return unit(C.Cartesian3.add(
      C.Cartesian3.multiplyByScalar(a,Math.sin((1-t)*omega)/denom,new C.Cartesian3()),
      C.Cartesian3.multiplyByScalar(b,Math.sin(t*omega)/denom,new C.Cartesian3()),
      new C.Cartesian3()));
  }
  function transitionPose(flight,progress) {
    if(progress<=0)return flight.from;
    if(progress>=1)return flight.to;
    const t=smootherStep(progress);
    if(flight.kind==='approach') {
      // Arrive overhead first, then keep the destination centered throughout the descent.
      // Introduce the small sightseeing offset only near the end, not across continents.
      const focus=flight.to.focus;
      const start=C.Cartesian3.subtract(flight.from.position,focus,new C.Cartesian3());
      const end=C.Cartesian3.subtract(flight.to.position,focus,new C.Cartesian3());
      const r0=C.Cartesian3.magnitude(start),r1=C.Cartesian3.magnitude(end);
      const range=Math.exp((1-t)*Math.log(r0)+t*Math.log(r1));
      const tilt=smootherStep((progress-.65)/.35);
      const offset=C.Cartesian3.multiplyByScalar(greatCircle(unit(start),unit(end),tilt),range,new C.Cartesian3());
      return makePose(C.Cartesian3.add(focus,offset,new C.Cartesian3()),focus,flight.from.up);
    }
    const c0=C.Cartographic.fromCartesian(flight.from.position);
    const c1=C.Cartographic.fromCartesian(flight.to.position);
    const a=axesAt(C.Math.toDegrees(c0.longitude),C.Math.toDegrees(c0.latitude)).up;
    const b=axesAt(C.Math.toDegrees(c1.longitude),C.Math.toDegrees(c1.latitude)).up;
    const arc=greatCircle(a,b,t);
    const lon=Math.atan2(arc.y,arc.x), lat=Math.atan2(arc.z,Math.hypot(arc.x,arc.y));
    const h0=Math.max(0,c0.height),h1=Math.max(0,c1.height);
    const height=Math.exp((1-t)*Math.log(h0+10000)+t*Math.log(h1+10000))-10000;
    const position=C.Cartesian3.fromRadians(lon,lat,Math.max(0,height));
    const focus=C.Cartesian3.lerp(flight.from.focus,flight.to.focus,t,new C.Cartesian3());
    // The rotating local east/north/up frame follows the globe throughout a flight.
    const startAxes=axesAt(C.Math.toDegrees(c0.longitude),C.Math.toDegrees(c0.latitude));
    const endAxes=axesAt(C.Math.toDegrees(c1.longitude),C.Math.toDegrees(c1.latitude));
    const pathAxes=axesAt(C.Math.toDegrees(lon),C.Math.toDegrees(lat));
    const local=(v,ax)=>new C.Cartesian3(C.Cartesian3.dot(v,ax.east),C.Cartesian3.dot(v,ax.north),C.Cartesian3.dot(v,ax.up));
    const world=(v,ax)=>C.Cartesian3.add(
      C.Cartesian3.add(
        C.Cartesian3.multiplyByScalar(ax.east,v.x,new C.Cartesian3()),
        C.Cartesian3.multiplyByScalar(ax.north,v.y,new C.Cartesian3()),new C.Cartesian3()),
      C.Cartesian3.multiplyByScalar(ax.up,v.z,new C.Cartesian3()),new C.Cartesian3());
    const direction=world(C.Cartesian3.lerp(local(flight.from.direction,startAxes),local(flight.to.direction,endAxes),t,new C.Cartesian3()),pathAxes);
    const upHint=world(C.Cartesian3.lerp(local(flight.from.up,startAxes),local(flight.to.up,endAxes),t,new C.Cartesian3()),pathAxes);
    return orientPose(position,focus,direction,upHint);
  }
  function beginApproach(seconds=phaseDuration('approach')){
    const target=placeAt(runtime.index);
    const c=C.Cartographic.fromCartesian(runtime.pose.position);
    const from=axesAt(C.Math.toDegrees(c.longitude),C.Math.toDegrees(c.latitude)).up;
    const angle=Math.acos(clamp(C.Cartesian3.dot(from,axesAt(target.lon,target.lat).up),-1,1));
    runtime.transition={kind:'align',from:runtime.pose,to:overheadPose(target),approachSeconds:seconds};
    // Longer routes get more time; the altitude stays at the orbital level.
    setStage('align',(4+8*angle/Math.PI)/config.speed);
  }
  function beginDepart(seconds=phaseDuration('depart')){
    const c=C.Cartographic.fromCartesian(runtime.pose.position);
    const lon=C.Math.toDegrees(c.longitude),lat=C.Math.toDegrees(c.latitude);
    runtime.globeLongitude=lon;runtime.globeLatitude=lat;
    runtime.transition={kind:'depart',from:runtime.pose,to:globePose(lon,lat)};
    setStage('depart',Math.max(.5,seconds));
  }
  function completeTransition(){
    const flight=runtime.transition,kind=flight.kind;
    setPose(flight.to);
    runtime.transition=null;
    if(kind==='align'){
      const target=placeAt(runtime.index);
      runtime.transition={kind:'approach',from:runtime.pose,to:nearPose(target,target.heading)};
      setStage('approach',Math.max(.5,flight.approachSeconds));
    }else if(kind==='approach'){
      runtime.nearHeading=placeAt(runtime.index).heading;
      setStage('near');
    }else{
      if(runtime.pendingIndex!==null){
        runtime.index=runtime.pendingIndex;
        runtime.pendingIndex=null;
      }else{
        runtime.index=(runtime.index+1)%PLACES.length;
      }
      updateDestination();
      setStage('globe',runtime.manualSkip?2.5/config.speed:phaseDuration('globe'));
      runtime.manualSkip=false;
    }
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
  function jumpTo(newIndex){
    if(!viewer)return;
    if(runtime.paused)resume();
    const index=(newIndex+PLACES.length)%PLACES.length;
    runtime.manualSkip=true;
    if(runtime.stage==='globe'){
      runtime.index=index;runtime.pendingIndex=null;
      updateDestination();
      beginApproach();
    }else{
      runtime.pendingIndex=index;
      if(runtime.stage!=='depart')beginDepart(Math.max(4,6/config.speed));
    }
  }
  function pause(){
    if(runtime.paused||!viewer)return;
    runtime.paused=true;
    viewer.clock.shouldAnimate=false;
    runtime.lastFrame=0;
    updateUI();
  }
  function resume(){
    if(!runtime.paused||!viewer)return;
    runtime.paused=false;
    viewer.clock.shouldAnimate=true;
    runtime.lastFrame=0;
    updateUI();
  }
  function togglePause(){runtime.paused?resume():pause();}
  function animateFrame(timestamp){
    if(runtime.shuttingDown)return;
    requestAnimationFrame(animateFrame);
    if(!viewer)return;
    if(!runtime.lastFrame)runtime.lastFrame=timestamp;
    const dt=clamp((timestamp-runtime.lastFrame)/1000,0,.08);
    runtime.lastFrame=timestamp;
    if(runtime.paused||document.hidden)return;
    runtime.stageElapsed+=dt;
    if(runtime.stage==='globe'){
      runtime.globeLongitude+=dt*1.1*config.speed;
      if(runtime.globeLongitude>180)runtime.globeLongitude-=360;
      setPose(globePose(runtime.globeLongitude,runtime.globeLatitude));
      if(runtime.stageElapsed>=runtime.stageDuration)beginApproach();
    }else if(runtime.stage==='near'){
      runtime.nearHeading+=dt*4.5*config.speed;
      setPose(nearPose(placeAt(runtime.index),runtime.nearHeading));
      if(runtime.stageElapsed>=runtime.stageDuration)beginDepart();
    }else if(runtime.transition){
      const progress=clamp(runtime.stageElapsed/runtime.stageDuration,0,1);
      setPose(transitionPose(runtime.transition,progress));
      if(progress>=1)completeTransition();
    }
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
      terrainActive = false;
      if(runtime.pose) beginDepart();
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
      terrainActive = true;
      if(runtime.pose) beginDepart();
      msg.textContent = '3D地形を有効にしました。山岳地帯で立体感が増します。';
      showToast('Cesium World Terrain を有効にしました。');
    } catch (error) {
      console.error('Cesium terrain unavailable', error);
      viewer.terrainProvider = new C.EllipsoidTerrainProvider();
      terrainActive = false;
      if(runtime.pose) beginDepart();
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
      setPose(globePose(runtime.globeLongitude,runtime.globeLatitude));
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
