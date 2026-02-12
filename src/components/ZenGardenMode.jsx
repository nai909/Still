import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { haptic } from '../config/haptic';

const SR = 256, SS = 40, GD = 0.18;

const TOD_PRESETS = {
  dawn:    { bg: 0x2a1f28, fog: 0x2a1f28, fogD: 0.010, sun: 0xffaa88, sunI: 0.7, sunPos: [-20, 6, -5], amb: 0x4a3040, ambI: 0.35, fill: 0x8866aa, fillI: 0.2, hemiSky: 0x997788, hemiGnd: 0x332222, exposure: 0.65, firefly: 0.0, lantern: 0.3, label: 'dawn' },
  morning: { bg: 0x8aaccc, fog: 0x8aaccc, fogD: 0.008, sun: 0xffeedd, sunI: 1.0, sunPos: [-10, 25, 5], amb: 0x556677, ambI: 0.45, fill: 0x99aabb, fillI: 0.3, hemiSky: 0xaabbcc, hemiGnd: 0x554433, exposure: 0.9, firefly: 0.0, lantern: 0.1, label: 'morning' },
  golden:  { bg: 0x1a1812, fog: 0x1a1812, fogD: 0.012, sun: 0xffd4a0, sunI: 1.2, sunPos: [-15, 20, -10], amb: 0x3d3428, ambI: 0.4, fill: 0x6688aa, fillI: 0.3, hemiSky: 0x8899aa, hemiGnd: 0x443322, exposure: 0.8, firefly: 0.15, lantern: 0.5, label: 'golden hour' },
  night:   { bg: 0x0e1118, fog: 0x0e1118, fogD: 0.010, sun: 0x6688bb, sunI: 0.45, sunPos: [10, 20, 10], amb: 0x1a2030, ambI: 0.35, fill: 0x334466, fillI: 0.2, hemiSky: 0x223344, hemiGnd: 0x111118, exposure: 0.55, firefly: 0.6, lantern: 1.2, label: 'night' },
};
const TOD_ORDER = ['dawn', 'morning', 'golden', 'night'];

export default function ZenGardenMode({ primaryHue = 162 }) {
  const containerRef = useRef(null);
  const [curTool, setCurTool] = useState('view');
  const [hint, setHint] = useState('');

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const clockRef = useRef(null);
  const animFrameRef = useRef(null);

  // Audio refs
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const rakeSndRef = useRef({ src: null, gain: null, flt: null });

  // Scene objects
  const gGroupRef = useRef(null);
  const sandMeshRef = useRef(null);
  const sandGeoRef = useRef(null);
  const sandHMRef = useRef(new Float32Array(SR * SR));
  const bamGroupRef = useRef(null);
  const petalsRef = useRef(null);
  const particlesRef = useRef(null);
  const waterGrpRef = useRef(null);
  const rakeMeshRef = useRef(null);
  const lanternLightRef = useRef(null);

  // Lights
  const sunLightRef = useRef(null);
  const ambLightRef = useRef(null);
  const fillLightRef = useRef(null);
  const hemiLightRef = useRef(null);

  // Interaction state
  const moveableRef = useRef([]);
  const pondsRef = useRef([]);
  const deerRef = useRef([]);
  const dragStoneRef = useRef(null);
  const isIntRef = useRef(false);
  const lastHitRef = useRef(null);
  const lastRakeHapticRef = useRef(0);

  // Camera state
  const camRef = useRef({ cT: Math.PI * 0.15, cP: Math.PI * 0.32, cR: 28, tT: Math.PI * 0.15, tP: Math.PI * 0.32, tR: 28 });
  const orbitingRef = useRef(false);
  const orbStartRef = useRef({ x: 0, y: 0 });

  // TOD state
  const todIdxRef = useRef(1); // morning
  const todCurrentRef = useRef({});
  const todTargetRef = useRef({});

  // Time
  const tmRef = useRef(0);

  // Raycaster
  const rayRef = useRef(new THREE.Raycaster());
  const mVecRef = useRef(new THREE.Vector2());

  // Tool ref for event handlers
  const curToolRef = useRef('view');
  useEffect(() => { curToolRef.current = curTool; }, [curTool]);

  const showHint = useCallback((t) => {
    setHint(t);
    setTimeout(() => setHint(''), 2000);
  }, []);

  // === AUDIO ===
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    masterGainRef.current = audioCtxRef.current.createGain();
    masterGainRef.current.gain.value = 0;
    masterGainRef.current.connect(audioCtxRef.current.destination);
    masterGainRef.current.gain.linearRampToValueAtTime(0.15, audioCtxRef.current.currentTime + 3);
  }, []);

  const mkBowlTone = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
    const freq = [174, 220, 261, 329, 392][Math.floor(Math.random() * 5)];
    [1, 2.71, 5.4].forEach((h, i) => {
      const o = audioCtxRef.current.createOscillator();
      const g = audioCtxRef.current.createGain();
      o.frequency.value = freq * h;
      g.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      g.gain.linearRampToValueAtTime(0.08 / (i + 1), audioCtxRef.current.currentTime + 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 6);
      o.connect(g);
      g.connect(masterGainRef.current);
      o.start();
      o.stop(audioCtxRef.current.currentTime + 7);
    });
  }, []);

  const initRakeSound = useCallback(() => {
    if (!audioCtxRef.current || rakeSndRef.current.src) return;
    const bs = audioCtxRef.current.sampleRate * 2;
    const buf = audioCtxRef.current.createBuffer(2, bs, audioCtxRef.current.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let lv = 0;
      for (let i = 0; i < bs; i++) {
        lv = (lv + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        d[i] = lv;
      }
    }
    rakeSndRef.current.src = audioCtxRef.current.createBufferSource();
    rakeSndRef.current.src.buffer = buf;
    rakeSndRef.current.src.loop = true;
    rakeSndRef.current.flt = audioCtxRef.current.createBiquadFilter();
    rakeSndRef.current.flt.type = 'bandpass';
    rakeSndRef.current.flt.frequency.value = 3000;
    rakeSndRef.current.flt.Q.value = 0.8;
    rakeSndRef.current.gain = audioCtxRef.current.createGain();
    rakeSndRef.current.gain.gain.value = 0;
    rakeSndRef.current.src.connect(rakeSndRef.current.flt);
    rakeSndRef.current.flt.connect(rakeSndRef.current.gain);
    rakeSndRef.current.gain.connect(masterGainRef.current);
    rakeSndRef.current.src.start();
  }, []);

  const rakeSndOn = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
    if (!rakeSndRef.current.src) initRakeSound();
    if (!rakeSndRef.current.gain) return;
    rakeSndRef.current.gain.gain.cancelScheduledValues(audioCtxRef.current.currentTime);
    rakeSndRef.current.gain.gain.linearRampToValueAtTime(0.12, audioCtxRef.current.currentTime + 0.15);
  }, [initRakeSound]);

  const rakeSndOff = useCallback(() => {
    if (!rakeSndRef.current.gain || !audioCtxRef.current) return;
    rakeSndRef.current.gain.gain.cancelScheduledValues(audioCtxRef.current.currentTime);
    rakeSndRef.current.gain.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.4);
  }, []);

  // === SAND ===
  const initHM = useCallback(() => {
    for (let i = 0; i < SR; i++) {
      for (let j = 0; j < SR; j++) {
        const x = (j / SR - 0.5) * SS, z = (i / SR - 0.5) * SS;
        sandHMRef.current[i * SR + j] = Math.sin(x * 0.5) * Math.cos(z * 0.6) * 0.008 + Math.sin(x * 2.1 + z * 1.7) * 0.004;
      }
    }
  }, []);

  const w2g = useCallback((wx, wz) => {
    return [
      Math.max(0, Math.min(SR - 1, Math.floor((wx / SS + 0.5) * SR))),
      Math.max(0, Math.min(SR - 1, Math.floor((wz / SS + 0.5) * SR)))
    ];
  }, []);

  const applyHM = useCallback(() => {
    if (!sandGeoRef.current) return;
    const pos = sandGeoRef.current.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const row = Math.floor(i / SR), col = i % SR;
      pos.setZ(i, sandHMRef.current[row * SR + col]);
    }
    pos.needsUpdate = true;
    sandGeoRef.current.computeVertexNormals();
  }, []);

  const rakeAt = useCallback((wx, wz, px, pz) => {
    let dx = wx - (px || wx), dz = wz - (pz || wz);
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.005) return;
    dx /= len; dz /= len;
    const perpX = -dz, perpZ = dx;
    const rakeHalfWidth = 2.0;
    const grooveSpacing = 0.45;
    const grooveFreq = Math.PI / grooveSpacing;
    const grooveAmp = GD * 0.4;
    const cellSize = SS / SR;
    const steps = Math.max(1, Math.ceil(len / (cellSize * 0.4)));
    const gridR = Math.ceil(rakeHalfWidth / cellSize) + 1;

    for (let s = 0; s <= steps; s++) {
      const frac = s / steps;
      const sx = px + (wx - px) * frac;
      const sz = pz + (wz - pz) * frac;
      const [cx, cz] = w2g(sx, sz);
      for (let di = -gridR; di <= gridR; di++) {
        for (let dj = -gridR; dj <= gridR; dj++) {
          const ni = cz + di, nj = cx + dj;
          if (ni < 0 || ni >= SR || nj < 0 || nj >= SR) continue;
          const cellWX = (nj / SR - 0.5) * SS;
          const cellWZ = (ni / SR - 0.5) * SS;
          const toX = cellWX - sx, toZ = cellWZ - sz;
          const perpDist = toX * perpX + toZ * perpZ;
          const parDist = toX * dx + toZ * dz;
          if (Math.abs(perpDist) > rakeHalfWidth) continue;
          if (Math.abs(parDist) > cellSize * 2) continue;
          const wave = Math.sin(perpDist * grooveFreq);
          const t = Math.abs(perpDist) / rakeHalfWidth;
          const edgeFade = 1 - t * t * t;
          const targetH = wave * grooveAmp * edgeFade;
          const idx = ni * SR + nj;
          sandHMRef.current[idx] += (targetH - sandHMRef.current[idx]) * 0.5;
        }
      }
    }
    applyHM();
  }, [w2g, applyHM]);

  // === TOD ===
  const _setTOD = useCallback((c) => {
    if (!sceneRef.current || !rendererRef.current) return;
    sceneRef.current.background.setHex(c.bg);
    sceneRef.current.fog.color.setHex(c.bg);
    sceneRef.current.fog.density = c.fogD;
    if (sunLightRef.current) {
      sunLightRef.current.color.setHex(c.sun);
      sunLightRef.current.intensity = c.sunI;
      sunLightRef.current.position.set(...c.sunPos);
    }
    if (ambLightRef.current) {
      ambLightRef.current.color.setHex(c.amb);
      ambLightRef.current.intensity = c.ambI;
    }
    if (fillLightRef.current) {
      fillLightRef.current.color.setHex(c.fill);
      fillLightRef.current.intensity = c.fillI;
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.color.setHex(c.hemiSky);
      hemiLightRef.current.groundColor.setHex(c.hemiGnd);
    }
    rendererRef.current.toneMappingExposure = c.exposure;
  }, []);

  const applyTOD = useCallback((p, instant) => {
    todTargetRef.current = { ...p };
    if (instant) {
      todCurrentRef.current = { ...p };
      _setTOD(todCurrentRef.current);
    }
  }, [_setTOD]);

  const lerpColor = useCallback((a, b, t) => {
    const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
    const br2 = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
    const r = Math.round(ar + (br2 - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return (r << 16) | (g << 8) | bl;
  }, []);

  const lerpArr = useCallback((a, b, t) => a.map((v, i) => v + (b[i] - v) * t), []);

  const updateTODLerp = useCallback((dt) => {
    if (!todTargetRef.current.bg) return;
    const spd = 0.5 * dt;
    const c = todCurrentRef.current, tg = todTargetRef.current;
    c.bg = lerpColor(c.bg, tg.bg, spd);
    c.sun = lerpColor(c.sun, tg.sun, spd);
    c.amb = lerpColor(c.amb, tg.amb, spd);
    c.fill = lerpColor(c.fill, tg.fill, spd);
    c.hemiSky = lerpColor(c.hemiSky, tg.hemiSky, spd);
    c.hemiGnd = lerpColor(c.hemiGnd, tg.hemiGnd, spd);
    c.fogD += (tg.fogD - c.fogD) * spd;
    c.sunI += (tg.sunI - c.sunI) * spd;
    c.ambI += (tg.ambI - c.ambI) * spd;
    c.fillI += (tg.fillI - c.fillI) * spd;
    c.exposure += (tg.exposure - c.exposure) * spd;
    c.firefly += (tg.firefly - c.firefly) * spd;
    c.lantern += (tg.lantern - c.lantern) * spd;
    c.sunPos = lerpArr(c.sunPos, tg.sunPos, spd);
    _setTOD(c);
  }, [lerpColor, lerpArr, _setTOD]);

  const cycleTOD = useCallback(() => {
    todIdxRef.current = (todIdxRef.current + 1) % TOD_ORDER.length;
    const p = TOD_PRESETS[TOD_ORDER[todIdxRef.current]];
    applyTOD(p, false);
    showHint(p.label);
    mkBowlTone();
    haptic.selection();
  }, [applyTOD, showHint, mkBowlTone]);

  const resetGarden = useCallback(() => {
    // Reset sand heightmap
    initHM();
    applyHM();
    // Reset camera
    camRef.current = { cT: Math.PI * 0.15, cP: Math.PI * 0.32, cR: 28, tT: Math.PI * 0.15, tP: Math.PI * 0.32, tR: 28 };
    // Reset TOD to morning
    todIdxRef.current = 1;
    applyTOD(TOD_PRESETS.morning, false);
    showHint('reset');
    mkBowlTone();
    haptic.medium();
  }, [initHM, applyHM, applyTOD, showHint, mkBowlTone]);

  // Auto-initialize audio on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      initAudio();
      setTimeout(() => mkBowlTone(), 3000);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
    };
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('click', handleFirstInteraction, { once: true });
    return () => {
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
    };
  }, [initAudio, mkBowlTone]);

  // === SCENE SETUP ===
  useEffect(() => {
    if (!containerRef.current) return;

    clockRef.current = new THREE.Clock();
    moveableRef.current = [];
    pondsRef.current = [];
    deerRef.current = [];

    // Scene
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(0x1a1812);
    sceneRef.current.fog = new THREE.FogExp2(0x1a1812, 0.012);

    // Camera
    cameraRef.current = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 200);
    const updateCamera = () => {
      const cam = camRef.current;
      cameraRef.current.position.x = cam.cR * Math.sin(cam.cP) * Math.sin(cam.cT);
      cameraRef.current.position.y = cam.cR * Math.cos(cam.cP);
      cameraRef.current.position.z = cam.cR * Math.sin(cam.cP) * Math.cos(cam.cT);
      cameraRef.current.lookAt(0, 1.5, 0);
    };
    updateCamera();

    // Renderer
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current.shadowMap.enabled = true;
    rendererRef.current.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current.outputEncoding = THREE.sRGBEncoding;
    containerRef.current.appendChild(rendererRef.current.domElement);

    // Garden group
    gGroupRef.current = new THREE.Group();
    sceneRef.current.add(gGroupRef.current);

    // === LIGHTS ===
    ambLightRef.current = new THREE.AmbientLight(0x3d3428, 0.4);
    sceneRef.current.add(ambLightRef.current);

    sunLightRef.current = new THREE.DirectionalLight(0xffd4a0, 1.2);
    sunLightRef.current.position.set(-15, 20, -10);
    sunLightRef.current.castShadow = true;
    sunLightRef.current.shadow.mapSize.set(2048, 2048);
    sunLightRef.current.shadow.camera.near = 0.5;
    sunLightRef.current.shadow.camera.far = 80;
    sunLightRef.current.shadow.camera.left = -25;
    sunLightRef.current.shadow.camera.right = 25;
    sunLightRef.current.shadow.camera.top = 25;
    sunLightRef.current.shadow.camera.bottom = -25;
    sunLightRef.current.shadow.bias = -0.001;
    sunLightRef.current.shadow.normalBias = 0.02;
    sceneRef.current.add(sunLightRef.current);

    fillLightRef.current = new THREE.DirectionalLight(0x6688aa, 0.3);
    fillLightRef.current.position.set(10, 8, 15);
    sceneRef.current.add(fillLightRef.current);

    const backLight = new THREE.DirectionalLight(0xffaa66, 0.25);
    backLight.position.set(0, 5, -20);
    sceneRef.current.add(backLight);

    hemiLightRef.current = new THREE.HemisphereLight(0x8899aa, 0x443322, 0.3);
    sceneRef.current.add(hemiLightRef.current);

    const basinLight = new THREE.PointLight(0xffcc88, 0.3, 8, 2);
    basinLight.position.set(-5, 2, 3);
    sceneRef.current.add(basinLight);

    // Apply initial TOD
    applyTOD(TOD_PRESETS.morning, true);

    // Initialize heightmap
    initHM();

    // === SAND MESH ===
    sandGeoRef.current = new THREE.PlaneGeometry(SS, SS, SR - 1, SR - 1);
    applyHM();
    sandMeshRef.current = new THREE.Mesh(
      sandGeoRef.current,
      new THREE.MeshStandardMaterial({ color: 0xd4c5a0, roughness: 0.92, metalness: 0 })
    );
    sandMeshRef.current.rotation.x = -Math.PI / 2;
    sandMeshRef.current.receiveShadow = true;
    sandMeshRef.current.name = 'sand';
    gGroupRef.current.add(sandMeshRef.current);

    // Border
    const bm = new THREE.MeshStandardMaterial({ color: 0x4a3828, roughness: 0.85, metalness: 0.05 });
    [[40.6, 0.35, 0.35, 0, 0.17, -20], [40.6, 0.35, 0.35, 0, 0.17, 20],
     [0.35, 0.35, 40, -20, 0.17, 0], [0.35, 0.35, 40, 20, 0.17, 0]].forEach(b => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(b[0], b[1], b[2]), bm);
      m.position.set(b[3], b[4], b[5]);
      m.castShadow = true;
      m.receiveShadow = true;
      gGroupRef.current.add(m);
    });

    // === STONES ===
    const stoneMats = [
      new THREE.MeshStandardMaterial({ color: 0x5a5550, roughness: 0.85, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ color: 0x6b6560, roughness: 0.9, metalness: 0.03 }),
      new THREE.MeshStandardMaterial({ color: 0x4a4540, roughness: 0.88, metalness: 0.04 }),
      new THREE.MeshStandardMaterial({ color: 0x7a7268, roughness: 0.82, metalness: 0.06 }),
    ];
    const stoneDefs = [
      [3, 0.8, 1, 1.2, 1.6, 0.9, 0, 0.3, 0.1, 0],
      [4.5, 0.45, 1.8, 0.8, 0.7, 0.6, 0.1, 0.8, 0, 1],
      [2, 0.35, 2, 0.65, 0.5, 0.7, 0, -0.2, 0.05, 2],
      [-4, 0.6, 2, 1, 1.1, 0.8, 0.05, 1.2, 0, 3],
      [-3.2, 0.3, 3, 0.5, 0.4, 0.45, 0, 0.5, 0, 1],
      [0, 0.5, -3, 0.7, 0.9, 0.6, 0, 0.7, 0.08, 2],
      [-7, 0.15, -5, 0.25, 0.2, 0.3, 0, 1.5, 0, 3],
      [8, 0.12, -7, 0.2, 0.15, 0.22, 0.1, 2.3, 0, 0],
    ];
    stoneDefs.forEach(d => {
      const geo = new THREE.IcosahedronGeometry(1, 3);
      const pos = geo.attributes.position;
      for (let j = 0; j < pos.count; j++) {
        const vx = pos.getX(j), vy = pos.getY(j), vz = pos.getZ(j);
        const n = Math.sin(vx * 3.7 + vy * 2.3) * Math.cos(vz * 4.1 + vx * 1.7) * 0.15;
        const n2 = Math.sin(vy * 5.2 + vz * 3.8) * 0.08;
        pos.setX(j, vx + n * vx);
        pos.setY(j, vy + (n + n2) * vy);
        pos.setZ(j, vz + n * vz);
      }
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, stoneMats[d[9] || 0]);
      m.position.set(d[0], d[1], d[2]);
      m.scale.set(d[3], d[4], d[5]);
      m.rotation.set(d[6] || 0, d[7] || 0, d[8] || 0);
      m.castShadow = true;
      m.receiveShadow = true;
      gGroupRef.current.add(m);
      moveableRef.current.push(m);
    });

    // === MOSS ===
    const m1 = new THREE.MeshStandardMaterial({ color: 0x4a6b3a, roughness: 0.95 });
    const m2 = new THREE.MeshStandardMaterial({ color: 0x3a5a2a, roughness: 0.95 });
    const mkMossPatch = (x, z, r, n) => {
      const grp = new THREE.Group();
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
        const d = Math.random() * r;
        const s = 0.1 + Math.random() * 0.25;
        const geo = new THREE.SphereGeometry(s, 6, 4);
        const pos = geo.attributes.position;
        for (let j = 0; j < pos.count; j++) pos.setY(j, pos.getY(j) * 0.3);
        geo.computeVertexNormals();
        const mesh = new THREE.Mesh(geo, Math.random() > 0.5 ? m1 : m2);
        mesh.position.set(Math.cos(a) * d, 0.02 + Math.random() * 0.03, Math.sin(a) * d);
        mesh.castShadow = true;
        grp.add(mesh);
      }
      grp.position.set(x, 0, z);
      gGroupRef.current.add(grp);
      moveableRef.current.push(grp);
    };
    mkMossPatch(3, 1, 1.8, 20);
    mkMossPatch(-4, 2, 1.2, 15);
    mkMossPatch(0, -3, 0.8, 10);
    mkMossPatch(-15, -15, 2, 25);
    mkMossPatch(-12, 15, 2.5, 30);
    mkMossPatch(14, -14, 1.8, 20);
    mkMossPatch(15, 12, 2, 22);
    mkMossPatch(-16, -8, 1.5, 18);
    mkMossPatch(16, 6, 1.5, 18);

    // === BAMBOO ===
    bamGroupRef.current = new THREE.Group();
    const bamMat = new THREE.MeshStandardMaterial({ color: 0x6b8a5a, roughness: 0.7, metalness: 0.1 });
    const bamMat2 = new THREE.MeshStandardMaterial({ color: 0x5a7a4a, roughness: 0.75, metalness: 0.08 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4a7a3a, roughness: 0.8, side: THREE.DoubleSide });

    const mkStalk = (x, z, h) => {
      const g = new THREE.Group();
      const segs = Math.floor(h / 1.2);
      const mat = Math.random() > 0.5 ? bamMat : bamMat2;
      let cy = 0;
      for (let s = 0; s < segs; s++) {
        const sh = 0.9 + Math.random() * 0.4;
        const r = 0.08 - s * 0.003;
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(Math.max(0.03, r - 0.01), Math.max(0.035, r), sh, 8), mat);
        seg.position.y = cy + sh / 2;
        seg.castShadow = true;
        g.add(seg);
        if (s < segs - 1) {
          const node = new THREE.Mesh(new THREE.TorusGeometry(r + 0.01, 0.015, 6, 12), mat);
          node.position.y = cy + sh;
          node.rotation.x = Math.PI / 2;
          g.add(node);
        }
        if (s > segs / 2 && Math.random() > 0.3) {
          for (let l = 0; l < 2 + Math.floor(Math.random() * 3); l++) {
            const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.4 + Math.random() * 0.3, 0.08), leafMat);
            const a = Math.random() * Math.PI * 2;
            leaf.position.set(Math.cos(a) * 0.2, cy + sh * 0.7, Math.sin(a) * 0.2);
            leaf.rotation.set(-0.3 + Math.random() * 0.3, a, -0.5 - Math.random() * 0.5);
            leaf.castShadow = true;
            g.add(leaf);
          }
        }
        cy += sh;
      }
      g.position.set(x, 0, z);
      g.rotation.z = (Math.random() - 0.5) * 0.08;
      g.userData = {
        swayPhase: Math.random() * Math.PI * 2,
        swayAmt: 0.003 + Math.random() * 0.004,
        baseRX: (Math.random() - 0.5) * 0.05,
        baseRZ: g.rotation.z
      };
      bamGroupRef.current.add(g);
    };
    for (let i = 0; i < 30; i++) {
      mkStalk(-12 + Math.random() * 10 - 5, -18 + Math.random() * 6 - 2, 6 + Math.random() * 5);
    }
    gGroupRef.current.add(bamGroupRef.current);
    bamGroupRef.current.children.forEach(stalk => moveableRef.current.push(stalk));

    // === MAPLE TREE ===
    const mapleTrunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.9, metalness: 0.05 });
    const mapleLeafMats = [
      new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.7, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0xdd5522, roughness: 0.7, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0xee7733, roughness: 0.7, side: THREE.DoubleSide, transparent: true, opacity: 0.75 }),
    ];
    const mapleGroup = new THREE.Group();
    const mapleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.3, 1.5, 0.1),
      new THREE.Vector3(0.1, 3, -0.2), new THREE.Vector3(-0.3, 4.5, 0), new THREE.Vector3(0, 5.5, 0.1)
    ]);
    const mapleTrunk = new THREE.Mesh(new THREE.TubeGeometry(mapleCurve, 20, 0.18, 8, false), mapleTrunkMat);
    mapleTrunk.castShadow = true;
    mapleGroup.add(mapleTrunk);

    const mkBranch = (s, e, t) => {
      const c = new THREE.CatmullRomCurve3([s, e]);
      const br = new THREE.Mesh(new THREE.TubeGeometry(c, 8, t, 6, false), mapleTrunkMat);
      br.castShadow = true;
      mapleGroup.add(br);
      return e;
    };
    const b1 = mkBranch(new THREE.Vector3(0.2, 3, 0), new THREE.Vector3(2, 4, 1), 0.08);
    const b2 = mkBranch(new THREE.Vector3(-0.1, 3.5, -0.1), new THREE.Vector3(-2, 4.5, -1), 0.07);
    mkBranch(new THREE.Vector3(0, 4.5, 0), new THREE.Vector3(1.5, 5.5, -0.5), 0.06);
    mkBranch(new THREE.Vector3(0, 5, 0), new THREE.Vector3(-1, 6, 0.5), 0.05);
    mkBranch(b1, new THREE.Vector3(3, 4.3, 1.5), 0.04);
    mkBranch(b2, new THREE.Vector3(-3, 5, -1.5), 0.04);

    [{ p: [2, 4.2, 1], s: 1.5 }, { p: [3, 4.5, 1.5], s: 1 }, { p: [-2, 4.8, -1], s: 1.4 },
     { p: [-3, 5.2, -1.5], s: 1 }, { p: [1.5, 5.7, -0.5], s: 1.2 }, { p: [-1, 6.2, 0.5], s: 1.1 },
     { p: [0, 5.8, 0], s: 1.3 }, { p: [0.5, 6.5, 0], s: 0.8 }].forEach((lp, idx) => {
      const geo = new THREE.IcosahedronGeometry(lp.s, 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        pos.setX(i, pos.getX(i) + Math.sin(pos.getY(i) * 3 + pos.getZ(i) * 2) * 0.2);
        pos.setY(i, pos.getY(i) * 0.6);
      }
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, mapleLeafMats[idx % 3]);
      m.position.set(...lp.p);
      m.castShadow = true;
      mapleGroup.add(m);
    });
    mapleGroup.position.set(12, 0, -8);
    mapleGroup.rotation.y = -0.3;
    gGroupRef.current.add(mapleGroup);
    moveableRef.current.push(mapleGroup);

    // === WATER BASIN ===
    waterGrpRef.current = new THREE.Group();
    const basinMat = new THREE.MeshStandardMaterial({ color: 0x6a6560, roughness: 0.85, metalness: 0.05 });
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x3a5a6a, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.7 });
    const basinGeo = new THREE.CylinderGeometry(0.6, 0.7, 0.8, 12);
    const bp = basinGeo.attributes.position;
    for (let i = 0; i < bp.count; i++) bp.setX(i, bp.getX(i) + Math.sin(bp.getX(i) * 5 + bp.getZ(i) * 3) * 0.03);
    basinGeo.computeVertexNormals();
    const basin = new THREE.Mesh(basinGeo, basinMat);
    basin.position.y = 0.4;
    basin.castShadow = true;
    waterGrpRef.current.add(basin);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 16), waterMat);
    water.position.y = 0.75;
    water.userData.isWater = true;
    waterGrpRef.current.add(water);

    const spoutCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.5, 1.8, 0), new THREE.Vector3(-0.8, 1.6, 0), new THREE.Vector3(-0.3, 1.2, 0)
    ]);
    const spoutMat = new THREE.MeshStandardMaterial({ color: 0x6b8a5a, roughness: 0.7, metalness: 0.1 });
    waterGrpRef.current.add(new THREE.Mesh(new THREE.TubeGeometry(spoutCurve, 12, 0.05, 6, false), spoutMat));
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.8, 6), spoutMat);
    post.position.set(-1.5, 0.9, 0);
    waterGrpRef.current.add(post);

    const dripMat = new THREE.MeshStandardMaterial({ color: 0x88bbcc, transparent: true, opacity: 0.6, roughness: 0.1, metalness: 0.3 });
    for (let i = 0; i < 5; i++) {
      const drip = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), dripMat);
      drip.position.set(-0.3, 1.2, 0);
      drip.visible = false;
      drip.userData = { dripPhase: i * (Math.PI * 2 / 5) };
      waterGrpRef.current.add(drip);
    }

    [[-0.9, 0, 0.5], [0.7, 0, -0.3], [-0.4, 0, -0.8], [0.5, 0, 0.7]].forEach(p2 => {
      const sg = new THREE.IcosahedronGeometry(0.25, 1);
      const sp2 = sg.attributes.position;
      for (let i = 0; i < sp2.count; i++) sp2.setY(i, sp2.getY(i) * 0.5);
      sg.computeVertexNormals();
      const s2 = new THREE.Mesh(sg, basinMat);
      s2.position.set(p2[0], 0.1, p2[2]);
      s2.castShadow = true;
      waterGrpRef.current.add(s2);
    });
    waterGrpRef.current.position.set(-5, 0, 3);
    gGroupRef.current.add(waterGrpRef.current);
    moveableRef.current.push(waterGrpRef.current);

    // === LANTERN ===
    const lanternMat = new THREE.MeshStandardMaterial({ color: 0x7a7570, roughness: 0.85, metalness: 0.05 });
    const lanternGrp = new THREE.Group();
    [
      [() => new THREE.CylinderGeometry(0.4, 0.5, 0.3, 6), 0.15],
      [() => new THREE.CylinderGeometry(0.12, 0.15, 1.5, 6), 1.05],
      [() => new THREE.CylinderGeometry(0.45, 0.35, 0.15, 6), 1.85],
      [() => new THREE.BoxGeometry(0.5, 0.5, 0.5), 2.15],
      [() => new THREE.ConeGeometry(0.55, 0.4, 4), 2.6],
    ].forEach(([geoFn, y], i) => {
      const m = new THREE.Mesh(geoFn(), lanternMat);
      m.position.y = y;
      if (i >= 3) m.rotation.y = Math.PI / 4;
      m.castShadow = true;
      lanternGrp.add(m);
    });
    lanternLightRef.current = new THREE.PointLight(0xffaa55, 0.5, 6, 2);
    lanternLightRef.current.position.y = 2.15;
    lanternGrp.add(lanternLightRef.current);
    lanternGrp.userData.light = lanternLightRef.current;
    lanternGrp.position.set(-8, 0, -5);
    gGroupRef.current.add(lanternGrp);
    moveableRef.current.push(lanternGrp);

    // === FENCE ===
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.85, metalness: 0.05 });
    const fenceMat2 = new THREE.MeshStandardMaterial({ color: 0x6a5a3a, roughness: 0.88, metalness: 0.03 });
    for (let x = -19; x <= 19; x += 0.4) {
      const h = 2.5 + Math.sin(x * 0.3) * 0.3;
      const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, h, 4), Math.random() > 0.5 ? fenceMat : fenceMat2);
      p2.position.set(x, h / 2, -20);
      p2.castShadow = true;
      gGroupRef.current.add(p2);
    }
    for (let y = 0.8; y < 2.5; y += 0.7) {
      const t2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 38, 4), fenceMat2);
      t2.position.set(0, y, -20);
      t2.rotation.z = Math.PI / 2;
      gGroupRef.current.add(t2);
    }
    for (let z = -19; z <= -5; z += 0.5) {
      const h = 2 + Math.sin(z * 0.4) * 0.2;
      const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, h, 4), fenceMat);
      p1.position.set(-20, h / 2, z);
      p1.castShadow = true;
      gGroupRef.current.add(p1);
      const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, h, 4), fenceMat2);
      p2.position.set(20, h / 2, z);
      p2.castShadow = true;
      gGroupRef.current.add(p2);
    }

    // === STEP STONES ===
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x6a6560, roughness: 0.9, metalness: 0.03 });
    const pathA = [[-8, -4], [-6.5, -2.5], [-5, -1], [-3.5, 0.5], [-2, 1.8], [-0.5, 2.8], [0.7, 3.4]];
    const pathB = [[11.3, 6.6], [12, 8], [12.3, 9.5], [12, 11], [11.3, 12.5], [10.2, 13.8], [8.8, 14.8]];
    pathA.concat(pathB).forEach(([x, z]) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.12, 8), stepMat);
      m.position.set(x, 0.06, z);
      m.rotation.y = Math.random() * 0.5;
      m.castShadow = true;
      m.receiveShadow = true;
      gGroupRef.current.add(m);
      moveableRef.current.push(m);
    });

    // === ZEN BRIDGE ===
    const bridgeGroup = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.8, metalness: 0.05 });
    const woodDark = new THREE.MeshStandardMaterial({ color: 0x3a2510, roughness: 0.85, metalness: 0.04 });
    const bLen = 11, bW = 1.2, arcH = 1.6;
    const planks = 18;

    for (let i = 0; i < planks; i++) {
      const t = (i / (planks - 1)) - 0.5;
      const x = t * bLen;
      const y = arcH * Math.cos(t * Math.PI) * 0.5 + 0.3;
      const tilt = -Math.sin(t * Math.PI) * 0.08;
      const plank = new THREE.Mesh(new THREE.BoxGeometry(bLen / planks * 0.92, 0.04, bW), i % 3 === 0 ? woodDark : woodMat);
      plank.position.set(x, y, 0);
      plank.rotation.z = tilt;
      plank.castShadow = true;
      plank.receiveShadow = true;
      bridgeGroup.add(plank);
    }

    const postPositions = [-0.45, -0.25, -0.05, 0.05, 0.25, 0.45];
    postPositions.forEach(t => {
      const x = t * bLen;
      const y = arcH * Math.cos(t * Math.PI) * 0.5 + 0.3;
      [-1, 1].forEach(side => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.7, 6), woodDark);
        post.position.set(x, y + 0.35, side * bW * 0.48);
        post.castShadow = true;
        bridgeGroup.add(post);
      });
    });

    [-1, 1].forEach(side => {
      const pts = [];
      for (let i = 0; i <= 20; i++) {
        const t = (i / 20) - 0.5;
        const x = t * bLen;
        const y = arcH * Math.cos(t * Math.PI) * 0.5 + 0.3 + 0.65;
        pts.push(new THREE.Vector3(x, y, side * bW * 0.48));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const rail = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.025, 6, false), woodMat);
      rail.castShadow = true;
      bridgeGroup.add(rail);
    });

    [-0.35, 0, 0.35].forEach(t => {
      const x = t * bLen;
      const y = arcH * Math.cos(t * Math.PI) * 0.5 + 0.3;
      [-1, 1].forEach(side => {
        const support = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, y + 0.05, 6), woodDark);
        support.position.set(x, (y - 0.02) / 2, side * bW * 0.35);
        support.castShadow = true;
        bridgeGroup.add(support);
      });
    });

    bridgeGroup.position.set(6, 0, 5);
    bridgeGroup.rotation.y = 0.3;
    gGroupRef.current.add(bridgeGroup);
    moveableRef.current.push(bridgeGroup);

    // === DEFAULT POND ===
    const placePond = (wx, wz, radius) => {
      radius = Math.max(0.3, Math.min(radius, 6));
      const g = new THREE.Group();
      const segs = 64;
      const seed = Math.random() * 100;

      const pondRadius = (angle) => {
        return radius * (0.85
          + 0.12 * Math.sin(angle * 2.3 + seed)
          + 0.08 * Math.sin(angle * 3.7 + seed * 1.4)
          + 0.05 * Math.sin(angle * 5.1 + seed * 2.1)
          + 0.04 * Math.cos(angle * 7.3 + seed * 0.8));
      };

      const mkPondShape = (rScale) => {
        const shape = new THREE.Shape();
        for (let i = 0; i <= segs; i++) {
          const a = (i / segs) * Math.PI * 2;
          const r = pondRadius(a) * rScale;
          const x = Math.cos(a) * r, y = Math.sin(a) * r;
          if (i === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        }
        return shape;
      };

      // Dark bottom
      const bedShape = mkPondShape(1.03);
      const bedGeo = new THREE.ShapeGeometry(bedShape, 1);
      const bedMat = new THREE.MeshStandardMaterial({
        color: 0x08101a, roughness: 0.8, depthWrite: true,
        polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
      });
      const bed = new THREE.Mesh(bedGeo, bedMat);
      bed.rotation.x = -Math.PI / 2;
      bed.position.y = 0.06;
      bed.renderOrder = 1;
      g.add(bed);

      // Main water surface
      const waterShape = mkPondShape(1.0);
      const waterGeo = new THREE.ShapeGeometry(waterShape, 1);
      const pondWaterMat = new THREE.MeshPhongMaterial({
        color: 0x0c2238, specular: 0x445566, shininess: 120,
        transparent: true, opacity: 0.88, side: THREE.DoubleSide,
        depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3
      });
      const pondWater = new THREE.Mesh(waterGeo, pondWaterMat);
      pondWater.rotation.x = -Math.PI / 2;
      pondWater.position.y = 0.07;
      pondWater.renderOrder = 2;
      pondWater.receiveShadow = true;
      g.add(pondWater);

      // Shallow edge
      const edgeShape = mkPondShape(1.0);
      const edgeHole = mkPondShape(0.6);
      edgeShape.holes.push(new THREE.Path(edgeHole.getPoints(segs)));
      const edgeGeo = new THREE.ShapeGeometry(edgeShape, 1);
      const edgeMat = new THREE.MeshPhongMaterial({
        color: 0x15304a, specular: 0x334455, shininess: 80,
        transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false
      });
      const edge = new THREE.Mesh(edgeGeo, edgeMat);
      edge.rotation.x = -Math.PI / 2;
      edge.position.y = 0.075;
      edge.renderOrder = 3;
      g.add(edge);

      // Bank rim
      const bankShape = mkPondShape(1.06);
      const bankHole = mkPondShape(0.99);
      bankShape.holes.push(new THREE.Path(bankHole.getPoints(segs)));
      const bankGeo = new THREE.ShapeGeometry(bankShape, 1);
      const bankMat = new THREE.MeshStandardMaterial({
        color: 0x2a2218, roughness: 0.95, metalness: 0.02,
        transparent: true, opacity: 0.5, depthWrite: false
      });
      const bank = new THREE.Mesh(bankGeo, bankMat);
      bank.rotation.x = -Math.PI / 2;
      bank.position.y = 0.055;
      bank.renderOrder = 0;
      g.add(bank);

      // Ripples
      const ripples = [];
      for (let i = 0; i < 3; i++) {
        const ripGeo = new THREE.RingGeometry(0.48, 0.52, 32);
        const ripMat = new THREE.MeshBasicMaterial({
          color: 0x6099dd, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false
        });
        const rip = new THREE.Mesh(ripGeo, ripMat);
        rip.rotation.x = -Math.PI / 2;
        rip.position.y = 0.08;
        rip.renderOrder = 4;
        g.add(rip);
        ripples.push({ mesh: rip, mat: ripMat, offset: i / 3 });
      }

      // Surrounding stones
      const pondStoneMats = [
        new THREE.MeshStandardMaterial({ color: 0x6a6560, roughness: 0.88, metalness: 0.03 }),
        new THREE.MeshStandardMaterial({ color: 0x7a7268, roughness: 0.85, metalness: 0.04 }),
        new THREE.MeshStandardMaterial({ color: 0x5a5550, roughness: 0.9, metalness: 0.03 }),
      ];
      const numStones = 8 + Math.floor(Math.random() * 6);
      for (let i = 0; i < numStones; i++) {
        const a = (i / numStones) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
        const sr = 0.08 + Math.random() * 0.2;
        const sg2 = new THREE.IcosahedronGeometry(sr, 1);
        const sp = sg2.attributes.position;
        for (let j = 0; j < sp.count; j++) {
          sp.setX(j, sp.getX(j) + Math.sin(sp.getY(j) * 4) * 0.03);
          sp.setY(j, sp.getY(j) * 0.45);
        }
        sg2.computeVertexNormals();
        const sm = new THREE.Mesh(sg2, pondStoneMats[Math.floor(Math.random() * 3)]);
        const edgeR = pondRadius(a) * 1.05 + sr * 0.3 + Math.random() * 0.1;
        sm.position.set(Math.cos(a) * edgeR, sr * 0.35, Math.sin(a) * edgeR);
        sm.rotation.y = Math.random() * Math.PI;
        sm.castShadow = true;
        sm.receiveShadow = true;
        g.add(sm);
      }

      // Koi fish
      const koiColors = [0xff6633, 0xffeeee, 0xff3311, 0xffaa22, 0xffffff];
      const koi = [];
      const numKoi = radius < 1 ? 1 : Math.min(5, Math.floor(radius * 1.5));
      for (let i = 0; i < numKoi; i++) {
        const kg = new THREE.Group();
        const col = koiColors[Math.floor(Math.random() * koiColors.length)];
        const bodyLen = 0.2 + Math.random() * 0.12;
        const bodyGeo = new THREE.SphereGeometry(bodyLen, 8, 6);
        const bpos = bodyGeo.attributes.position;
        for (let j = 0; j < bpos.count; j++) {
          const z = bpos.getZ(j);
          bpos.setX(j, bpos.getX(j) * 0.35);
          bpos.setY(j, bpos.getY(j) * 0.2);
          if (z < 0) bpos.setX(j, bpos.getX(j) * (1 - Math.abs(z) / bodyLen * 0.5));
        }
        bodyGeo.computeVertexNormals();
        kg.add(new THREE.Mesh(bodyGeo, new THREE.MeshPhongMaterial({
          color: col, emissive: col, emissiveIntensity: 0.3, specular: 0x666666, shininess: 40
        })));
        const tail = new THREE.Mesh(
          new THREE.PlaneGeometry(0.1, 0.07),
          new THREE.MeshPhongMaterial({ color: col, emissive: col, emissiveIntensity: 0.2, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
        );
        tail.position.z = -bodyLen * 0.85;
        kg.add(tail);
        if (Math.random() > 0.4) {
          const spotGeo = new THREE.SphereGeometry(bodyLen * 0.35, 6, 4);
          const spos2 = spotGeo.attributes.position;
          for (let j = 0; j < spos2.count; j++) {
            spos2.setX(j, spos2.getX(j) * 0.36);
            spos2.setY(j, spos2.getY(j) * 0.22);
          }
          spotGeo.computeVertexNormals();
          const spotCol = col === 0xffffff ? 0xff6633 : 0xffffff;
          const spot = new THREE.Mesh(spotGeo, new THREE.MeshPhongMaterial({
            color: spotCol, emissive: spotCol, emissiveIntensity: 0.2, specular: 0x222222, shininess: 20
          }));
          spot.position.set(0, 0.005, bodyLen * 0.15);
          kg.add(spot);
        }
        const angle = Math.random() * Math.PI * 2;
        const swimR = 0.15 + Math.random() * (radius * 0.45);
        kg.position.set(Math.cos(angle) * swimR, 0.09, Math.sin(angle) * swimR);
        kg.rotation.y = angle + Math.PI / 2;
        kg.renderOrder = 5;
        g.add(kg);
        koi.push({ mesh: kg, tail, angle, swimR, speed: 0.12 + Math.random() * 0.2, wobble: Math.random() * Math.PI * 2, dir: Math.random() > 0.5 ? 1 : -1 });
      }

      g.position.set(wx, 0, wz);
      g.userData.pond = { water: pondWater, waterMat: pondWaterMat, radius, phase: Math.random() * Math.PI * 2, ripples, koi, pondRadius };
      gGroupRef.current.add(g);
      moveableRef.current.push(g);
      pondsRef.current.push(g);
    };
    placePond(6, 5, 4.5);

    // === PETALS ===
    const pm1 = new THREE.MeshStandardMaterial({ color: 0xffb7c5, roughness: 0.6, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const pm2 = new THREE.MeshStandardMaterial({ color: 0xffc8d6, roughness: 0.6, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    petalsRef.current = new THREE.Group();
    for (let i = 0; i < 60; i++) {
      const p2 = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.05), Math.random() > 0.5 ? pm1 : pm2);
      p2.position.set((Math.random() - 0.5) * 30, 3 + Math.random() * 8, (Math.random() - 0.5) * 30);
      p2.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      p2.userData = {
        fs: 0.005 + Math.random() * 0.008,
        ss: 0.5 + Math.random(),
        sa: 0.01 + Math.random() * 0.02,
        rs: { x: (Math.random() - 0.5) * 0.02, y: (Math.random() - 0.5) * 0.03, z: (Math.random() - 0.5) * 0.01 },
        ph: Math.random() * Math.PI * 2
      };
      petalsRef.current.add(p2);
    }
    gGroupRef.current.add(petalsRef.current);

    // === FIREFLIES ===
    const ffCount = 25;
    const ffGeo = new THREE.BufferGeometry();
    const ffPos = new Float32Array(ffCount * 3);
    for (let i = 0; i < ffCount; i++) {
      ffPos[i * 3] = (Math.random() - 0.5) * 30;
      ffPos[i * 3 + 1] = 0.5 + Math.random() * 4;
      ffPos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
    particlesRef.current = new THREE.Points(ffGeo, new THREE.PointsMaterial({
      color: 0xffdd88, size: 0.15, transparent: true, opacity: 0.4, sizeAttenuation: true
    }));
    gGroupRef.current.add(particlesRef.current);

    // === MIST ===
    for (let i = 0; i < 15; i++) {
      const s = 3 + Math.random() * 5;
      const mm = new THREE.MeshStandardMaterial({ color: 0xccccbb, transparent: true, opacity: 0.04, side: THREE.DoubleSide, depthWrite: false });
      const mist = new THREE.Mesh(new THREE.PlaneGeometry(s, s), mm);
      mist.position.set((Math.random() - 0.5) * 25, 0.3 + Math.random() * 0.5, (Math.random() - 0.5) * 25);
      mist.rotation.x = -Math.PI / 2;
      mist.rotation.z = Math.random() * Math.PI;
      mist.userData = { ds: 0.001 + Math.random() * 0.002, dp: Math.random() * Math.PI * 2 };
      gGroupRef.current.add(mist);
    }

    // === RAKE TOOL ===
    rakeMeshRef.current = new THREE.Group();
    const hm = new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.7, metalness: 0.05 });
    const tineMat = new THREE.MeshStandardMaterial({ color: 0x6a5a3a, roughness: 0.8, metalness: 0.05 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 3, 6), hm);
    handle.position.y = 1.8;
    handle.rotation.x = -0.3;
    rakeMeshRef.current.add(handle);
    const cross = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.05, 0.07), hm);
    cross.position.y = 0.15;
    rakeMeshRef.current.add(cross);
    for (let t = 0; t < 9; t++) {
      const off = (t - 4) * 0.4;
      const tine = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.008, 0.2, 4), tineMat);
      tine.position.set(off, 0.03, 0);
      rakeMeshRef.current.add(tine);
    }
    rakeMeshRef.current.visible = false;
    rakeMeshRef.current.castShadow = true;
    sceneRef.current.add(rakeMeshRef.current);

    // === ANIMATION LOOP ===
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const dt = clockRef.current.getDelta();
      tmRef.current += dt;
      const tm = tmRef.current;

      // TOD transition
      updateTODLerp(dt);

      // Camera drift
      if (!orbitingRef.current) camRef.current.tT += 0.0002;
      camRef.current.cT += (camRef.current.tT - camRef.current.cT) * 0.03;
      camRef.current.cP += (camRef.current.tP - camRef.current.cP) * 0.03;
      camRef.current.cR += (camRef.current.tR - camRef.current.cR) * 0.03;
      updateCamera();

      // Bamboo sway
      if (bamGroupRef.current) {
        bamGroupRef.current.children.forEach(s => {
          if (s.userData.swayPhase !== undefined) {
            s.rotation.x = s.userData.baseRX + Math.sin(tm * 0.8 + s.userData.swayPhase) * s.userData.swayAmt;
            s.rotation.z = s.userData.baseRZ + Math.cos(tm * 0.6 + s.userData.swayPhase * 1.3) * s.userData.swayAmt * 0.7;
          }
        });
      }

      // Petals
      if (petalsRef.current) {
        petalsRef.current.children.forEach(p => {
          const d = p.userData;
          p.position.y -= d.fs;
          p.position.x += Math.sin(tm * d.ss + d.ph) * d.sa;
          p.position.z += Math.cos(tm * d.ss * 0.7 + d.ph) * d.sa * 0.5;
          p.rotation.x += d.rs.x;
          p.rotation.y += d.rs.y;
          if (p.position.y < 0.05) {
            p.position.y = 5 + Math.random() * 6;
            p.position.x = (Math.random() - 0.5) * 30;
            p.position.z = (Math.random() - 0.5) * 30;
          }
        });
      }

      // Fireflies
      if (particlesRef.current) {
        const pos = particlesRef.current.geometry.attributes.position.array;
        for (let i = 0; i < pos.length / 3; i++) {
          pos[i * 3] += Math.sin(tm * 0.3 + i * 1.7) * 0.003;
          pos[i * 3 + 1] += Math.sin(tm * 0.5 + i * 2.3) * 0.002;
          pos[i * 3 + 2] += Math.cos(tm * 0.4 + i * 1.1) * 0.003;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
        const ffBase = todCurrentRef.current.firefly || 0.15;
        particlesRef.current.material.opacity = ffBase + Math.sin(tm * 0.8) * ffBase * 0.5;
      }

      // Water basin
      if (waterGrpRef.current) {
        waterGrpRef.current.children.forEach(c => {
          if (c.userData.dripPhase !== undefined) {
            const ph = (tm * 0.5 + c.userData.dripPhase) % (Math.PI * 2);
            if (ph < Math.PI) {
              c.visible = true;
              const t2 = ph / Math.PI;
              c.position.y = 1.2 - t2 * 0.5;
              c.scale.setScalar(1 - t2 * 0.5);
            } else {
              c.visible = false;
            }
          }
          if (c.userData.isWater) {
            c.rotation.y = tm * 0.1;
            c.material.opacity = 0.6 + Math.sin(tm * 1.5) * 0.08;
          }
        });
      }

      // Lantern
      if (lanternLightRef.current) {
        const lBase = todCurrentRef.current.lantern || 0.5;
        lanternLightRef.current.intensity = lBase + Math.sin(tm * 3) * 0.05 * lBase + Math.sin(tm * 7.3) * 0.03 * lBase;
      }

      // Ponds
      pondsRef.current.forEach(pg => {
        const pd = pg.userData.pond;
        if (!pd) return;
        pd.waterMat.opacity = 0.83 + Math.sin(tm * 0.5 + pd.phase) * 0.04;
        if (pd.ripples) {
          pd.ripples.forEach(rp => {
            const cycle = (tm * 0.12 + pd.phase + rp.offset) % 1;
            const scale = 0.2 + cycle * pd.radius * 1.8;
            rp.mesh.scale.set(scale, scale, 1);
            rp.mat.opacity = 0.18 * (1 - cycle);
          });
        }
        if (pd.koi) {
          pd.koi.forEach(k => {
            k.angle += k.speed * k.dir * 0.016;
            const wobble = Math.sin(tm * 2 + k.wobble) * 0.1;
            const r = k.swimR + Math.sin(tm * 0.3 + k.wobble) * k.swimR * 0.2;
            const clampR = Math.min(r, pd.radius * 0.8);
            k.mesh.position.x = Math.cos(k.angle) * clampR;
            k.mesh.position.z = Math.sin(k.angle) * clampR;
            k.mesh.rotation.y = k.angle + (k.dir > 0 ? -Math.PI / 2 : Math.PI / 2) + wobble;
            k.tail.rotation.y = Math.sin(tm * 6 + k.wobble) * 0.4;
          });
        }
      });

      // Mist
      gGroupRef.current.children.forEach(c => {
        if (c.userData.ds) {
          c.position.x += Math.sin(tm * 0.2 + c.userData.dp) * c.userData.ds;
          c.position.z += Math.cos(tm * 0.15 + c.userData.dp) * c.userData.ds * 0.5;
          if (c.material) c.material.opacity = 0.02 + Math.sin(tm * 0.3 + c.userData.dp) * 0.02;
        }
      });

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [initHM, applyHM, applyTOD, updateTODLerp]);

  // === CONTROLS ===
  useEffect(() => {
    if (!containerRef.current || !rendererRef.current) return;
    const cv = rendererRef.current.domElement;

    const getHit = (cx, cy) => {
      mVecRef.current.x = (cx / window.innerWidth) * 2 - 1;
      mVecRef.current.y = -(cy / window.innerHeight) * 2 + 1;
      rayRef.current.setFromCamera(mVecRef.current, cameraRef.current);
      const hits = rayRef.current.intersectObject(sandMeshRef.current);
      return hits.length > 0 ? { x: hits[0].point.x, z: hits[0].point.z } : null;
    };

    const getMoveableHit = (cx, cy) => {
      mVecRef.current.x = (cx / window.innerWidth) * 2 - 1;
      mVecRef.current.y = -(cy / window.innerHeight) * 2 + 1;
      rayRef.current.setFromCamera(mVecRef.current, cameraRef.current);
      const hits = rayRef.current.intersectObjects(moveableRef.current, true);
      if (hits.length === 0) return null;
      let obj = hits[0].object;
      while (obj.parent && !moveableRef.current.includes(obj)) obj = obj.parent;
      return moveableRef.current.includes(obj) ? obj : null;
    };

    const handleDown = (cx, cy) => {
      if (curToolRef.current === 'view') {
        orbitingRef.current = true;
        orbStartRef.current = { x: cx, y: cy };
        cv.style.cursor = 'grabbing';
        return;
      }
      if (curToolRef.current === 'rake') {
        const obj = getMoveableHit(cx, cy);
        if (obj) {
          dragStoneRef.current = obj;
          rakeMeshRef.current.visible = false;
          cv.style.cursor = 'grabbing';
          haptic.medium(); // Feedback when picking up object
          return;
        }
        isIntRef.current = true;
        cv.style.cursor = 'none';
        const h = getHit(cx, cy);
        if (!h) return;
        lastHitRef.current = h;
        rakeSndOn();
        haptic.light(); // Feedback when starting to rake
      }
    };

    const handleMove = (cx, cy) => {
      if (curToolRef.current === 'view' && orbitingRef.current) {
        const dx = cx - orbStartRef.current.x;
        const dy = cy - orbStartRef.current.y;
        camRef.current.tT += dx * 0.005;
        camRef.current.tP = Math.max(0.15, Math.min(1.4, camRef.current.tP + dy * 0.003));
        orbStartRef.current = { x: cx, y: cy };
        return;
      }
      if (curToolRef.current === 'rake') {
        if (dragStoneRef.current) {
          const h = getHit(cx, cy);
          if (h) {
            const wp = new THREE.Vector3(
              Math.max(-19, Math.min(19, h.x)),
              dragStoneRef.current.position.y,
              Math.max(-19, Math.min(19, h.z))
            );
            if (dragStoneRef.current.parent && dragStoneRef.current.parent !== sceneRef.current && dragStoneRef.current.parent !== gGroupRef.current) {
              dragStoneRef.current.parent.worldToLocal(wp);
            }
            dragStoneRef.current.position.x = wp.x;
            dragStoneRef.current.position.z = wp.z;
          }
          return;
        }
        const h = getHit(cx, cy);
        if (h && isIntRef.current) {
          rakeMeshRef.current.visible = true;
          rakeMeshRef.current.position.set(h.x, 0.15, h.z);
          if (lastHitRef.current) {
            const a = Math.atan2(h.x - lastHitRef.current.x, h.z - lastHitRef.current.z);
            rakeMeshRef.current.rotation.y = a;
            // Throttled haptic feedback while raking (every 80ms)
            const now = Date.now();
            if (now - lastRakeHapticRef.current > 80) {
              haptic.light();
              lastRakeHapticRef.current = now;
            }
          }
          rakeAt(h.x, h.z, lastHitRef.current?.x, lastHitRef.current?.z);
          lastHitRef.current = h;
        }
      }
    };

    const handleUp = () => {
      if (dragStoneRef.current) dragStoneRef.current = null;
      orbitingRef.current = false;
      isIntRef.current = false;
      lastHitRef.current = null;
      rakeSndOff();
      if (rakeMeshRef.current) rakeMeshRef.current.visible = false;
      cv.style.cursor = 'default';
    };

    // Mouse
    const onMouseDown = (e) => handleDown(e.clientX, e.clientY);
    const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleUp();
    const onMouseLeave = () => { handleUp(); if (rakeMeshRef.current) rakeMeshRef.current.visible = false; };
    const onWheel = (e) => {
      e.preventDefault();
      camRef.current.tR = Math.max(12, Math.min(75, camRef.current.tR + e.deltaY * 0.02));
    };

    cv.addEventListener('mousedown', onMouseDown);
    cv.addEventListener('mousemove', onMouseMove);
    cv.addEventListener('mouseup', onMouseUp);
    cv.addEventListener('mouseleave', onMouseLeave);
    cv.addEventListener('wheel', onWheel, { passive: false });

    // Touch
    let lTouch = null;
    let lTDist = 0;

    const onTouchStart = (e) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        lTDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        return;
      }
      const t = e.touches[0];
      lTouch = { x: t.clientX, y: t.clientY };
      handleDown(t.clientX, t.clientY);
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        camRef.current.tR = Math.max(12, Math.min(75, camRef.current.tR - (d - lTDist) * 0.05));
        lTDist = d;
        return;
      }
      const t = e.touches[0];
      handleMove(t.clientX, t.clientY);
      lTouch = { x: t.clientX, y: t.clientY };
    };

    const onTouchEnd = () => {
      handleUp();
      lTouch = null;
    };

    cv.addEventListener('touchstart', onTouchStart, { passive: false });
    cv.addEventListener('touchmove', onTouchMove, { passive: false });
    cv.addEventListener('touchend', onTouchEnd);

    return () => {
      cv.removeEventListener('mousedown', onMouseDown);
      cv.removeEventListener('mousemove', onMouseMove);
      cv.removeEventListener('mouseup', onMouseUp);
      cv.removeEventListener('mouseleave', onMouseLeave);
      cv.removeEventListener('wheel', onWheel);
      cv.removeEventListener('touchstart', onTouchStart);
      cv.removeEventListener('touchmove', onTouchMove);
      cv.removeEventListener('touchend', onTouchEnd);
    };
  }, [rakeAt, rakeSndOn, rakeSndOff]);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0a08' }}>
      {/* Canvas container */}
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Letterbox */}
      <div style={{ position: 'fixed', left: 0, right: 0, height: '5vh', background: '#0a0a08', zIndex: 20, pointerEvents: 'none', top: 0 }} />
      <div style={{ position: 'fixed', left: 0, right: 0, height: '5vh', background: '#0a0a08', zIndex: 20, pointerEvents: 'none', bottom: 0 }} />

      {/* Vignette */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,10,8,0.65) 100%)',
        pointerEvents: 'none', zIndex: 11
      }} />

      {/* Mode hint */}
      <div style={{
        position: 'fixed', top: '7vh', left: '50%', transform: 'translateX(-50%)',
        color: hint ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0)',
        fontSize: '12px', letterSpacing: '0.25em', zIndex: 15, pointerEvents: 'none',
        transition: 'color 0.5s ease', textTransform: 'uppercase',
        fontFamily: '"Jost", sans-serif'
      }}>{hint}</div>

      {/* Toolbar */}
      <div style={{
        position: 'fixed', bottom: '7vh', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: '10px', zIndex: 30
      }}>
        <button
          onClick={() => { setCurTool('view'); haptic.selection(); }}
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            border: curTool === 'view' ? '1px solid rgba(255, 255, 255, 0.7)' : '1px solid rgba(255, 255, 255, 0.2)',
            background: curTool === 'view' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(20, 18, 14, 0.7)',
            backdropFilter: 'blur(10px)',
            color: curTool === 'view' ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.8)',
            fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          title="View"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <button
          onClick={() => { setCurTool('rake'); haptic.selection(); }}
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            border: curTool === 'rake' ? '1px solid rgba(255, 255, 255, 0.7)' : '1px solid rgba(255, 255, 255, 0.2)',
            background: curTool === 'rake' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(20, 18, 14, 0.7)',
            backdropFilter: 'blur(10px)',
            color: curTool === 'rake' ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.8)',
            fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          title="Rake"
        >≋</button>
        <button
          onClick={cycleTOD}
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(20, 18, 14, 0.7)',
            backdropFilter: 'blur(10px)',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          title="Time of day"
        >◑</button>
        <button
          onClick={resetGarden}
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(20, 18, 14, 0.7)',
            backdropFilter: 'blur(10px)',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          title="Reset"
        >↺</button>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
