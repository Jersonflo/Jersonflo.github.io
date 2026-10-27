import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { music, sfx } from './audio.js?v=5';

const gsap = window.gsap;
const $ = (s) => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const T = (s) => (reduced ? 0.001 : s);
const V3 = THREE.Vector3;
gsap.ticker.lagSmoothing(0); // keep animations on real time even if frames drop

// textures with text are drawn on canvases, so the webfonts must be ready first
gsap.to('#loadBar', { scaleX: 0.6, duration: 0.8, ease: 'power2.out' });
await Promise.race([
  Promise.all([
    document.fonts.load('700 40px "Inter Tight"'), document.fonts.load('800 40px "Inter Tight"'),
    document.fonts.load('500 20px "JetBrains Mono"'), document.fonts.load('700 20px "JetBrains Mono"'),
    document.fonts.load('600 40px "Caveat"'), document.fonts.load('800 40px "Fraunces"'),
  ]).catch(() => {}),
  new Promise((r) => setTimeout(r, 3000)),
]);

/* =========================================================
   Content
   ========================================================= */
const PROJECTS = [
  {
    id: 'manizales', title: 'Manizales Pixel', kicker: 'Gemelo digital del clima con machine learning',
    color: '#2dd4bf', strip: 'DEMO EN VIVO', stamps: [['Demo en vivo', 'live']],
    media: { type: 'video', src: 'assets/video/manizales.mp4', poster: 'assets/video/manizales-poster.jpg' },
    desc: 'Mapa en pixel art de las 12 comunas de Manizales con clima en vivo y pronóstico a 72 horas. Entrené un modelo con dos años de datos del IDEAM que aprende cómo se equivoca el pronóstico global en la ciudad y lo corrige. El mapa amanece, anochece y llueve según el clima real.',
    stat: ['19,6 %', 'menos error en el pronóstico de temperatura'],
    chips: ['Python', 'scikit-learn', 'Godot 4', 'OpenStreetMap'],
    links: [['Abrir demo ↗', 'https://jersonflo.github.io/Manizales-Digital-Twin-Prototype-/'], ['Código ↗', 'https://github.com/Jersonflo/Manizales-Digital-Twin-Prototype-']],
  },
  {
    id: 'safecheck', title: 'SafeCHECK', kicker: 'Detección de casco de seguridad en tiempo real',
    color: '#f59e0b', strip: 'VISIÓN ARTIFICIAL', stamps: [['Visión por computador', 'info']],
    media: { type: 'video', src: 'assets/video/safecheck.mp4', poster: 'assets/video/safecheck-poster.jpg' },
    desc: 'Aplicación de escritorio que vigila varias cámaras a la vez y marca en rojo a quien trabaja sin casco. Separé la captura y la detección en hilos distintos para que el video siga fluido aunque el equipo no tenga GPU.',
    stat: ['29 fps', 'en un portátil sin GPU (antes ~4)'],
    chips: ['YOLOv8', 'PyQt6', 'OpenCV', 'Python'],
    links: [['Código ↗', 'https://github.com/Jersonflo/SafeCHECK']],
  },
  {
    id: 'exp', title: 'EXP', kicker: 'Ecosistema cultural y turístico',
    color: '#22c55e', strip: 'EN PRODUCCIÓN', stamps: [['En producción', 'live'], ['Código privado', 'lock']],
    media: { type: 'video', src: 'assets/video/exp.mp4', poster: 'assets/video/exp-poster.jpg', sound: true },
    desc: 'Plataforma de turismo cultural y experiencial: experiencias reservables, hotelería con calendario propio, cursos, comercio con tiendas, anuncios de eventos y un programa de afiliados que paga por cada cliente referido. Pagos en línea, roles y panel de administración.',
    chips: ['Next.js 16', 'React 19', 'Supabase', 'Tailwind', 'Vercel'],
    links: [['ecosistemaexp.com ↗', 'https://www.ecosistemaexp.com']],
    note: 'Proyecto para un cliente. El código es privado; se muestra con su autorización.',
  },
  {
    id: 'iacamera', title: 'IACamera', kicker: 'Robot que sigue rostros, con asistente de voz',
    color: '#818cf8', strip: 'HARDWARE + IA', stamps: [['Hardware + IA', 'info']],
    media: { type: 'img', src: 'assets/img/iacamera.jpg', alt: 'Interfaz web de IACamera con controles, configuración y estadísticas' },
    desc: 'Robot con visión por computador que detecta y sigue rostros moviendo servomotores con un ESP32. Tiene interfaz de telemetría en tiempo real y a "Nova", un asistente que escucha, piensa con un LLM y responde con voz. Diseño mecánico en Fusion 360 y piezas impresas en 3D.',
    chips: ['MediaPipe', 'OpenCV', 'ESP32', 'LLMs', 'Fusion 360'],
    links: [['Interfaz web ↗', 'https://iacamera.vercel.app'], ['Código ↗', 'https://github.com/Jersonflo/iacamera']],
    note: 'La interfaz web necesita el robot conectado por USB (ESP32 y servos). El repositorio trae el firmware y las instrucciones para armarlo.',
  },
  {
    id: 'practiun', title: 'PractiUN', kicker: 'Gestión de prácticas académicas · Universidad Nacional',
    color: '#eab308', strip: 'EN DESARROLLO', stamps: [['En desarrollo', 'dev'], ['Código privado', 'lock']],
    media: { type: 'img', src: 'assets/img/practiun.jpg', alt: 'Vista del estudiante en PractiUN con su práctica, informes y progreso' },
    desc: 'Plataforma para las prácticas comunitarias y empresariales de la Universidad Nacional: plan de trabajo, informes de avance e informe final, revisión del profesor asesor, firma del jefe inmediato y seguimiento de la Coordinación de prácticas.',
    chips: ['Next.js', 'Prisma', 'PostgreSQL'],
    links: [['Ver demo ↗', 'https://practiun.vercel.app']],
  },
  {
    id: 'optibot', title: 'OptiBot', kicker: 'Agente de IA para inventario y préstamos',
    color: '#38bdf8', strip: 'AGENTE DE IA', stamps: [['Agente de IA', 'info']],
    media: { type: 'chat' },
    desc: 'Agente que responde en lenguaje natural sobre inventario, préstamos y mantenimientos del FabLab de la Universidad Nacional. Consulta la base de datos en tiempo real con Function Calling y, si no hay registros, lo dice en vez de inventar.',
    chips: ['Node.js', 'Express', 'Supabase', 'Function Calling', 'Vercel'],
    links: [['Código ↗', 'https://github.com/Jersonflo/optistock']],
  },
  {
    id: 'catedral', title: 'Catedral de Manizales 3D', kicker: 'Maqueta interactiva generada por código',
    color: '#fb7185', strip: 'DEMO EN VIVO', stamps: [['Demo en vivo', 'live']],
    media: { type: 'img', src: 'assets/img/catedral.jpg', alt: 'Maqueta 3D de la Catedral de Manizales con la torre inclinada' },
    desc: 'Recreación de la Catedral Basílica de Manizales y su torre inclinada, hecha con Three.js y geometría procedural. Se puede orbitar, comparar el antes y el después, y revivir el sismo.',
    chips: ['Three.js', 'WebGL', 'JavaScript'],
    links: [['Abrir demo ↗', 'https://jersonflo.github.io/catedral-manizales-3d/'], ['Código ↗', 'https://github.com/Jersonflo/catedral-manizales-3d']],
  },
];
const REEL = [0, 1, 2]; // projects with video that loop on the tablet

/* =========================================================
   Renderer, scene, camera
   ========================================================= */
const canvas = $('#scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  document.body.insertAdjacentHTML('beforeend', '<p class="nogl">Tu navegador no tiene WebGL activado, que es lo que mueve este portafolio 3D. Prueba con Chrome, Edge o Firefox actualizados.</p>');
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const maxAniso = renderer.capabilities.getMaxAnisotropy();

const scene = new THREE.Scene();
// the backdrop is CSS behind a transparent canvas; the fog starts as the grey haze
scene.fog = new THREE.Fog(0x6d6d6d, 14, 75);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 60);

/* =========================================================
   Procedural textures
   ========================================================= */
function makeNoise(seed = 7) {
  const p = new Uint8Array(512);
  for (let i = 0; i < 256; i++) p[i] = i;
  let s = seed;
  for (let i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 256; i++) p[i + 256] = p[i];
  const f = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const X = Math.floor(x), Y = Math.floor(y), xi = X & 255, yi = Y & 255, u = f(x - X), v = f(y - Y);
    const a = p[p[xi] + yi], b = p[p[xi + 1] + yi], c = p[p[xi] + yi + 1], d = p[p[xi + 1] + yi + 1];
    return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) / 255;
  };
}
const noise = makeNoise();

function canvasTex(w, h, draw, { srgb = true, repeat } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = maxAniso;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
function speckle(g, w, h, n, colors, rMax = 1.6) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = colors[(Math.random() * colors.length) | 0];
    g.beginPath();
    g.arc(Math.random() * w, Math.random() * h, Math.random() * rMax + 0.3, 0, 7);
    g.fill();
  }
}
function letterSpaced(g, text, x, y, spacing, align = 'left') {
  const chars = [...text];
  const total = chars.reduce((s, ch) => s + g.measureText(ch).width + spacing, -spacing);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  const prev = g.textAlign; g.textAlign = 'left';
  for (const ch of chars) { g.fillText(ch, cx, y); cx += g.measureText(ch).width + spacing; }
  g.textAlign = prev;
}

const leatherMap = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#6e3c21'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) {
    const x0 = Math.random() * w, y0 = Math.random() * h, r = 40 + Math.random() * 120;
    const dark = Math.random() > 0.5;
    // drawn on all 9 neighbouring tiles so the texture wraps without seams
    for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) {
      const x = x0 + ox, y = y0 + oy;
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, dark ? 'rgba(40,16,6,.1)' : 'rgba(170,100,55,.07)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }
  speckle(g, w, h, 5000, ['rgba(45,20,8,.35)', 'rgba(150,90,50,.25)'], 1.2);
}, { repeat: [0.32, 0.32] });
const leatherBump = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) {
    const v = (100 + Math.random() * 70) | 0;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.beginPath();
    const r = Math.random() * 2.2 + 0.5;
    g.ellipse(Math.random() * w, Math.random() * h, r, r * (0.5 + Math.random() * 0.6), Math.random() * 3, 0, 7);
    g.fill();
  }
  g.strokeStyle = 'rgba(70,70,70,.5)';
  for (let i = 0; i < 70; i++) {
    g.lineWidth = Math.random() * 1.3 + 0.2;
    g.beginPath();
    let x = Math.random() * w, y = Math.random() * h;
    g.moveTo(x, y);
    for (let k = 0; k < 6; k++) { x += (Math.random() - 0.5) * 50; y += (Math.random() - 0.5) * 50; g.lineTo(x, y); }
    g.stroke();
  }
}, { srgb: false, repeat: [0.9, 0.9] });


/* =========================================================
   Materials
   ========================================================= */
const MAT = {
  leather: new THREE.MeshStandardMaterial({ color: '#ffffff', map: leatherMap, bumpMap: leatherBump, bumpScale: 1.2, roughness: 0.5, envMapIntensity: 0.55 }),
  leatherDark: new THREE.MeshStandardMaterial({ color: '#8a6a58', map: leatherMap, bumpMap: leatherBump, bumpScale: 1, roughness: 0.45, envMapIntensity: 0.5 }),
  brass: new THREE.MeshStandardMaterial({ color: '#d8b26a', metalness: 1, roughness: 0.26, envMapIntensity: 1.3 }),
  velvet: new THREE.MeshPhysicalMaterial({ color: '#072c29', roughness: 0.95, sheen: 0.8, sheenColor: new THREE.Color('#1fa898'), sheenRoughness: 0.5, envMapIntensity: 0.25 }),
  manila: new THREE.MeshStandardMaterial({ color: '#c39d5c', roughness: 0.9, envMapIntensity: 0.4 }),
  paperEdge: new THREE.MeshStandardMaterial({ color: '#e9e1d0', roughness: 0.9, envMapIntensity: 0.4 }),
  black: new THREE.MeshPhysicalMaterial({ color: '#0b0c0e', roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15, envMapIntensity: 0.8 }),
  ceramic: new THREE.MeshPhysicalMaterial({ color: '#efe8dd', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.7 }),
};
function paperMat(map, rough = 0.85) {
  return new THREE.MeshStandardMaterial({ map, roughness: rough, envMapIntensity: 0.4 });
}

/* =========================================================
   Geometry helpers
   ========================================================= */
function rrPath(P, w, d, r) {
  const x = -w / 2, y = -d / 2;
  P.moveTo(x + r, y);
  P.lineTo(x + w - r, y); P.quadraticCurveTo(x + w, y, x + w, y + r);
  P.lineTo(x + w, y + d - r); P.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  P.lineTo(x + r, y + d); P.quadraticCurveTo(x, y + d, x, y + d - r);
  P.lineTo(x, y + r); P.quadraticCurveTo(x, y, x + r, y);
  return P;
}
function extrude(shape, h, bevel) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(h - 2 * bevel, 0.001), bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 14,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, bevel, 0);
  return g;
}
const slab = (w, d, r, h, bevel = 0.012) => extrude(rrPath(new THREE.Shape(), w, d, r), h, bevel);
function ring(w, d, r, t, h, bevel = 0.012) {
  const s = rrPath(new THREE.Shape(), w, d, r);
  s.holes.push(rrPath(new THREE.Path(), w - 2 * t, d - 2 * t, Math.max(r - t, 0.03)));
  return extrude(s, h, bevel);
}
function mesh(geo, mat, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast; m.receiveShadow = receive;
  return m;
}
// a flat textured face: on the floor of the case it faces +y, on the lid it faces -y
function face(w, d, map, dir = 1, rough = 0.85) {
  const g = new THREE.PlaneGeometry(w, d);
  g.rotateX(dir > 0 ? -Math.PI / 2 : Math.PI / 2);
  return mesh(g, paperMat(map, rough), { cast: false });
}

/* =========================================================
   Lights & atmosphere: a dark void, one lamp, a backlight
   ========================================================= */
const FLOOR_Y = -11.4;          // the case sits at lower-chest height, forearms level beneath it
const PERSON_Z = -3.8;           // a step back so the case is held well clear of the body
const WALK_START = -40;

// invisible floor that only shows shadows
const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 0.35 }));
floor.position.y = FLOOR_Y;
floor.receiveShadow = true;
scene.add(floor);

const lamp = new THREE.SpotLight(0xffd9a8, 0, 0, 0.38, 0.85, 1.6);
lamp.position.set(0.6, 12.5, 3.0);
lamp.target.position.set(0, 0, -0.4);
lamp.castShadow = true;
lamp.shadow.mapSize.set(2048, 2048);
lamp.shadow.bias = -0.0003;
lamp.shadow.normalBias = 0.02;
lamp.shadow.camera.near = 4;
lamp.shadow.camera.far = 30;
scene.add(lamp, lamp.target);
const LAMP_ON = 300;

const hemi = new THREE.HemisphereLight(0xdfe4ea, 0x0b0b0c, 0.3);
// backlight: in the intro it turns the walking figure into a silhouette and throws its shadow forward
const rim = new THREE.DirectionalLight(0xffffff, 2.4);
rim.position.set(-3, 14, -60);
rim.target.position.set(0, FLOOR_Y, PERSON_Z);
rim.castShadow = true;
rim.shadow.mapSize.set(2048, 2048);
Object.assign(rim.shadow.camera, { left: -14, right: 14, top: 40, bottom: -40, near: 1, far: 120 });
rim.shadow.bias = -0.0005;
scene.add(rim, rim.target);

function setEnv(k) {
  scene.traverse((o) => {
    if (!o.material) return;
    for (const m of [].concat(o.material)) {
      if (m.userData.env === undefined) m.userData.env = m.envMapIntensity ?? 1;
      m.envMapIntensity = m.userData.env * k;
    }
  });
}

// dust floating in the lamp beam
const DUST = 260;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(DUST * 3), dustVel = new Float32Array(DUST * 3);
for (let i = 0; i < DUST; i++) {
  dustPos[i * 3] = (Math.random() - 0.5) * 9;
  dustPos[i * 3 + 1] = Math.random() * 9 - 2;
  dustPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
  dustVel[i * 3] = (Math.random() - 0.5) * 0.002;
  dustVel[i * 3 + 1] = (Math.random() - 0.3) * 0.0015;
  dustVel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dustMat = new THREE.PointsMaterial({
  size: 0.03, color: 0xffe2b5, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
  map: canvasTex(64, 64, (g) => {
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  }),
});
scene.add(new THREE.Points(dustGeo, dustMat));


/* =========================================================
   The briefcase
   ========================================================= */
const W = 4.4, D = 3.2, BH = 0.62, LH = 0.42, WT = 0.07, R = 0.24, FT = 0.06;
const FLOOR = FT + 0.012;                // top of the velvet floor
const CEIL = LH - FT - 0.012;            // underside of the velvet lid lining

const caseG = new THREE.Group();
scene.add(caseG);

// base shell
caseG.add(mesh(slab(W, D, R, FT), MAT.leather));
caseG.add(mesh(ring(W, D, R, WT, BH), MAT.leather));
const baseTrim = mesh(ring(W + 0.014, D + 0.014, R + 0.007, WT + 0.02, 0.045, 0.008), MAT.brass);
baseTrim.position.y = BH - 0.03;
caseG.add(baseTrim);
const baseLining = mesh(slab(W - 2 * WT - 0.01, D - 2 * WT - 0.01, R - WT, 0.012, 0.004), MAT.velvet, { cast: false });
baseLining.position.y = FT;
caseG.add(baseLining);
const baseLiningWall = mesh(ring(W - 2 * WT, D - 2 * WT, R - WT, 0.014, BH - FT - 0.05, 0.004), MAT.velvet, { cast: false });
baseLiningWall.position.y = FT;
caseG.add(baseLiningWall);

// lid: pivot on the back edge, shell centred inside it
const lidPivot = new THREE.Group();
lidPivot.position.set(0, BH, -D / 2);
caseG.add(lidPivot);
const lid = new THREE.Group();
lid.position.z = D / 2;
lidPivot.add(lid);
const lidTop = mesh(slab(W, D, R, FT), MAT.leather);
lidTop.position.y = LH - FT;
lid.add(lidTop);
lid.add(mesh(ring(W, D, R, WT, LH), MAT.leather));
const lidTrim = mesh(ring(W + 0.014, D + 0.014, R + 0.007, WT + 0.02, 0.045, 0.008), MAT.brass);
lidTrim.position.y = -0.015;
lid.add(lidTrim);
const lidLining = mesh(slab(W - 2 * WT - 0.01, D - 2 * WT - 0.01, R - WT, 0.012, 0.004), MAT.velvet, { cast: false });
lidLining.position.y = LH - FT - 0.012;
lid.add(lidLining);
const lidLiningWall = mesh(ring(W - 2 * WT, D - 2 * WT, R - WT, 0.014, LH - FT - 0.045, 0.004), MAT.velvet, { cast: false });
lidLiningWall.position.y = 0.03;
lid.add(lidLiningWall);

// saddle stitching around the lid top
{
  const pts = rrPath(new THREE.Shape(), W - 0.26, D - 0.26, R - 0.12).getPoints(40).map((p) => new V3(p.x, LH + 0.004, -p.y));
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const line = new THREE.Line(geo, new THREE.LineDashedMaterial({ color: 0xd9b48a, dashSize: 0.045, gapSize: 0.035, transparent: true, opacity: 0.75 }));
  line.computeLineDistances();
  lid.add(line);
}

// engraved brass nameplate on the lid
const plateTex = canvasTex(1024, 220, (g, w, h) => {
  const grd = g.createLinearGradient(0, 0, w, h);
  grd.addColorStop(0, '#a77d3b'); grd.addColorStop(0.45, '#ead08f'); grd.addColorStop(0.55, '#d8b46a'); grd.addColorStop(1, '#9c7232');
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  g.globalAlpha = 0.18;
  for (let x = 0; x < w; x += 2) { g.fillStyle = Math.random() > 0.5 ? '#fff' : '#5a3d12'; g.fillRect(x, 0, 1, h); }
  g.globalAlpha = 1;
  g.font = '700 74px "JetBrains Mono"';
  g.textBaseline = 'middle';
  g.fillStyle = 'rgba(255,240,200,.55)'; letterSpaced(g, 'JERSON GIRALDO', w / 2 + 2, h / 2 + 3, 14, 'center');
  g.fillStyle = '#4a3010'; letterSpaced(g, 'JERSON GIRALDO', w / 2, h / 2, 14, 'center');
});
{
  const plate = mesh(new RoundedBoxGeometry(1.3, 0.025, 0.28, 2, 0.01), MAT.brass);
  plate.position.set(0, LH + 0.012, D / 2 - 0.55);
  lid.add(plate);
  const engraved = mesh(new THREE.PlaneGeometry(1.24, 0.24).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: plateTex, metalness: 0.85, roughness: 0.32, envMapIntensity: 1.2 }), { cast: false });
  engraved.position.set(0, LH + 0.0255, D / 2 - 0.55);
  lid.add(engraved);
}

// latches: plate on the base, a flap that pops out, a catch on the lid
const flaps = [];
for (const sx of [-1, 1]) {
  const latch = new THREE.Group();
  latch.position.set(sx * 1.32, BH, D / 2 + 0.012);
  caseG.add(latch);
  const plate = mesh(new RoundedBoxGeometry(0.44, 0.22, 0.04, 2, 0.012), MAT.brass);
  plate.position.set(0, -0.15, 0.01);
  latch.add(plate);
  const flapPivot = new THREE.Group();
  flapPivot.position.set(0, -0.23, 0.04);
  latch.add(flapPivot);
  const flap = mesh(new RoundedBoxGeometry(0.34, 0.24, 0.035, 2, 0.012), MAT.brass);
  flap.position.y = 0.13;
  flapPivot.add(flap);
  const button = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 20).rotateX(Math.PI / 2), MAT.black);
  button.position.set(0, 0.1, 0.03);
  flapPivot.add(button);
  flaps.push(flapPivot);
  const catchM = mesh(new RoundedBoxGeometry(0.3, 0.09, 0.035, 2, 0.01), MAT.brass);
  catchM.position.set(sx * 1.32, 0.06, D + 0.03 - D / 2);
  lid.add(catchM);
}

// hinges
for (const sx of [-1, 1]) {
  const h = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 20).rotateZ(Math.PI / 2), MAT.brass);
  h.position.set(sx * 1.45, BH, -D / 2 - 0.035);
  caseG.add(h);
}

// handle: upright while carried, hanging once the case is held flat
const handleG = new THREE.Group();
{
  const handle = handleG;
  handle.position.set(0, BH - 0.12, D / 2 + 0.03);
  caseG.add(handle);
  const curve = new THREE.CatmullRomCurve3([new V3(-0.55, 0, 0), new V3(-0.5, 0, 0.2), new V3(-0.28, 0, 0.34), new V3(0.28, 0, 0.34), new V3(0.5, 0, 0.2), new V3(0.55, 0, 0)]);
  const strap = mesh(new THREE.TubeGeometry(curve, 48, 0.065, 14), MAT.leatherDark);
  strap.scale.set(1, 0.55, 1);
  handle.add(strap);
  for (const sx of [-1, 1]) {
    const b = mesh(new RoundedBoxGeometry(0.16, 0.12, 0.08, 2, 0.02), MAT.brass);
    b.position.set(sx * 0.55, 0, 0);
    handle.add(b);
  }
}

/* =========================================================
   Things inside the case
   ========================================================= */
const items = {};          // id -> { obj, home, pose(), dist, tip, normal }
const hitList = [];
function register(id, obj, cfg) {
  obj.traverse((o) => { if (o.isMesh) o.userData.hit = id; });
  items[id] = { id, obj, home: { p: obj.position.clone(), r: obj.rotation.clone() }, ...cfg };
  if (!hitList.includes(obj)) hitList.push(obj);
}
caseG.traverse((o) => { if (o.isMesh) o.userData.hit = 'case'; });
hitList.push(caseG);

// --- project folders, stacked like stairs so each label strip shows
const FW = 2.05, FD = 1.4, STEP = 0.19, FTH = 0.03;
const folders = [];
PROJECTS.forEach((p, i) => {
  const n = PROJECTS.length;
  const tex = canvasTex(1024, Math.round((1024 * FD) / FW), (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, '#d2b073'); grd.addColorStop(1, '#c39d5a');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 2600, ['rgba(120,80,30,.18)', 'rgba(255,240,200,.2)'], 1.3);
    g.strokeStyle = 'rgba(90,60,20,.25)'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12);
    // label strip at the front edge
    const sh = Math.round((STEP / FD) * h);
    g.fillStyle = 'rgba(255,248,230,.35)'; g.fillRect(0, h - sh, w, sh);
    g.fillStyle = 'rgba(90,60,20,.35)'; g.fillRect(0, h - sh, w, 2);
    g.fillStyle = p.color;
    g.beginPath(); g.roundRect(26, h - sh + 18, 78, sh - 36, 8); g.fill();
    g.fillStyle = '#10161d'; g.font = '700 32px "JetBrains Mono"'; g.textBaseline = 'middle';
    g.textAlign = 'center'; g.fillText(String(i + 1).padStart(2, '0'), 65, h - sh / 2 + 1);
    g.textAlign = 'left'; g.fillStyle = '#2a2016'; g.font = '700 46px "Inter Tight"';
    g.fillText(p.title, 128, h - sh / 2 + 1);
    g.textAlign = 'right'; g.fillStyle = '#6b5434'; g.font = '500 22px "JetBrains Mono"';
    letterSpaced(g, p.strip, w - 30, h - sh / 2 + 1, 3, 'right');
    if (i === 0) {
      // cover of the top folder
      g.save();
      g.translate(w / 2, (h - sh) / 2 + 10); g.rotate(-0.06);
      g.strokeStyle = 'rgba(150,40,30,.75)'; g.lineWidth = 7;
      g.strokeRect(-300, -86, 600, 172);
      g.fillStyle = 'rgba(150,40,30,.78)'; g.font = '800 104px "Fraunces"'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('PROYECTOS', 0, 4);
      g.restore();
      g.fillStyle = '#4a3a24'; g.font = '500 26px "JetBrains Mono"'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      letterSpaced(g, 'EXPEDIENTES', 40, 70, 5);
      g.textAlign = 'right'; letterSpaced(g, `${n} CARPETAS · 2024–2026`, w - 40, 70, 4, 'right');
      g.font = '600 52px "Caveat"'; g.textAlign = 'left'; g.fillStyle = '#3d2f1d';
      g.fillText('— J. Giraldo', 60, h - sh - 40);
    } else {
      // each other folder carries its own cover: what's inside and its status
      g.fillStyle = '#4a3a24'; g.font = '500 24px "JetBrains Mono"'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      letterSpaced(g, `EXPEDIENTE ${String(i + 1).padStart(2, '0')}`, 56, 92, 5);
      g.fillStyle = '#2a2016'; g.font = '800 88px "Fraunces"';
      g.fillText(p.title.length > 16 ? p.title.replace(' de Manizales', '') : p.title, 52, 220);
      g.fillStyle = '#5b4a33'; g.font = '500 34px "Inter Tight"';
      g.fillText(p.kicker.length > 52 ? p.kicker.slice(0, 50) + '…' : p.kicker, 56, 280);
      g.save();
      g.translate(w - 250, h - sh - 120); g.rotate(-0.08);
      const live = /VIVO|PRODUCCI/.test(p.strip);
      g.strokeStyle = live ? 'rgba(15,118,110,.8)' : 'rgba(150,40,30,.75)'; g.lineWidth = 5;
      g.font = '700 30px "JetBrains Mono"';
      const sw = g.measureText(p.strip).width + 60;
      g.strokeRect(-sw / 2, -34, sw, 68);
      g.fillStyle = g.strokeStyle; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(p.strip, 0, 2);
      g.restore();
    }
  });
  const folder = new THREE.Group();
  folder.add(mesh(new THREE.BoxGeometry(FW, FTH, FD), MAT.manila));
  const top = face(FW, FD, tex, 1, 0.9);
  top.position.y = FTH / 2 + 0.0008;
  folder.add(top);
  folder.position.set(-1.02, FLOOR + FTH / 2 + (n - 1 - i) * (FTH + 0.004), -0.83 + i * STEP);
  folder.rotation.y = (Math.random() - 0.5) * 0.02;
  caseG.add(folder);
  folders.push(folder);
  register(`f${i}`, folder, {
    tip: () => (state === 'stack' ? `Expediente ${String(i + 1).padStart(2, '0')} · ${p.title}` : `Proyectos · ${n} expedientes`),
    normal: new V3(0, 1, 0),
    dist: 5.4,
    pose: (o) => ({ p: new V3(-0.3, 1.0, 1.55), r: new THREE.Euler(0.62, 0, 0) }),
    hover: (o, on) => gsap.to(o.position, { z: items[`f${i}`].home.p.z + (on ? (state === 'stack' ? 0.16 : 0.08) : 0), duration: 0.4, ease: 'power3.out' }),
    click: () => (state === 'stack' ? openProject(i) : enterStack()),
  });
});

// --- tablet that loops the project videos
const reelVideo = document.createElement('video');
Object.assign(reelVideo, { muted: true, loop: false, playsInline: true, crossOrigin: 'anonymous', preload: 'auto' });
reelVideo.setAttribute('playsinline', '');
const reelTex = new THREE.VideoTexture(reelVideo);
reelTex.colorSpace = THREE.SRGBColorSpace;
const posterTex = new THREE.TextureLoader().load('assets/video/manizales-poster.jpg', (t) => { t.colorSpace = THREE.SRGBColorSpace; });
const screenMat = new THREE.MeshBasicMaterial({ map: posterTex, toneMapped: false });
const tablet = new THREE.Group();
{
  const body = mesh(new RoundedBoxGeometry(1.64, 0.055, 1.12, 3, 0.05), MAT.black);
  body.position.y = 0.0275;
  tablet.add(body);
  const screen = mesh(new THREE.PlaneGeometry(1.5, 0.844).rotateX(-Math.PI / 2), screenMat, { cast: false });
  screen.position.y = 0.0565;
  tablet.add(screen);
  const glare = mesh(new THREE.PlaneGeometry(1.5, 0.844).rotateX(-Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0x000000, transparent: true, opacity: 0.12, roughness: 0.05, clearcoat: 1, envMapIntensity: 1 }), { cast: false });
  glare.position.y = 0.058;
  tablet.add(glare);
}
tablet.position.set(1.22, FLOOR, -0.86);
tablet.rotation.y = 0.03;
caseG.add(tablet);
let reelIndex = 0;
function playReel(k) {
  reelIndex = k % REEL.length;
  reelVideo.src = PROJECTS[REEL[reelIndex]].media.src;
  reelVideo.play().then(() => { screenMat.map = reelTex; screenMat.needsUpdate = true; }).catch(() => {});
}
reelVideo.addEventListener('timeupdate', () => { if (reelVideo.currentTime > 11) playReel(reelIndex + 1); });
reelVideo.addEventListener('ended', () => playReel(reelIndex + 1));
register('tablet', tablet, {
  tip: 'Reel · clic para ver el proyecto',
  normal: new V3(0, 1, 0), dist: 2.6,
  pose: () => ({ p: new V3(1.22, 0.9, -0.2), r: new THREE.Euler(0.75, 0.03, 0) }),
  hover: (o, on) => gsap.to(o.position, { y: FLOOR + (on ? 0.06 : 0), duration: 0.4, ease: 'power3.out' }),
  click: () => openProject(REEL[reelIndex]),
});

// --- envelope with a wax seal: contact
const envTex = canvasTex(1024, 648, (g, w, h) => {
  g.fillStyle = '#efe4cd'; g.fillRect(0, 0, w, h);
  speckle(g, w, h, 2500, ['rgba(140,110,60,.15)', 'rgba(255,255,255,.3)'], 1.2);
  g.strokeStyle = 'rgba(120,90,50,.25)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(0, h); g.lineTo(w * 0.5, h * 0.52); g.lineTo(w, h); g.stroke();
  g.fillStyle = 'rgba(120,90,50,.08)';
  g.beginPath(); g.moveTo(0, 0); g.lineTo(w * 0.5, h * 0.56); g.lineTo(w, 0); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(100,70,40,.4)'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(w * 0.5, h * 0.56); g.lineTo(w, 0); g.stroke();
  g.fillStyle = '#2a241c'; g.font = '600 96px "Caveat"'; g.textBaseline = 'alphabetic';
  g.fillText('Contacto', 70, h - 80);
  g.fillStyle = '#6a5b45'; g.font = '600 44px "Caveat"';
  g.fillText('Para: quien tenga una idea', 74, h - 150);
  // postage stamp
  g.save(); g.translate(w - 170, h - 170); g.rotate(0.05);
  g.fillStyle = '#fff8ea'; g.fillRect(-4, -4, 128, 148);
  g.fillStyle = '#0f766e'; g.fillRect(8, 8, 104, 124);
  g.fillStyle = '#5eead4'; g.beginPath(); g.arc(60, 58, 22, 0, 7); g.fill();
  g.fillStyle = '#ecfeff'; g.font = '700 20px "JetBrains Mono"'; g.textAlign = 'center';
  g.fillText('COL', 60, 116);
  g.restore();
});
const envelope = new THREE.Group();
{
  envelope.add(mesh(new THREE.BoxGeometry(1.55, 0.014, 0.98), MAT.paperEdge));
  const top = face(1.55, 0.98, envTex, 1);
  top.position.y = 0.0075;
  envelope.add(top);
  const sealTop = canvasTex(256, 256, (g, w, h) => {
    const grd = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
    grd.addColorStop(0, '#16a394'); grd.addColorStop(1, '#0a4f49');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(200,255,245,.35)'; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, 92, 0, 7); g.stroke();
    g.fillStyle = 'rgba(210,255,248,.75)'; g.font = '800 96px "Fraunces"'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('JG', w / 2, h / 2 + 6);
  });
  const sealSide = new THREE.MeshPhysicalMaterial({ color: '#0d6b61', roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.2, envMapIntensity: 0.8 });
  const seal = mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.035, 40), sealSide);
  seal.position.set(0, 0.025, 0.06);
  envelope.add(seal);
  const sealFace = mesh(new THREE.CircleGeometry(0.148, 40).rotateX(-Math.PI / 2), new THREE.MeshPhysicalMaterial({ map: sealTop, roughness: 0.3, clearcoat: 1, envMapIntensity: 0.8 }), { cast: false });
  sealFace.position.set(0, 0.0435, 0.06);
  envelope.add(sealFace);
}
envelope.position.set(1.22, FLOOR + 0.007, 0.6);
envelope.rotation.y = -0.05;
caseG.add(envelope);
register('envelope', envelope, {
  tip: 'Contacto',
  normal: new V3(0, 1, 0), dist: 3.3,
  pose: () => ({ p: new V3(1.0, 1.0, 1.5), r: new THREE.Euler(0.7, 0, -0.04) }),
  hover: (o, on) => gsap.to(o.position, { y: FLOOR + 0.007 + (on ? 0.07 : 0), duration: 0.4, ease: 'power3.out' }),
  click: () => openSection('contacto'),
});

// --- fountain pen (decor, also opens contact)
const pen = new THREE.Group();
{
  const barrel = mesh(new THREE.CylinderGeometry(0.036, 0.036, 1.05, 24).rotateZ(Math.PI / 2), MAT.black);
  pen.add(barrel);
  const cap = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.34, 24).rotateZ(Math.PI / 2), MAT.black);
  cap.position.x = -0.62; pen.add(cap);
  const band = mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.04, 24).rotateZ(Math.PI / 2), MAT.brass);
  band.position.x = -0.46; pen.add(band);
  const nib = mesh(new THREE.ConeGeometry(0.034, 0.2, 24).rotateZ(-Math.PI / 2), MAT.brass);
  nib.position.x = 0.62; pen.add(nib);
  const clip = mesh(new RoundedBoxGeometry(0.26, 0.012, 0.022, 1, 0.005), MAT.brass);
  clip.position.set(-0.62, 0.046, 0); pen.add(clip);
}
pen.position.set(1.16, FLOOR + 0.04, 1.3);
pen.rotation.y = 0.12;
caseG.add(pen);
register('pen', pen, {
  tip: 'Contacto',
  normal: new V3(0, 1, 0), dist: 2.5,
  pose: () => ({ p: new V3(1.16, FLOOR + 0.18, 1.3), r: new THREE.Euler(0, 0.12, 0.08) }),
  hover: (o, on) => gsap.to(o.rotation, { z: on ? 0.12 : 0, duration: 0.4, ease: 'power3.out' }),
  click: () => openSection('contacto'),
});

// --- inside the lid: CV in a velvet pocket, business card, polaroid
const cvTex = canvasTex(1024, 1448, (g, w, h) => {
  g.fillStyle = '#f7f2e8'; g.fillRect(0, 0, w, h);
  speckle(g, w, h, 1500, ['rgba(150,130,100,.12)'], 1);
  g.fillStyle = '#b4372f'; g.font = '500 26px "JetBrains Mono"'; g.textBaseline = 'alphabetic';
  letterSpaced(g, 'HOJA DE VIDA', 90, 140, 8);
  g.fillStyle = '#1f1b16'; g.font = '800 86px "Fraunces"';
  g.fillText('Jerson Giraldo', 86, 240);
  g.fillStyle = '#5b5246'; g.font = '500 32px "Inter Tight"';
  g.fillText('Datos · IA · Software · 3D — Manizales, Colombia', 90, 296);
  g.fillStyle = '#0f766e'; g.fillRect(90, 330, 120, 6);
  const sec = (y, title) => { g.fillStyle = '#0f766e'; g.font = '600 24px "JetBrains Mono"'; letterSpaced(g, title, 90, y, 6); g.fillStyle = 'rgba(31,27,22,.18)'; g.fillRect(90, y + 18, w - 180, 2); };
  const row = (y, date, title, sub) => {
    g.fillStyle = '#5b5246'; g.font = '500 24px "JetBrains Mono"'; g.fillText(date, 90, y);
    g.fillStyle = '#1f1b16'; g.font = '700 34px "Inter Tight"'; g.fillText(title, 300, y);
    g.fillStyle = '#5b5246'; g.font = '500 26px "Inter Tight"'; g.fillText(sub, 300, y + 40);
  };
  sec(430, 'EXPERIENCIA');
  row(510, '2026', 'Asistente Junior de Ciencia de Datos e IA', 'Aula STEM FabLab · Universidad Nacional');
  row(620, '2023–24', 'Estudiante Auxiliar', 'Aula STEM FabLab · Universidad Nacional');
  sec(740, 'FORMACIÓN');
  row(820, '2022 –', 'Administración de Empresas', 'Universidad Nacional de Colombia');
  row(930, 'Técnico', 'Diseño Multimedia', 'SENA');
  sec(1050, 'HERRAMIENTAS');
  g.fillStyle = 'rgba(31,27,22,.12)';
  for (let y = 1110; y < h - 80; y += 46) g.fillRect(90, y, 200 + Math.random() * (w - 400), 14);
});
const cv = new THREE.Group();
{
  const paper = face(1.65, 2.33, cvTex, -1, 0.9);
  cv.add(paper);
  const clip = new THREE.Group();
  const jaw = mesh(new RoundedBoxGeometry(0.52, 0.06, 0.16, 2, 0.02), MAT.black);
  clip.add(jaw);
  for (const sx of [-1, 1]) {
    const wire = mesh(new THREE.TorusGeometry(0.1, 0.012, 8, 24, Math.PI), MAT.brass);
    wire.rotation.set(0, Math.PI / 2, Math.PI / 2);
    wire.position.set(sx * 0.17, -0.04, 0.1);
    clip.add(wire);
  }
  clip.position.set(0, -0.03, 1.1);
  cv.add(clip);
}
cv.position.set(-1.0, CEIL - 0.004, 0.12);
lid.add(cv);
const pocketTex = canvasTex(1024, 578, (g, w, h) => {
  g.fillStyle = '#0b3f3a'; g.fillRect(0, 0, w, h);
  speckle(g, w, h, 3000, ['rgba(45,212,191,.08)', 'rgba(0,0,0,.18)'], 1.4);
  g.strokeStyle = '#d9b48a'; g.lineWidth = 4; g.setLineDash([18, 12]);
  g.strokeRect(24, 24, w - 48, h - 48);
  g.setLineDash([]);
  g.fillStyle = '#6b3a20'; g.beginPath(); g.roundRect(w / 2 - 170, 70, 340, 74, 8); g.fill();
  g.fillStyle = '#f2dcc0'; g.font = '600 28px "JetBrains Mono"'; g.textAlign = 'center'; g.textBaseline = 'middle';
  letterSpaced(g, 'CURRÍCULUM', w / 2, 108, 6, 'center');
});
const pocket = face(1.95, 1.1, pocketTex, -1, 0.95);
pocket.position.set(-1.0, CEIL - 0.016, -0.9);
lid.add(pocket);
pocket.userData.hit = 'cv';
hitList.push(pocket);
register('cv', cv, {
  tip: 'Hoja de vida · Experiencia',
  normal: new V3(0, -1, 0), dist: 4.3,
  pose: () => ({ p: new V3(-0.75, CEIL - 0.55, 0.25), r: new THREE.Euler(0, 0, 0) }),
  hover: (o, on) => gsap.to(o.position, { y: CEIL - 0.004 - (on ? 0.07 : 0), duration: 0.4, ease: 'power3.out' }),
  click: () => openSection('experiencia'),
});

const cardTex = canvasTex(1024, 585, (g, w, h) => {
  g.fillStyle = '#0b1220'; g.fillRect(0, 0, w, h);
  const grd = g.createRadialGradient(w * 0.85, 0, 0, w * 0.85, 0, w * 0.7);
  grd.addColorStop(0, 'rgba(45,212,191,.22)'); grd.addColorStop(1, 'rgba(45,212,191,0)');
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  const nodes = [[690, 120], [800, 200], [900, 110], [860, 330], [740, 300], [960, 420]];
  g.strokeStyle = 'rgba(45,212,191,.45)'; g.lineWidth = 2;
  [[0, 1], [1, 2], [1, 3], [3, 4], [4, 0], [3, 5]].forEach(([a, b]) => { g.beginPath(); g.moveTo(...nodes[a]); g.lineTo(...nodes[b]); g.stroke(); });
  g.fillStyle = '#2dd4bf';
  nodes.forEach(([x, y], k) => { g.beginPath(); g.arc(x, y, k === 1 ? 10 : 6, 0, 7); g.fill(); });
  g.fillStyle = '#2dd4bf'; g.beginPath(); g.arc(78, 88, 12, 0, 7); g.fill();
  g.fillStyle = '#e8eef6'; g.font = '800 86px "Inter Tight"'; g.textBaseline = 'alphabetic';
  g.fillText('Jerson Giraldo', 64, 300);
  g.fillStyle = '#2dd4bf'; g.font = '500 28px "JetBrains Mono"';
  letterSpaced(g, 'DATOS · IA · SOFTWARE · 3D', 68, 352, 4);
  g.fillStyle = '#8a97a8'; g.font = '500 26px "JetBrains Mono"';
  g.fillText('jersongiraldo594@gmail.com', 68, h - 70);
  g.textAlign = 'right'; g.fillText('Manizales · COL', w - 64, h - 70);
});
const card = new THREE.Group();
{
  card.add(mesh(new THREE.BoxGeometry(1.05, 0.012, 0.6), new THREE.MeshStandardMaterial({ color: '#0b1220', roughness: 0.6 })));
  const f = face(1.05, 0.6, cardTex, -1, 0.7);
  f.material.envMapIntensity = 0.12;
  f.material.color.set('#b9c0cc');
  f.position.y = -0.0065;
  card.add(f);
}
card.position.set(1.15, CEIL - 0.012, 0.76);
card.rotation.y = -0.04;
lid.add(card);
{
  const holder = mesh(new RoundedBoxGeometry(1.38, 0.03, 0.36, 2, 0.012), MAT.leatherDark);
  holder.position.set(1.15, CEIL - 0.03, 0.5);
  lid.add(holder);
  holder.userData.hit = 'card';
}
register('card', card, {
  tip: 'Tarjeta · Sobre mí',
  normal: new V3(0, -1, 0), dist: 1.9,
  pose: () => ({ p: new V3(1.0, CEIL - 0.75, 0.55), r: new THREE.Euler(0, 0, 0) }),
  hover: (o, on) => gsap.to(o.position, { y: CEIL - 0.012 - (on ? 0.07 : 0), z: 0.76 + (on ? 0.08 : 0), duration: 0.4, ease: 'power3.out' }),
  click: () => openSection('sobre'),
});

const photoTex = new THREE.TextureLoader().load('assets/img/catedral.jpg', (t) => {
  t.colorSpace = THREE.SRGBColorSpace;
  const a = t.image.width / t.image.height;
  t.repeat.set(1 / a, 1); t.offset.set((1 - 1 / a) / 2, 0);
});
const polaroidTex = canvasTex(512, 604, (g, w, h) => {
  g.fillStyle = '#fbf8f1'; g.fillRect(0, 0, w, h);
  speckle(g, w, h, 600, ['rgba(150,130,100,.12)'], 1);
  g.fillStyle = '#2a241c'; g.font = '600 52px "Caveat"'; g.textAlign = 'center';
  g.fillText('Catedral · 3D', w / 2, h - 46);
});
const polaroid = new THREE.Group();
{
  polaroid.add(face(0.9, 1.06, polaroidTex, -1, 0.8));
  const photo = face(0.78, 0.78, photoTex, -1, 0.5);
  photo.position.set(0, -0.002, 0.08);
  polaroid.add(photo);
}
polaroid.position.set(1.12, CEIL - 0.006, -0.62);
polaroid.rotation.y = 0.09;
lid.add(polaroid);
register('polaroid', polaroid, {
  tip: 'Catedral de Manizales 3D',
  normal: new V3(0, -1, 0), dist: 2,
  pose: () => ({ p: new V3(1.0, CEIL - 0.6, -0.5), r: new THREE.Euler(0, 0, 0) }),
  hover: (o, on) => gsap.to(o.rotation, { y: on ? 0.02 : 0.09, duration: 0.5, ease: 'power3.out' }),
  click: () => openProject(6),
});


/* =========================================================
   The person in a suit (face always out of frame or in shadow)
   ========================================================= */
const tieTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#0c3f3a'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(45,212,191,.45)'; g.lineWidth = 10;
  for (let k = -h; k < w + h; k += 46) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + h, h); g.stroke(); }
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 4;
  for (let k = -h + 20; k < w + h; k += 46) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + h, h); g.stroke(); }
}, { repeat: [3, 3] });
const PM = {
  suit: new THREE.MeshPhysicalMaterial({ color: '#1c1f25', roughness: 0.82, sheen: 0.5, sheenColor: new THREE.Color('#5b6472'), sheenRoughness: 0.6, envMapIntensity: 0.35 }),
  lapel: new THREE.MeshPhysicalMaterial({ color: '#14161b', roughness: 0.55, sheen: 0.4, sheenColor: new THREE.Color('#6b7280'), envMapIntensity: 0.45 }),
  shirt: new THREE.MeshStandardMaterial({ color: '#e7e3da', roughness: 0.7, envMapIntensity: 0.4 }),
  skin: new THREE.MeshStandardMaterial({ color: '#7a5642', roughness: 0.6, envMapIntensity: 0.3 }),
  hair: new THREE.MeshStandardMaterial({ color: '#0b0908', roughness: 0.9, envMapIntensity: 0.1 }),
  // the head always reads as a silhouette: the face is never shown
  shade: new THREE.MeshStandardMaterial({ color: '#140e0b', roughness: 0.9, envMapIntensity: 0.05 }),
  tie: new THREE.MeshPhysicalMaterial({ map: tieTex, roughness: 0.4, sheen: 0.6, sheenColor: new THREE.Color('#5eead4'), envMapIntensity: 0.6 }),
};
function flatPart(points, depth, mat, z) {
  const s = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 });
  const m = mesh(g, mat);
  m.position.z = z;
  return m;
}

const person = new THREE.Group();
scene.add(person);
const chest = new THREE.Group();     // pivots at the hips so the body can lean in
chest.position.y = 9.0;
person.add(chest);
{
  const torsoGeo = new RoundedBoxGeometry(4.3, 5.9, 2.3, 4, 0.55);
  {
    // taper to a waist and round the chest so the jacket doesn't read as a box
    const pa = torsoGeo.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const y = pa.getY(i), k = THREE.MathUtils.clamp((y + 2.95) / 5.9, 0, 1);
      pa.setX(i, pa.getX(i) * (0.84 + 0.16 * Math.pow(k, 0.7)));
      const z = pa.getZ(i);
      pa.setZ(i, z * (0.9 + 0.12 * Math.sin(k * Math.PI)) - (z > 0 ? 0 : 0.05));
    }
    torsoGeo.computeVertexNormals();
  }
  const torso = mesh(torsoGeo, PM.suit);
  torso.position.y = 2.65;
  chest.add(torso);
  for (const sx of [-1, 1]) {
    const pad = mesh(new THREE.SphereGeometry(0.95, 24, 16), PM.suit);
    pad.scale.set(1, 0.8, 1);
    pad.position.set(sx * 1.85, 5.0, 0);
    chest.add(pad);
  }
  chest.add(flatPart([[-0.8, 5.2], [0.8, 5.2], [0, 2.3]], 0.04, PM.shirt, 1.13));
  chest.add(flatPart([[-0.2, 5.15], [0.2, 5.15], [0.13, 4.75], [-0.13, 4.75]], 0.07, PM.tie, 1.18));
  chest.add(flatPart([[-0.13, 4.75], [0.13, 4.75], [0.33, 2.75], [0, 2.4], [-0.33, 2.75]], 0.05, PM.tie, 1.17));
  for (const sx of [-1, 1]) {
    chest.add(flatPart([[-0.8, 5.2], [-1.45, 5.0], [-0.55, 2.7], [0, 2.3]].map(([x, y]) => [x * sx, y]), 0.07, PM.lapel, 1.15));
    chest.add(flatPart([[0, 5.3], [-0.62, 5.55], [-0.45, 4.92]].map(([x, y]) => [x * sx, y]), 0.1, PM.shirt, 0.98));
  }
  chest.add(flatPart([[-1.55, 3.55], [-0.95, 3.55], [-1.12, 3.9], [-1.3, 3.75], [-1.45, 3.95]], 0.05, PM.shirt, 1.16)); // pocket square
  for (const y of [1.95, 1.1]) {
    const b = mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 16).rotateX(Math.PI / 2), MAT.black);
    b.position.set(0, y, 1.17);
    chest.add(b);
  }
  const neck = mesh(new THREE.CylinderGeometry(0.58, 0.62, 1.4, 20), PM.shade);
  neck.position.set(0, 5.95, 0.1);
  chest.add(neck);
  const head = mesh(new THREE.SphereGeometry(1, 32, 24), PM.shade);
  head.scale.set(0.95, 1.2, 1.08);
  head.position.set(0, 7.6, 0.2);
  chest.add(head);
  const hair = mesh(new THREE.SphereGeometry(1.04, 32, 16, 0, Math.PI * 2, 0, 1.75), PM.hair);
  hair.scale.set(1, 1.18, 1.1);
  hair.position.set(0, 7.75, 0.05);
  chest.add(hair);
  for (const sx of [-1, 1]) {
    const ear = mesh(new THREE.SphereGeometry(0.22, 12, 10), PM.shade);
    ear.scale.set(0.5, 1, 0.8);
    ear.position.set(sx * 0.93, 7.5, 0.1);
    chest.add(ear);
  }
}
{
  const pelvis = mesh(new RoundedBoxGeometry(3.7, 1.7, 2.15, 3, 0.5), PM.suit);
  pelvis.position.y = 8.9;
  person.add(pelvis);
}
const legs = [-1, 1].map((sx) => {
  const hip = new THREE.Group();
  hip.position.set(sx * 0.95, 9.0, 0);
  person.add(hip);
  const thigh = mesh(new THREE.CylinderGeometry(0.8, 0.66, 4.35, 18), PM.suit);
  thigh.position.y = -2.175;
  hip.add(thigh);
  const knee = new THREE.Group();
  knee.position.y = -4.35;
  hip.add(knee);
  knee.add(mesh(new THREE.SphereGeometry(0.66, 16, 12), PM.suit));
  const shin = mesh(new THREE.CylinderGeometry(0.64, 0.55, 4.2, 18), PM.suit);
  shin.position.y = -2.1;
  knee.add(shin);
  const shoe = mesh(new RoundedBoxGeometry(1.0, 0.55, 2.2, 2, 0.22), new THREE.MeshStandardMaterial({ color: '#0a0a0b', roughness: 0.55, envMapIntensity: 0.15 }));
  shoe.position.set(0, -4.4, 0.5);
  knee.add(shoe);
  return { hip, knee };
});

// arms are solved with two-bone IK every frame, so they live in world space
const L1 = 3.3, L2 = 3.0;
function makeArm(side) {
  const shoulder = new THREE.Object3D();
  shoulder.position.set(side * 2.25, 4.85, 0.05);
  chest.add(shoulder);
  const upper = mesh(new THREE.CylinderGeometry(0.6, 0.53, 1, 16), PM.suit);
  const elbow = mesh(new THREE.SphereGeometry(0.53, 16, 12), PM.suit);
  const fore = mesh(new THREE.CylinderGeometry(0.52, 0.45, 1, 16), PM.suit);
  const cuff = mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.24, 16), PM.shirt);
  const hand = new THREE.Group();
  const palm = mesh(new RoundedBoxGeometry(0.72, 1.0, 0.32, 2, 0.14), PM.skin);
  palm.position.y = 0.5;
  hand.add(palm);
  const thumb = mesh(new RoundedBoxGeometry(0.24, 0.55, 0.24, 2, 0.1), PM.skin);
  thumb.position.set(0.36, 0.32, -0.16);
  thumb.rotation.z = -0.5;
  hand.add(thumb);
  scene.add(upper, elbow, fore, cuff, hand);
  return { side, shoulder, upper, elbow, fore, cuff, hand };
}
const arms = { L: makeArm(-1), R: makeArm(1) };

const UP = new V3(0, 1, 0);
const _a = new V3(), _b = new V3(), _c = new V3(), _d = new V3(), _e = new V3(), _m = new THREE.Matrix4();
function placeSeg(m, a, b) {
  _d.subVectors(b, a);
  const len = _d.length();
  m.position.copy(a).addScaledVector(_d, 0.5);
  m.quaternion.setFromUnitVectors(UP, _d.normalize());
  m.scale.set(1, len, 1);
}
function solveArm(arm, target) {
  const S = arm.shoulder.getWorldPosition(_a);
  const dir = _b.subVectors(target, S);
  let d = dir.length();
  dir.normalize();
  d = THREE.MathUtils.clamp(d, Math.abs(L1 - L2) + 0.05, L1 + L2 - 0.02);
  const a = (L1 * L1 + d * d - L2 * L2) / (2 * d);
  const h = Math.sqrt(Math.max(L1 * L1 - a * a, 0));
  const pole = _c.set(arm.side * 0.75, -0.45, -0.6).normalize();
  pole.addScaledVector(dir, -pole.dot(dir)).normalize();
  const E = S.clone().addScaledVector(dir, a).addScaledVector(pole, h);
  const Wr = _e.copy(S).addScaledVector(dir, d);
  arm.elbow.position.copy(E);
  placeSeg(arm.upper, S, E);
  const Ec = E;
  placeSeg(arm.fore, Ec, Wr);
  arm.cuff.quaternion.copy(arm.fore.quaternion);
  const f = Wr.clone().sub(Ec).normalize();
  arm.cuff.position.copy(Wr).addScaledVector(f, -0.12);
  // hand: fingers continue the forearm, palm turned towards the body's centre line
  const n = new V3(-arm.side, 0, 0);
  n.addScaledVector(f, -n.dot(f));
  if (n.lengthSq() < 1e-4) n.set(0, 0, 1);
  n.normalize();
  const r = n.clone().cross(f);
  _m.makeBasis(r, f, n.clone().negate());
  arm.hand.quaternion.setFromRotationMatrix(_m);
  arm.hand.position.copy(Wr);
}

// hand targets: each hand blends from where it was to a (possibly moving) anchor
const hands = {
  L: { cur: new V3(), from: null, to: () => new V3(), t: 1 },
  R: { cur: new V3(), from: null, to: () => new V3(), t: 1 },
};
const at = (obj, x, y, z) => { const p = new V3(x, y, z), out = new V3(); return () => obj.localToWorld(out.copy(p)); };
function handTo(k, fn, dur, ease = 'power2.inOut') {
  const h = hands[k];
  const start = h.cur.clone();
  h.from = () => start; h.to = fn; h.t = 0;
  return gsap.to(h, { t: 1, duration: T(dur), ease, overwrite: true });
}
function handSet(k, fn) { const h = hands[k]; gsap.killTweensOf(h); h.from = null; h.to = fn; h.t = 1; }
// resting grip: from underneath the base, so the fingers never cover what's inside
// presenting the case: both palms up under the base, like offering a tray
const SIDE = (s) => at(caseG, s * 2.0, -0.28, -1.0);
// one hand supports the middle while the other works the latch and the lid
const SUPPORT = at(caseG, -1.9, -0.28, -1.0);
const FRONT = (s) => at(caseG, s * 2.52, 0.3, -0.6);
const LIDSIDE = (s) => at(lid, s * 2.55, LH * 0.45, -0.35);
// waypoint outside the case wall, so a hand travelling between grips never cuts through the case
const OUTSIDE = (s) => at(caseG, s * 2.8, -0.5, -0.75);
// in front of a front corner: first stop when a hand leaves the handle
const FRONT_CORNER = (s) => at(caseG, s * 2.8, 0.1, 2.1);
// walk a hand through several points, one after another
function handPath(k, points, durations) {
  let t = 0;
  points.forEach((pt, i) => {
    gsap.delayedCall(T(t), () => handTo(k, pt, durations[i]));
    t += durations[i];
  });
}
function handVia(k, mid, end, d1, d2) {
  handTo(k, mid, d1);
  gsap.delayedCall(T(d1), () => handTo(k, end, d2));
}

/* walking: legs, body bob, swinging left arm, case carried in the right hand */
const walk = { z: WALK_START };
const walkHand = { L: new V3(), R: new V3() };
const carry = { p: new V3(), q: new THREE.Quaternion() };
const GRIP = new V3(0, BH - 0.12, D / 2 + 0.37);   // handle apex, in case space, with the handle upright
const qBase = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, Math.PI / 2, 0, 'YXZ'));
const qSwing = new THREE.Quaternion();
const XAXIS = new V3(1, 0, 0);
let mode = 'walk';      // walk → present → held
function updateBody() {
  const amp = THREE.MathUtils.clamp((PERSON_Z - walk.z) / 2.4, 0, 1);
  const ph = (walk.z - WALK_START) * 0.85;
  person.position.set(0, FLOOR_Y + Math.abs(Math.sin(ph)) * 0.16 * amp, walk.z);
  chest.rotation.y = Math.sin(ph) * 0.05 * amp;
  legs.forEach((l, k) => {
    const p = ph + (k ? Math.PI : 0);
    l.hip.rotation.x = -Math.sin(p) * 0.42 * amp;
    l.knee.rotation.x = (0.08 + 0.6 * Math.max(0, Math.sin(p + 1.2))) * amp;
  });
  if (mode !== 'walk') return;
  person.updateMatrixWorld(true);
  const sL = char ? char.bones.L.upper.getWorldPosition(new V3()) : arms.L.shoulder.getWorldPosition(new V3());
  const sR = char ? char.bones.R.upper.getWorldPosition(new V3()) : arms.R.shoulder.getWorldPosition(new V3());
  walkHand.L.set(-0.25, -5.85, 0).applyAxisAngle(XAXIS, Math.sin(ph) * 0.32 * amp).add(sL);
  walkHand.R.set(0.35, -5.75, 0.1 + Math.sin(ph) * 0.15 * amp).add(sR);
  if (char && char.carriedByAnim) {
    // the animation already swings the carrying arm: hang the case from that hand's knuckles
    const b = char.bones[CARRY];
    char.root.updateMatrixWorld(true);
    const grip = (b.finger || b.hand).getWorldPosition(new V3());
    walkHand[CARRY].copy(b.hand.getWorldPosition(new V3()));
    carry.q.copy(qBase);
    carry.p.copy(grip).add(new V3(0, -0.15, 0)).sub(GRIP.clone().applyQuaternion(carry.q));
  } else {
    // the case hangs from the right hand and swings a little behind the stride
    qSwing.setFromAxisAngle(XAXIS, -Math.sin(ph - 0.7) * 0.09 * amp);
    carry.q.multiplyQuaternions(qSwing, qBase);
    carry.p.copy(walkHand.R).add(new V3(0, -0.45, 0)).sub(GRIP.clone().applyQuaternion(carry.q));
  }
  caseG.position.copy(carry.p);
  caseG.quaternion.copy(carry.q);
}
// every frame, whatever the mode: place the rig and cross-fade walk into idle as the steps slow down
function updateChar() {
  if (!char) return;
  const amp = THREE.MathUtils.clamp((PERSON_Z - walk.z) / 2.4, 0, 1);
  char.root.position.set(0, FLOOR_Y, walk.z);
  const { walk: wa, idle: ia } = char.actions;
  if (wa) { wa.setEffectiveWeight(ia ? amp : 1); wa.timeScale = 0.62; }
  if (ia) ia.setEffectiveWeight(wa ? 1 - amp : 1);
}
const present = { t: 0 };
const IDQ = new THREE.Quaternion();
const PRESENT_CTRL = new V3(3.4, 0.4, 2.6);   // pulls the path out in front of the hips
function updatePresent() {
  const e = present.t, u = 1 - e;
  caseG.position.set(0, 0, 0)
    .addScaledVector(carry.p, u * u)
    .addScaledVector(PRESENT_CTRL.clone().setX(PRESENT_CTRL.x * (CARRY === 'L' ? -1 : 1)), 2 * u * e);
  caseG.quaternion.slerpQuaternions(carry.q, IDQ, THREE.MathUtils.smootherstep(e, 0.15, 0.85));
}
// the right hand keeps hold of the handle while the case swings up
const gripWrist = (() => { const out = new V3(); return () => handleG.localToWorld(out.set(0, 0, 0.34)).add(new V3(0, 0.45, 0)); })();

/* =========================================================
   Rigged character (Mixamo skeleton). If it can't load, the
   procedural figure above stays as a fallback.
   ========================================================= */
// built by tools/build_persona.py from the Mixamo downloads
const CHARACTER_URLS = ['assets/modelos/persona.glb'];
// persona.glb is exported from Blender with its Mixamo clips inside (same skeleton, same rest pose)
let char = null;
const ikW = { L: 0, R: 0 };      // how much the IK overrides the animated arms
let CARRY = 'R';                 // screen side of the hand that carries the case while walking
async function loadCharacter() {
  const loader = new GLTFLoader();
  for (const url of CHARACTER_URLS) {
    try {
      const gltf = await loader.loadAsync(url);
      return setupCharacter(gltf);
    } catch (e) { /* try the next one */ }
  }
  return null;
}
function setupCharacter(gltf) {
  const model = gltf.scene;
  model.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false;
      for (const m of [].concat(o.material)) {
        // Mixamo's spec/gloss converts to a wet, latex look: make the cloth matte
        m.envMapIntensity = 0.35;
        if ('roughness' in m) { m.roughness = 0.82; m.roughnessMap = null; m.metalness = 0; }
        if ('specularIntensity' in m) { m.specularIntensity = 0.25; m.specularIntensityMap = null; m.specularColorMap = null; }
        m.needsUpdate = true;
      }
    }
  });
  // scale to a 1.78 m person standing on the floor
  // precise box: goes through the skinning, so armature scales (Mixamo's 0.01) are accounted for
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model, true);
  const s = 17.8 / (box.max.y - box.min.y);
  model.scale.setScalar(s);
  model.position.y = -box.min.y * s;
  const root = new THREE.Group();
  root.add(model);
  scene.add(root);

  const bone = (name) => {
    let found = null;
    model.traverse((o) => { if (!found && o.isBone && o.name.replace(/[:_]/g, '').toLowerCase().endsWith(name.toLowerCase())) found = o; });
    return found;
  };
  // L/R here are screen sides (L = -x); the character faces the camera, so its own right arm is on screen left
  const bones = {
    L: { upper: bone('RightArm'), fore: bone('RightForeArm'), hand: bone('RightHand'), finger: bone('RightHandMiddle1'), side: -1 },
    R: { upper: bone('LeftArm'), fore: bone('LeftForeArm'), hand: bone('LeftHand'), finger: bone('LeftHandMiddle1'), side: 1 },
  };
  if (!bones.L.upper || !bones.R.hand) { scene.remove(root); return null; }
  for (const k of ['L', 'R']) {
    const pre = k === 'L' ? 'RightHand' : 'LeftHand';
    const b = bones[k];
    b.fingers = ['Index', 'Middle', 'Ring', 'Pinky'].map((f) => [1, 2, 3, 4].map((j) => bone(pre + f + j))).filter((c) => c.every(Boolean));
    b.thumb = [1, 2, 3, 4].map((j) => bone(pre + 'Thumb' + j)).filter(Boolean);
    root.updateMatrixWorld(true);
    b.fingerBind = b.fingers.map((c) => c.map((x) => x.quaternion.clone()));
    b.thumbBind = b.thumb.map((x) => x.quaternion.clone());
    b.palmSign = 1;
    if (b.fingers.length >= 2) b.palmSign = palmNormal(b).y < 0 ? 1 : -1;   // bind pose: palms down
  }
  const spine = [bone('Spine1'), bone('Spine2')].filter(Boolean);

  // Mixamo prefixes bones per character (mixamorig7:Hips…): normalise model and clips to one name
  const norm = (n) => n.replace(/^mixamorig\d*:?/i, 'mixamorig');
  model.traverse((o) => { if (o.isBone) o.name = norm(o.name); });
  // keep rotations only: bone offsets differ between characters and the walk happens in place
  const fixClip = (clip) => {
    clip = clip.clone();
    clip.tracks = clip.tracks.filter((t) => { t.name = norm(t.name); return t.name.endsWith('.quaternion'); });
    return clip;
  };
  const clips = gltf.animations.map(fixClip);
  const find = (re) => clips.find((c) => re.test(c.name));
  const mixer = new THREE.AnimationMixer(model);
  const walkClip = find(/walk.*briefcase|briefcase.*walk/i) || find(/walk/i);
  const idleClip = find(/idle/i);
  const actions = {
    walk: walkClip ? mixer.clipAction(walkClip) : null,
    idle: idleClip ? mixer.clipAction(idleClip) : null,
  };
  for (const a of Object.values(actions)) if (a) { a.play(); a.setEffectiveWeight(0); }

  person.visible = false;
  for (const a of Object.values(arms)) for (const k of ['upper', 'elbow', 'fore', 'cuff', 'hand']) a[k].visible = false;

  // which hand does the walk animation carry with? the lower, straighter one
  if (actions.walk) {
    actions.walk.setEffectiveWeight(1);
    mixer.update(0.2);
    root.updateMatrixWorld(true);
    const yL = bones.L.hand.getWorldPosition(new V3()).y, yR = bones.R.hand.getWorldPosition(new V3()).y;
    CARRY = yL < yR ? 'L' : 'R';
    actions.walk.setEffectiveWeight(0);
  }
  return { root, model, mixer, actions, bones, spine, carriedByAnim: !!walkClip && /briefcase/i.test(walkClip.name) };
}

// two-bone IK applied on top of the animation, blended by weight
const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion();
function aimBone(bone, from, to, w) {
  _q1.setFromUnitVectors(from.normalize(), to.normalize());
  if (w < 1) _q1.slerp(IDQ, 1 - w);
  bone.getWorldQuaternion(_q2);
  bone.parent.getWorldQuaternion(_q3);
  bone.quaternion.copy(_q3.invert().multiply(_q1.multiply(_q2)));
  bone.updateMatrixWorld(true);
}
function boneIK(b, target, w) {
  if (w <= 0.001) return;
  const S = b.upper.getWorldPosition(new V3());
  const E0 = b.fore.getWorldPosition(new V3());
  const W0 = b.hand.getWorldPosition(new V3());
  const l1 = S.distanceTo(E0), l2 = E0.distanceTo(W0);
  const dir = target.clone().sub(S);
  const d = THREE.MathUtils.clamp(dir.length(), Math.abs(l1 - l2) + 0.05, l1 + l2 - 0.02);
  dir.normalize();
  const a = (l1 * l1 + d * d - l2 * l2) / (2 * d);
  const h = Math.sqrt(Math.max(l1 * l1 - a * a, 0));
  const pole = new V3(b.side * 0.6, -0.95, -0.25).normalize();   // elbows down and a little out, below the case
  pole.addScaledVector(dir, -pole.dot(dir)).normalize();
  const E = S.clone().addScaledVector(dir, a).addScaledVector(pole, h);
  const Wt = S.clone().addScaledVector(dir, d);
  aimBone(b.upper, E0.clone().sub(S), E.clone().sub(S), w);
  const E1 = b.fore.getWorldPosition(new V3()), W1 = b.hand.getWorldPosition(new V3());
  aimBone(b.fore, W1.sub(E1), Wt.sub(E1), w);
}

/* hands: point the fingers, turn the palm onto the surface, then close the fingers around it */
function rotateWorld(bone, axis, angle) {
  _q1.setFromAxisAngle(axis, angle);
  bone.getWorldQuaternion(_q2);
  bone.parent.getWorldQuaternion(_q3);
  bone.quaternion.copy(_q3.invert().multiply(_q1.multiply(_q2)));
  bone.updateMatrixWorld(true);
}
function palmNormal(b) {
  const H = b.hand.getWorldPosition(new V3());
  const I = b.fingers[0][0].getWorldPosition(new V3()), P = b.fingers[b.fingers.length - 1][0].getWorldPosition(new V3());
  const M = b.fingers[1][0].getWorldPosition(new V3());
  return new V3().crossVectors(I.sub(P), M.sub(H)).multiplyScalar(b.palmSign).normalize();
}
function orientHand(b, aim, palm, w) {
  if (!b.fingers || b.fingers.length < 2 || w <= 0.001) return;
  const H = b.hand.getWorldPosition(new V3()), F = b.fingers[1][0].getWorldPosition(new V3());
  aimBone(b.hand, F.sub(H), aim.clone(), w);
  // roll about the finger axis until the palm faces the wanted direction
  const H2 = b.hand.getWorldPosition(new V3()), f = b.fingers[1][0].getWorldPosition(new V3()).sub(H2).normalize();
  const n = palmNormal(b).addScaledVector(f, -palmNormal(b).dot(f)).normalize();
  const p = palm.clone().addScaledVector(f, -palm.dot(f)).normalize();
  const ang = Math.atan2(new V3().crossVectors(n, p).dot(f), n.dot(p));
  rotateWorld(b.hand, f, ang * w);
}
const CURL = [0.95, 1.15, 0.8];
function curlFingers(b, amount) {
  if (!b.fingers || amount <= 0.001) return;
  for (const chain of b.fingers) {
    for (let k = 0; k < 3; k++) {
      const J = chain[k].getWorldPosition(new V3()), C = chain[k + 1].getWorldPosition(new V3());
      const f = C.sub(J).normalize();
      const axis = new V3().crossVectors(f, palmNormal(b)).normalize();
      rotateWorld(chain[k], axis, amount * CURL[k]);
    }
  }
  if (b.thumb.length >= 3) {
    for (let k = 0; k < 2; k++) {
      const J = b.thumb[k].getWorldPosition(new V3()), C = b.thumb[k + 1].getWorldPosition(new V3());
      const axis = new V3().crossVectors(C.sub(J).normalize(), palmNormal(b)).normalize();
      rotateWorld(b.thumb[k], axis, amount * 0.45);
    }
  }
}
// what each hand is doing: where the fingers point, where the palm faces, how closed the hand is
const handPose = {
  L: { aim: new V3(0, -0.4, 1).normalize(), palm: new V3(1, 0, 0), curl: 0, target: null },
  R: { aim: new V3(0, -0.4, 1).normalize(), palm: new V3(-1, 0, 0), curl: 0, target: null },
};
const POSES = {
  // palms up under the base, fingers straight and forward: offering the case
  tray: (s) => ({ aim: new V3(-s * 0.15, -0.06, 1), palm: new V3(0, 1, 0), curl: 0 }),
  // hand flat against the side wall while it slides to the latch
  side: (s) => ({ aim: new V3(0, -0.15, 1), palm: new V3(-s, 0, 0), curl: 0 }),
  // holding the case: palm flat on the side wall, fingers reaching forward and down, wrapped under the base
  hold: (s) => ({ aim: new V3(0, -0.75, 1), palm: new V3(-s, 0.35, 0), curl: 0.75 }),
  // taking the lid: the same grip, turning with the lid as it rises
  lid: (s) => ({ aim: lid.localToWorld(new V3(0, 0, 1)).sub(lid.getWorldPosition(new V3())).add(new V3(0, -0.3, 0)), palm: new V3(-s, 0, 0), curl: 0 }),
  // around the handle while lifting the case
  handle: (s) => ({ aim: new V3(0, -1, 0.3), palm: new V3(0, 0, 1), curl: 0.9 }),
  relaxed: () => null,
};
let leanAmt = { v: 0 };
// a hand rigidly holding the case (wrist position and rotation stored in case space)
let handLock = null;
function setHandPose(k, name) {
  const hp = handPose[k];
  if (char && POSES[name] && !hp.target) {
    const b = char.bones[k];
    const H = b.hand.getWorldPosition(new V3());
    hp.aim.copy(b.fingers[1][0].getWorldPosition(new V3()).sub(H).normalize());
    hp.palm.copy(palmNormal(b));
  }
  hp.target = POSES[name] ? (s) => POSES[name](s) : null;
}


/* =========================================================
   Camera rig
   ========================================================= */
const WALK_CAM = new V3(3.4, FLOOR_Y + 6.6, PERSON_Z + 19);
const VIEWS = {
  closed: { p: new V3(5.2, 1.3, 12.6), t: new V3(0.3, -1.1, -1.3) },
  open: { p: new V3(0, 7.4, 9.0), t: new V3(0, 0.7, -0.8) },
};
const rig = { p: WALK_CAM.clone(), t: new V3(0, FLOOR_Y + 11, WALK_START), sx: 0, sy: 0, par: 1, follow: true };
const portrait = () => camera.aspect < 1;
function fitK() {
  const ref = Math.tan(THREE.MathUtils.degToRad(17.5)) * 1.6;
  const now = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
  return Math.max(1, ref / now) * (portrait() ? 0.78 : 1);
}
const VIEWS_PORTRAIT = {
  closed: { p: new V3(1.6, 9.5, 12.5), t: new V3(0.1, -0.4, -0.6) },
  open: { p: new V3(0, 12.5, 6.6), t: new V3(0, 0.9, -0.5) },
};
function view(name) {
  if (portrait() && VIEWS_PORTRAIT[name]) {
    // phones: framings tuned for ~9:19.5, scaled for slightly wider or narrower screens
    const v = VIEWS_PORTRAIT[name], k = THREE.MathUtils.clamp(0.462 / camera.aspect, 0.8, 1.5);
    return { p: v.t.clone().add(v.p.clone().sub(v.t).multiplyScalar(k)), t: v.t.clone() };
  }
  const v = VIEWS[name], k = fitK();
  return { p: v.t.clone().add(v.p.clone().sub(v.t).multiplyScalar(k)), t: v.t.clone() };
}
function stackView() {
  caseG.updateWorldMatrix(true, true);
  const t = caseG.localToWorld(new V3(-1.02, 0.2, -0.2));
  const off = new V3(0.35, 4.2, 3.1).multiplyScalar(portrait() ? 1.9 : 1);
  return { p: t.clone().add(off), t };
}
function flyTo({ p, t }, dur = 2, ease = 'power3.inOut') {
  return Promise.all([
    gsap.to(rig.p, { x: p.x, y: p.y, z: p.z, duration: T(dur), ease, overwrite: true }),
    gsap.to(rig.t, { x: t.x, y: t.y, z: t.z, duration: T(dur), ease, overwrite: true }),
  ]);
}


/* =========================================================
   UI: tooltip, anchored labels, sheet
   ========================================================= */
const tip = $('#tip');
const labelsEl = $('#labels');
const LABELS = [
  { text: 'Proyectos', sub: `${PROJECTS.length}`, parent: caseG, at: new V3(-1.02, 0.42, -0.55), go: 'proyectos' },
  { text: 'Reel', parent: caseG, at: new V3(1.22, 0.2, -0.86), go: 'reel' },
  { text: 'Contacto', parent: caseG, at: new V3(1.22, 0.2, 0.55), go: 'contacto' },
  { text: 'Sobre mí', parent: lid, at: new V3(1.15, CEIL - 0.1, 0.95), go: 'sobre' },
  { text: 'Experiencia', parent: lid, at: new V3(-1.0, CEIL - 0.1, 0.6), go: 'experiencia' },
];
LABELS.forEach((l) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'label';
  b.innerHTML = `${l.text}${l.sub ? ` <small>${l.sub}</small>` : ''}`;
  b.addEventListener('click', () => go(l.go));
  labelsEl.appendChild(b);
  l.el = b;
});
const labelState = { o: 0 };
function showLabels(on) {
  gsap.to(labelState, { o: on ? 1 : 0, duration: T(on ? 0.8 : 0.3), ease: 'power2.out' });
  labelsEl.style.pointerEvents = 'none';
  LABELS.forEach((l) => { l.el.tabIndex = on ? 0 : -1; });
}

const sheet = $('#sheet');
const content = $('#content');
const paper = $('#paper');

function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function projectHTML(i) {
  const p = PROJECTS[i];
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  let media = '';
  if (p.media.type === 'video') {
    media = `<video src="${p.media.src}" poster="${p.media.poster}" muted loop playsinline autoplay></video>${p.media.sound ? '<button class="doc__sound" type="button" data-sound>Activar sonido</button>' : ''}`;
  } else if (p.media.type === 'img') {
    media = `<img src="${p.media.src}" alt="${esc(p.media.alt)}">`;
  } else {
    media = `<div class="chat"><p class="chat__q">¿Quién tiene la impresora 3D?</p><p class="chat__a"><span class="chat__fn">consultar_prestamos()</span>Está prestada al semillero de robótica desde el 14 de octubre. Vuelve el viernes.</p><p class="chat__q">¿Y su próximo mantenimiento?</p><p class="chat__a"><span class="chat__fn">consultar_mantenimientos()</span>Está programado para el 3 de noviembre.</p></div>`;
  }
  return `<article class="doc">
    <div class="doc__head"><span class="doc__tab" style="--c:${p.color}">Expediente ${String(i + 1).padStart(2, '0')} / ${String(PROJECTS.length).padStart(2, '0')}</span>
      <span>${p.stamps.map(([t, k]) => `<span class="stamp stamp--${k}">${t}</span>`).join('')}</span></div>
    <h2 id="sheetTitle">${p.title}</h2>
    <p class="doc__kicker">${p.kicker}</p>
    <div class="doc__media">${media}</div>
    <p>${p.desc}</p>
    ${p.stat ? `<div class="doc__stat"><strong>${p.stat[0]}</strong><span>${p.stat[1]}</span></div>` : ''}
    <ul class="doc__chips">${p.chips.map((c) => `<li>${c}</li>`).join('')}</ul>
    <div class="doc__links">${p.links.map(([t, u]) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`).join('')}</div>
    ${p.note ? `<p class="doc__note">${p.note}</p>` : ''}
    <nav class="doc__nav" aria-label="Otros proyectos">
      <button type="button" data-proj="${(i - 1 + PROJECTS.length) % PROJECTS.length}">← Anterior<b>${prev.title}</b></button>
      <button type="button" data-proj="${(i + 1) % PROJECTS.length}">Siguiente →<b>${next.title}</b></button>
    </nav>
  </article>`;
}
const SECTIONS = {
  sobre: () => `<article class="doc">
    <div class="doc__head"><span class="doc__tab">Tarjeta de presentación</span><span class="stamp stamp--live">Disponible</span></div>
    <h2 id="sheetTitle">Sobre mí</h2>
    <p class="doc__lead">Si tienes una idea que necesita datos, un modelo de IA o un prototipo que funcione, ese es el tipo de problema que me gusta resolver de principio a fin.</p>
    <p>No me quedo en una sola herramienta. He entrenado modelos de visión por computador, hecho aplicaciones web y de escritorio, programado hardware con ESP32 y construido mundos en 3D. Lo que une todo es llevar un problema real hasta algo que se pueda usar.</p>
    <p>Estudio Administración de Empresas en la Universidad Nacional y soy técnico en Diseño Multimedia del SENA, así que me muevo entre el código, el negocio y lo visual. Por eso este portafolio es un maletín.</p>
    <div class="pillars">
      <div><h3>IA y datos</h3><p>Machine learning, visión por computador, agentes con LLMs.</p></div>
      <div><h3>Software</h3><p>Web full stack, apps de escritorio y despliegue en la nube.</p></div>
      <div><h3>Hardware</h3><p>ESP32, servos, Fusion 360 e impresión 3D.</p></div>
      <div><h3>3D y visual</h3><p>Three.js, Godot, Blender y pixel art por código.</p></div>
    </div>
    <ul class="facts">
      <li><span>Ubicación</span><span>Manizales, Colombia</span></li>
      <li><span>Idiomas</span><span>Español (nativo) · Inglés (B1)</span></li>
      <li><span>Stack</span><span>Python · JS/TS · Next.js · Supabase · Three.js</span></li>
    </ul>
    <p class="signature">— Jerson</p>
  </article>`,
  experiencia: () => `<article class="doc">
    <div class="doc__head"><span class="doc__tab">Hoja de vida</span></div>
    <h2 id="sheetTitle">Experiencia y formación</h2>
    <ol class="cv">
      <li><time>2026</time><div><h3>Asistente Junior de Ciencia de Datos e IA</h3><p class="place">Aula STEM FabLab · Universidad Nacional de Colombia</p><p>Agentes con LLMs, visión por computador, integración de software con hardware y despliegue web. Aquí nacieron OptiBot e IACamera.</p></div></li>
      <li><time>2023 – 2024</time><div><h3>Estudiante Auxiliar</h3><p class="place">Aula STEM FabLab · Universidad Nacional de Colombia</p><p>Prototipado, fabricación digital y apoyo a proyectos de investigación aplicada.</p></div></li>
      <li><time>Desde 2022</time><div><h3>Administración de Empresas</h3><p class="place">Universidad Nacional de Colombia · Sede Manizales</p></div></li>
      <li><time>Técnico</time><div><h3>Diseño Multimedia</h3><p class="place">SENA</p></div></li>
    </ol>
    <div class="doc__links"><a href="https://linkedin.com/in/jerson-estiven-giraldo-florez-96a3031b0" target="_blank" rel="noopener">LinkedIn ↗</a><a href="https://github.com/Jersonflo" target="_blank" rel="noopener">GitHub ↗</a></div>
  </article>`,
  contacto: () => `<article class="doc">
    <div class="doc__head"><span class="doc__tab">Correspondencia</span><span class="stamp stamp--info">Respondo rápido</span></div>
    <h2 id="sheetTitle">¿Tienes una idea? Hagámosla funcionar.</h2>
    <p>Estoy abierto a oportunidades, convocatorias y proyectos. Escríbeme y cuéntame qué quieres construir.</p>
    <a class="mail" href="mailto:jersongiraldo594@gmail.com">jersongiraldo594@gmail.com</a>
    <button class="copy" type="button" data-copy="jersongiraldo594@gmail.com">Copiar correo</button>
    <div class="doc__links"><a href="https://linkedin.com/in/jerson-estiven-giraldo-florez-96a3031b0" target="_blank" rel="noopener">LinkedIn ↗</a><a href="https://github.com/Jersonflo" target="_blank" rel="noopener">GitHub ↗</a></div>
    <p class="signature">Manizales, Colombia</p>
  </article>`,
};

let sheetOpen = false;
// full resolution for the 3D scene, or a lighter one while the dossier is on top
const fullDpr = Math.min(devicePixelRatio, 2);
function quality(full) { renderer.setPixelRatio(full ? fullDpr : Math.min(fullDpr, 1.25)); }
function fillSheet(html) {
  content.querySelectorAll('video').forEach((v) => v.pause());
  content.innerHTML = html;
  paper.scrollTop = 0;
  smooth.current = smooth.target = 0;
  gsap.from(content.querySelectorAll('.doc > *'), { y: 26, opacity: 0, duration: T(0.8), ease: 'expo.out', stagger: 0.05, delay: 0.05 });
}
function showSheet() {
  if (sheetOpen) return;
  sheetOpen = true;
  sheet.classList.add('is-open');
  sheet.setAttribute('aria-hidden', 'false');
  gsap.fromTo(sheet, portrait() ? { yPercent: 105, xPercent: 0 } : { xPercent: 110, yPercent: 0 }, { xPercent: 0, yPercent: 0, duration: T(0.9), ease: 'expo.out' });
  gsap.fromTo(sheet, { rotate: portrait() ? 0 : 2.5 }, { rotate: 0, duration: T(1.1), ease: 'expo.out' });
  quality(false);
  setTimeout(() => paper.focus({ preventScroll: true }), 50);
}
function hideSheet() {
  if (!sheetOpen) return Promise.resolve();
  sheetOpen = false;
  sheet.setAttribute('aria-hidden', 'true');
  quality(true);
  content.querySelectorAll('video').forEach((v) => v.pause());
  return gsap.to(sheet, { ...(portrait() ? { yPercent: 105 } : { xPercent: 110 }), duration: T(0.55), ease: 'expo.in' })
    .then(() => sheet.classList.remove('is-open'));
}
/* smooth, inertial wheel scrolling inside the dossier (touch keeps the native scroll) */
const smooth = { target: 0, current: 0, running: false };
function smoothStep() {
  smooth.current += (smooth.target - smooth.current) * 0.16;
  if (Math.abs(smooth.target - smooth.current) < 0.5) smooth.current = smooth.target;
  paper.scrollTop = smooth.current;
  if (smooth.current !== smooth.target) requestAnimationFrame(smoothStep);
  else smooth.running = false;
}
paper.addEventListener('wheel', (e) => {
  if (e.ctrlKey) return;                       // pinch-zoom gestures
  e.preventDefault();
  if (!smooth.running) smooth.current = smooth.target = paper.scrollTop;
  const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? paper.clientHeight : 1;
  const max = paper.scrollHeight - paper.clientHeight;
  smooth.target = Math.max(0, Math.min(max, smooth.target + e.deltaY * unit));
  if (!smooth.running) { smooth.running = true; requestAnimationFrame(smoothStep); }
}, { passive: false });
// keyboard, scrollbar and touch move the page directly: keep the smoother in sync
paper.addEventListener('scroll', () => { if (!smooth.running) smooth.current = smooth.target = paper.scrollTop; }, { passive: true });

content.addEventListener('click', (e) => {
  const proj = e.target.closest('[data-proj]');
  if (proj) return openProject(+proj.dataset.proj);
  const snd = e.target.closest('[data-sound]');
  if (snd) {
    const v = snd.parentElement.querySelector('video');
    v.muted = !v.muted; v.play();
    snd.textContent = v.muted ? 'Activar sonido' : 'Silenciar';
  }
  const cp = e.target.closest('[data-copy]');
  if (cp) navigator.clipboard?.writeText(cp.dataset.copy).then(() => { cp.textContent = 'Copiado ✓'; });
});


/* =========================================================
   States & sequences
   ========================================================= */
let state = 'intro';   // intro → closed → opening → open ⇄ stack ⇄ focus
let focused = null;
let returnTo = 'open';
const hud = $('#hud'), cta = $('#cta'), hint = $('#hint'), stackbar = $('#stackbar');

function returnItem(it, fast = false) {
  if (!it) return;
  const d = T(fast ? 0.5 : 0.9);
  gsap.to(it.obj.position, { x: it.home.p.x, y: it.home.p.y, z: it.home.p.z, duration: d, ease: 'power3.inOut', overwrite: true });
  gsap.to(it.obj.rotation, { x: it.home.r.x, y: it.home.r.y, z: it.home.r.z, duration: d, ease: 'power3.inOut', overwrite: true });
}

function focusCamera(it) {
  // where will the object be once it is pulled out? measure it, then put it back
  const { obj } = it;
  const pose = it.pose(obj);
  const keepP = obj.position.clone(), keepR = obj.rotation.clone();
  obj.position.copy(pose.p); obj.rotation.copy(pose.r);
  obj.updateWorldMatrix(true, false);
  const wp = new V3().setFromMatrixPosition(obj.matrixWorld);
  const q = new THREE.Quaternion().setFromRotationMatrix(obj.matrixWorld);
  obj.position.copy(keepP); obj.rotation.copy(keepR);
  obj.updateWorldMatrix(true, false);
  const n = it.normal.clone().applyQuaternion(q).normalize();
  const k = portrait() ? 1.35 : 1;
  const p = wp.clone().add(n.multiplyScalar(it.dist * k)).add(new V3(0, 0, 0.35));
  return { p, t: wp, pose };
}

function showStackbar(on) {
  stackbar.classList.toggle('is-on', on);
  gsap.to(stackbar, { opacity: on ? 1 : 0, y: on ? 0 : -10, duration: T(0.5), ease: 'power2.out' });
}

async function focusItem(id, html) {
  if (state === 'intro' || state === 'opening') return;
  if (state === 'closed') await openCase();
  const it = items[id];
  if (focused && focused !== it) returnItem(focused, true);
  returnTo = id.startsWith('f') && (state === 'stack' || (state === 'focus' && returnTo === 'stack')) ? 'stack' : 'open';
  focused = it;
  state = 'focus';
  showLabels(false);
  showStackbar(false);
  gsap.to(hint, { opacity: 0, duration: T(0.3) });
  tip.classList.remove('is-on');

  const { p, t, pose } = focusCamera(it);
  const lift = gsap.timeline();
  if (id.startsWith('f')) {
    // folders leave the stack upwards first, so they clear the others
    lift.to(it.obj.position, { y: 0.75, duration: T(0.45), ease: 'power2.out' })
      .to(it.obj.position, { x: pose.p.x, y: pose.p.y, z: pose.p.z, duration: T(0.9), ease: 'power3.inOut' })
      .to(it.obj.rotation, { x: pose.r.x, y: pose.r.y, z: pose.r.z, duration: T(0.9), ease: 'power3.inOut' }, '<');
  } else {
    lift.to(it.obj.position, { x: pose.p.x, y: pose.p.y, z: pose.p.z, duration: T(1.1), ease: 'power3.inOut' })
      .to(it.obj.rotation, { x: pose.r.x, y: pose.r.y, z: pose.r.z, duration: T(1.1), ease: 'power3.inOut' }, '<');
  }
  fillSheet(html);
  showSheet();
  const shift = portrait()
    ? { sx: 0, sy: (sheet.offsetHeight || innerHeight * 0.8) / 2 }
    : { sx: (sheet.offsetWidth || innerWidth * 0.48) / 2, sy: 0 };
  gsap.to(rig, { ...shift, par: 0.3, duration: T(1.4), ease: 'power3.inOut' });
  flyTo({ p, t }, 1.5);
}

function openProject(i) { focusItem(`f${i}`, projectHTML(i)); setActive('proyectos'); }
function openSection(s) {
  const id = { sobre: 'card', experiencia: 'cv', contacto: 'envelope' }[s];
  focusItem(id, SECTIONS[s]());
  setActive(s);
}
function go(where) {
  if (where === 'proyectos') enterStack();
  else if (where === 'reel') openProject(REEL[reelIndex]);
  else openSection(where);
}
function setActive(s) {
  document.querySelectorAll('.hud__nav button').forEach((b) => b.classList.toggle('is-active', b.dataset.go === s));
}

// projects: first get close to the folders so every label reads, then pick one
async function enterStack() {
  if (state === 'intro' || state === 'opening') return;
  if (state === 'closed') await openCase();
  if (state === 'focus') {
    returnItem(focused);
    focused = null;
    hideSheet();
    gsap.to(rig, { sx: 0, sy: 0, par: 1, duration: T(1.3), ease: 'power3.inOut' });
  }
  state = 'stack';
  hoverOff();
  showLabels(false);
  gsap.to(hint, { opacity: 0, duration: T(0.3) });
  showStackbar(true);
  setActive('proyectos');
  await flyTo(stackView(), 1.5);
}
async function exitStack() {
  if (state !== 'stack') return;
  state = 'open';
  hoverOff();
  showStackbar(false);
  setActive(null);
  await flyTo(view('open'), 1.4);
  if (state === 'open') { showLabels(true); gsap.to(hint, { opacity: 1, duration: T(0.6) }); }
}

async function unfocus() {
  if (state === 'stack') return exitStack();
  if (state !== 'focus') return;
  returnItem(focused);
  focused = null;
  hideSheet();
  gsap.to(rig, { sx: 0, sy: 0, par: 1, duration: T(1.3), ease: 'power3.inOut' });
  if (returnTo === 'stack') {
    state = 'stack';
    showStackbar(true);
    setActive('proyectos');
    await flyTo(stackView(), 1.4);
    return;
  }
  state = 'open';
  setActive(null);
  await flyTo(view('open'), 1.4);
  if (state === 'open') { showLabels(true); gsap.to(hint, { opacity: 1, duration: T(0.6) }); }
}

// the lid stops short of vertical so it never swings back into the chest
const LID_OPEN = -1.33;
let openPromise = null;
function openCase() {
  if (openPromise) return openPromise;
  if (state !== 'closed') return Promise.resolve();
  state = 'opening';
  hoverOff();
  gsap.to(cta, { opacity: 0, y: 20, duration: T(0.4), onComplete: () => cta.classList.remove('is-on') });
  // the hands slide to the latches, flick them, take the lid by its sides and lift it
  const tl = gsap.timeline();
  tl.to(chest.rotation, { x: 0.16, duration: T(0.6), ease: 'power2.inOut' }, 0)
    .to(leanAmt, { v: 0.16, duration: T(0.8), ease: 'power2.inOut' }, 0)
    .add(() => { handTo('L', SUPPORT, 0.7); setHandPose('R', 'side'); handVia('R', OUTSIDE(1), FRONT(1), 0.35, 0.4); }, 0)
    .add(() => sfx.latch(), T(0.78))
    .to(flaps.map((f) => f.rotation), { x: 1.05, duration: T(0.26), ease: 'back.out(3)', stagger: 0.14 }, T(0.75))
    .add(() => { setHandPose('R', 'lid'); handTo('R', LIDSIDE(1), 0.55); }, T(1.15))
    .add(() => sfx.creak(), T(1.7))
    .to(lidPivot.rotation, { x: -0.06, duration: T(0.2), ease: 'power2.out' }, T(1.7))
    .to(lidPivot.rotation, { x: LID_OPEN - 0.05, duration: T(1.7), ease: 'power3.inOut' }, T(1.9))
    .to(leanAmt, { v: 0.04, duration: T(1.4), ease: 'power2.inOut' }, '<.3')
    .to(lidPivot.rotation, { x: LID_OPEN, duration: T(0.4), ease: 'sine.out' })
    .add(() => { handTo('L', SIDE(-1), 0.9); handVia('R', OUTSIDE(1), SIDE(1), 0.5, 0.5); gsap.delayedCall(T(0.45), () => setHandPose('R', 'tray')); }, '-=.3')
    .to(chest.rotation, { x: 0.05, duration: T(0.9), ease: 'power2.inOut' }, '<');
  playReel(0);
  openPromise = Promise.all([tl.then(), flyTo(view('open'), 3.2, 'power3.inOut')]).then(() => {
    state = 'open';
    showLabels(true);
    gsap.to(hint, { opacity: 1, duration: T(0.8), delay: 0.2 });
  });
  return openPromise;
}

function closeCase() {
  if (state !== 'open') return;
  state = 'closing';
  hoverOff();
  showLabels(false);
  gsap.to(hint, { opacity: 0, duration: T(0.3) });
  reelVideo.pause();
  const tl = gsap.timeline();
  tl.add(() => { handTo('L', SUPPORT, 0.6); handVia('R', OUTSIDE(1), LIDSIDE(1), 0.3, 0.4); gsap.delayedCall(T(0.25), () => setHandPose('R', 'lid')); }, 0)
    .to(leanAmt, { v: 0.08, duration: T(0.6), ease: 'power2.inOut' }, 0)
    .to(lidPivot.rotation, { x: -0.1, duration: T(1.3), ease: 'power2.inOut' }, T(0.65))
    .to(leanAmt, { v: 0.16, duration: T(1.3), ease: 'power2.inOut' }, '<')
    .to(lidPivot.rotation, { x: 0, duration: T(0.16), ease: 'power2.in' })
    .add(() => sfx.thud())
    .add(() => { setHandPose('R', 'side'); handTo('R', FRONT(1), 0.45); })
    .to(flaps.map((f) => f.rotation), { x: 0, duration: T(0.18), ease: 'power2.in', stagger: 0.12 }, `+=${T(0.4)}`)
    .add(() => sfx.latch(), '<')
    .add(() => { handTo('L', SIDE(-1), 0.8); handVia('R', OUTSIDE(1), SIDE(1), 0.35, 0.45); gsap.delayedCall(T(0.3), () => setHandPose('R', 'tray')); }, `+=${T(0.15)}`)
    .to(leanAmt, { v: 0, duration: T(0.8), ease: 'power2.inOut' }, '<')
    .to(chest.rotation, { x: 0, duration: T(0.8), ease: 'power2.inOut' }, '<');
  flyTo(view('closed'), 2.8);
  tl.then(() => {
    state = 'closed';
    openPromise = null;
    cta.classList.add('is-on');
    gsap.to(cta, { opacity: 1, y: 0, duration: T(0.8), ease: 'expo.out' });
  });
}

/* =========================================================
   Intro: a figure walks out of the haze, presents the case
   ========================================================= */
const haze = $('#haze');
let introTL = null, presented = false;
function lightsOn() {
  const tl = gsap.timeline();
  tl.to(lamp, { intensity: LAMP_ON * 0.45, duration: T(0.06) })
    .to(lamp, { intensity: 0, duration: T(0.08) })
    .to(lamp, { intensity: LAMP_ON * 0.8, duration: T(0.05) }, `+=${T(0.12)}`)
    .to(lamp, { intensity: LAMP_ON * 0.15, duration: T(0.07) })
    .to(lamp, { intensity: LAMP_ON, duration: T(0.5), ease: 'power2.out' }, `+=${T(0.08)}`)
    .to(hemi, { intensity: 0.12, duration: T(2.2), ease: 'power2.out' }, '<')
    .to(rim, { intensity: 0.7, duration: T(2.2), ease: 'power2.out' }, '<')
    .to(rim.color, { r: 0.37, g: 0.92, b: 0.83, duration: T(2.2) }, '<')
    .to(dustMat, { opacity: 0.55, duration: T(2.5) }, '<')
    .to(scene.fog.color, { r: 0.012, g: 0.014, b: 0.02, duration: T(2.2) }, '<')
    .to(haze, { opacity: 0, duration: T(2.4), ease: 'power2.inOut' }, '<')
    .to(canvas, { filter: 'grayscale(0) contrast(1) blur(0px)', duration: T(2.4), ease: 'power2.inOut' }, '<')
    .to({ k: 0.25 }, { k: 0.85, duration: T(2.2), ease: 'power2.out', onUpdate() { setEnv(this.targets()[0].k); } }, '<');
  return tl;
}
function presentCase() {
  if (presented) return;
  presented = true;
  rig.follow = false;
  walk.z = PERSON_Z;
  document.body.classList.add('is-lit');   // phones: the dark band over the head comes in as the camera moves
  // frames may have been skipped (skip button, background tab): settle the pose before lifting the case
  updateChar();
  if (char) char.mixer.update(0);
  scene.updateMatrixWorld(true);
  updateBody();
  mode = 'present';
  const other = CARRY === 'R' ? 'L' : 'R';
  if (char) {
    const b = char.bones[CARRY];
    caseG.updateWorldMatrix(true, true);
    const rel = caseG.worldToLocal(b.hand.getWorldPosition(new V3()));
    handSet(CARRY, at(caseG, rel.x, rel.y, rel.z));
    handLock = { k: CARRY, rel: caseG.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(b.hand.getWorldQuaternion(new THREE.Quaternion())) };
  } else {
    handTo(CARRY, gripWrist, 0.35);
  }
  setHandPose(CARRY, null);
  handTo(other, SIDE(other === 'L' ? -1 : 1), 1.2).delay(T(0.55));
  gsap.delayedCall(T(0.55), () => setHandPose(other, 'tray'));
  gsap.to(ikW, { [CARRY]: 1, duration: T(0.35), ease: 'power2.out' });
  gsap.to(ikW, { [other]: 1, duration: T(0.8), delay: T(0.5), ease: 'power2.inOut' });
  gsap.to(handleG.rotation, { x: 1.45, duration: T(1.8), ease: 'power2.inOut' });
  gsap.to(present, {
    t: 1, duration: T(1.9), ease: 'power2.inOut',
    onComplete: () => {
      updatePresent(); mode = 'held'; handLock = null;
      const sg = CARRY === 'L' ? -1 : 1;
      setHandPose(CARRY, 'side');
      handPath(CARRY, [FRONT_CORNER(sg), OUTSIDE(sg), SIDE(sg)], [0.35, 0.4, 0.4]);
      gsap.delayedCall(T(0.7), () => setHandPose(CARRY, 'tray'));
    },
  });
  gsap.delayedCall(T(1.0), lightsOn);
  flyTo(view('closed'), 3.4, 'power3.inOut');
  gsap.timeline({ delay: T(2.6) })
    .add(() => { state = 'closed'; hud.classList.add('is-on'); cta.classList.add('is-on'); })
    .to(hud, { opacity: 1, duration: T(1) })
    .fromTo(cta, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: T(1), ease: 'expo.out' }, '<.2');
}
function skipIntro() {
  if (introTL) introTL.progress(1, false);
  gsap.to(['#line1', '#line2'], { opacity: 0, duration: 0.3 });
  $('#skip').style.display = 'none';
}
$('#skip').addEventListener('click', skipIntro);

async function boot() {
  gsap.to('#loadBar', { scaleX: 0.85, duration: 2, ease: 'power2.out' });
  char = await Promise.race([loadCharacter(), new Promise((r) => setTimeout(() => r(null), 12000))]);
  if (char) {
    if (!char.carriedByAnim) ikW[CARRY] = 1;   // no briefcase clip: the IK holds the case
    char.mixer.update(0);
    scene.updateMatrixWorld(true);
  }
  setEnv(0.25);
  renderer.compile(scene, camera);
  handSet('L', () => walkHand.L);
  handSet('R', () => walkHand.R);
  gsap.to('#loadBar', { scaleX: 1, duration: 0.4, ease: 'power2.out' });
  gsap.to('.intro__load', { opacity: 0, duration: 0.5, delay: 0.4 });
  gsap.to('#intro', { backgroundColor: 'rgba(0,0,0,0)', duration: 1.6, delay: 0.3, ease: 'power2.inOut' });
  introTL = gsap.timeline({ delay: 0.3 });
  // steady pace out of the haze, then a short slowdown into the final step
  introTL.to(walk, { z: PERSON_Z - 1.6, duration: reduced ? 0.01 : 6.0, ease: 'none' }, 0)
    .to(walk, { z: PERSON_Z, duration: reduced ? 0.01 : 1.1, ease: 'power2.out' }, reduced ? 0.01 : 6.0)
    .fromTo('#line1', { opacity: 0, y: 14, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out' }, 1.0)
    .fromTo('#line2', { opacity: 0, y: 18, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.3, ease: 'expo.out' }, 2.8)
    .to(['#line1', '#line2'], { opacity: 0, y: -10, filter: 'blur(6px)', duration: 0.8, ease: 'power2.in', stagger: 0.08 }, 6.0)
    .add(presentCase, 6.8)
    .add(() => { $('#intro').style.pointerEvents = 'none'; $('#skip').style.display = 'none'; }, 6.8);
  if (reduced || window.__skipIntro) skipIntro();
}

/* =========================================================
   Pointer: hover + click
   ========================================================= */
const ray = new THREE.Raycaster();
const ptr = new THREE.Vector2(9, 9);
const ptrPx = { x: 0, y: 0 };
const par = { x: 0, y: 0 };
let hovered = null;
function pick() {
  ray.setFromCamera(ptr, camera);
  const hit = ray.intersectObjects(hitList, true).find((h) => h.object.isMesh && h.object.userData.hit);
  return hit ? hit.object.userData.hit : null;
}
function hoverOff() {
  if (hovered && items[hovered]?.hover) items[hovered].hover(items[hovered].obj, false);
  hovered = null;
  document.body.classList.remove('is-hover');
  tip.classList.remove('is-on');
}
function updateHover() {
  if (state !== 'open' && state !== 'closed' && state !== 'stack') return;
  let id = pick();
  if (state === 'closed' && id) id = 'case';
  else if (id === 'case') id = null;
  if (state !== 'open' && id === 'lid') id = null;
  if (state === 'stack' && id && !id.startsWith('f')) id = null;
  if (id === hovered) return;
  hoverOff();
  if (!id) return;
  hovered = id;
  document.body.classList.add('is-hover');
  if (id === 'case') { tip.textContent = 'Abrir el portafolio'; tip.classList.add('is-on'); return; }
  if (id === 'lid') { tip.textContent = 'Mantén presionado para cerrar'; tip.classList.add('is-on'); return; }
  const it = items[id];
  it.hover?.(it.obj, true);
  tip.textContent = typeof it.tip === 'function' ? it.tip() : it.tip;
  tip.classList.add('is-on');
}
addEventListener('pointermove', (e) => {
  ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ptrPx.x = e.clientX; ptrPx.y = e.clientY;
  par.x = ptr.x; par.y = ptr.y;
  if (e.target === canvas) updateHover();
  else if (hovered) hoverOff();
});
let down = null;
// press and hold on the lid to close the case
lid.traverse((o) => { if (o.isMesh && o.userData.hit === 'case') o.userData.hit = 'lid'; });
const holdEl = $('#hold');
const hold = { p: 0, tween: null };
function cancelHold() {
  if (!hold.tween) return;
  hold.tween.kill(); hold.tween = null;
  gsap.to(hold, { p: 0, duration: 0.25, onUpdate: drawHold, onComplete: () => holdEl.classList.remove('is-on') });
}
function drawHold() { holdEl.style.setProperty('--p', hold.p); }
canvas.addEventListener('pointerdown', (e) => {
  down = { x: e.clientX, y: e.clientY };
  ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  if (state === 'open' && pick() === 'lid') {
    holdEl.style.left = e.clientX + 'px'; holdEl.style.top = e.clientY + 'px';
    holdEl.classList.add('is-on');
    hold.tween = gsap.fromTo(hold, { p: 0 }, {
      p: 1, duration: 0.85, ease: 'none', onUpdate: drawHold,
      onComplete: () => { hold.tween = null; holdEl.classList.remove('is-on'); down = null; closeCase(); },
    });
  }
});
canvas.addEventListener('pointerleave', cancelHold);
canvas.addEventListener('pointerup', (e) => {
  if (hold.tween) { cancelHold(); return; }
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) return;
  ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  if (state === 'focus') { unfocus(); return; }
  const id = pick();
  if (state === 'closed') { if (id) openCase(); return; }
  if (state === 'stack') { if (id && id.startsWith('f')) items[id].click?.(); return; }
  if (state === 'open' && id && id !== 'case' && id !== 'lid') items[id].click?.();
});
$('#openBtn').addEventListener('click', () => { if (state === 'closed') openCase(); });
$('#close').addEventListener('click', unfocus);
$('#stackBack').addEventListener('click', exitStack);
$('#brand').addEventListener('click', (e) => { e.preventDefault(); if (state === 'focus' || state === 'stack') { returnTo = 'open'; if (state === 'stack') exitStack(); else unfocus(); } });
document.querySelectorAll('.hud__nav button').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') unfocus();
  if (state === 'focus' && focused?.id.startsWith('f') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
    const i = +focused.id.slice(1), n = PROJECTS.length;
    openProject((i + (e.key === 'ArrowRight' ? 1 : n - 1)) % n);
  }
});

/* =========================================================
   Resize & loop
   ========================================================= */
function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.fov = portrait() ? 48 : 35;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  if (state === 'closed') { const v = view('closed'); rig.p.copy(v.p); rig.t.copy(v.t); }
  if (state === 'open') { const v = view('open'); rig.p.copy(v.p); rig.t.copy(v.t); }
  if (state === 'stack') { const v = stackView(); rig.p.copy(v.p); rig.t.copy(v.t); }
}
addEventListener('resize', resize);
resize();

const clock = new THREE.Clock();
const tmp = new V3();
let lastT = 0;
const parSmooth = { x: 0, y: 0 };
function frame() {
  const time = clock.getElapsedTime();
  const dt = Math.min(time - lastT, 0.1);
  lastT = time;

  updateChar();
  if (mode === 'walk' || mode === 'present') updateBody();
  if (mode === 'present') updatePresent();
  if (rig.follow) rig.t.set(portrait() ? 0.3 : -3.2, FLOOR_Y + 10.8, walk.z);

  parSmooth.x += (par.x - parSmooth.x) * 0.04;
  parSmooth.y += (par.y - parSmooth.y) * 0.04;
  camera.position.copy(rig.p);
  camera.position.x += parSmooth.x * 0.35 * rig.par;
  camera.position.y += parSmooth.y * 0.2 * rig.par;
  camera.lookAt(rig.t);
  // in the intro the haze swallows the far figure; later the fog only hides the void
  const camDist = camera.position.distanceTo(rig.t);
  scene.fog.near = rig.follow ? 14 : camDist + 2;
  scene.fog.far = rig.follow ? 75 : camDist + 22;
  if (rig.sx || rig.sy) camera.setViewOffset(innerWidth, innerHeight, rig.sx, rig.sy, innerWidth, innerHeight);
  else camera.clearViewOffset();

  // arms follow their hand targets
  scene.updateMatrixWorld();
  if (char) {
    char.mixer.update(dt);
    char.root.updateMatrixWorld(true);
    // lean the upper body over the case when the hands need to reach
    for (const sp of char.spine) rotateWorld(sp, XAXIS, leanAmt.v / char.spine.length);
  }
  scene.updateMatrixWorld();
  for (const k of ['L', 'R']) {
    const h = hands[k];
    if (h.from && h.t < 1) h.cur.copy(h.from()).lerp(h.to(), h.t);
    else h.cur.copy(h.to());
    if (!char) { solveArm(arms[k], h.cur); continue; }
    const b = char.bones[k];
    boneIK(b, h.cur, ikW[k]);
    if (handLock && handLock.k === k) {
      // keep the hand's rotation glued to the case it holds
      const want = caseG.getWorldQuaternion(new THREE.Quaternion()).multiply(handLock.rel);
      const parentQ = b.hand.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
      b.hand.quaternion.slerp(parentQ.multiply(want), ikW[k]);
      b.hand.updateMatrixWorld(true);
      continue;
    }
    const hp = handPose[k], tgt = hp.target ? hp.target(b.side) : null;
    // while a pose drives the hand, fingers start from their straight bind pose: no animated finger noise
    // smoothing in real time, so it behaves the same at any frame rate
    const kFix = 1 - Math.exp(-dt * 7), kAim = 1 - Math.exp(-dt * 7), kCurl = 1 - Math.exp(-dt * 6);
    hp.fix = (hp.fix || 0) + ((tgt ? 1 : 0) - (hp.fix || 0)) * kFix;
    const fw = hp.fix * ikW[k];
    if (fw > 0.001) {
      b.fingers.forEach((c, i) => c.forEach((x, j) => x.quaternion.slerp(b.fingerBind[i][j], fw)));
      b.thumb.forEach((x, j) => x.quaternion.slerp(b.thumbBind[j], fw * 0.6));
      b.hand.updateMatrixWorld(true);
    }
    if (tgt) {
      hp.aim.lerp(tgt.aim.normalize(), kAim).normalize();
      hp.palm.lerp(tgt.palm.normalize(), kAim).normalize();
      hp.curl += (tgt.curl - hp.curl) * kCurl;
      orientHand(b, hp.aim, hp.palm, ikW[k]);
    } else {
      hp.curl += (0 - hp.curl) * kCurl;
    }
    curlFingers(b, hp.curl * ikW[k]);
  }

  // dust
  const pos = dustGeo.attributes.position.array;
  for (let i = 0; i < DUST; i++) {
    pos[i * 3] += dustVel[i * 3] + Math.sin(time * 0.3 + i) * 0.0006;
    pos[i * 3 + 1] += dustVel[i * 3 + 1];
    pos[i * 3 + 2] += dustVel[i * 3 + 2];
    if (pos[i * 3 + 1] > 7) pos[i * 3 + 1] = -2;
    if (pos[i * 3 + 1] < -2) pos[i * 3 + 1] = 7;
  }
  dustGeo.attributes.position.needsUpdate = true;

  // labels anchored to objects
  if (labelState.o > 0.01) {
    labelsEl.style.display = '';
    LABELS.forEach((l) => {
      l.parent.localToWorld(tmp.copy(l.at));
      tmp.project(camera);
      const x = (tmp.x * 0.5 + 0.5) * innerWidth, y = (-tmp.y * 0.5 + 0.5) * innerHeight;
      l.el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      l.el.style.opacity = labelState.o;
    });
  } else {
    labelsEl.style.display = 'none';
  }
  tip.style.left = ptrPx.x + 'px';
  tip.style.top = ptrPx.y + 'px';

  // while a dossier is being read, the scene behind is still: draw it at half rate so scrolling stays smooth
  const camMoving = gsap.isTweening(rig.p) || gsap.isTweening(rig.t) || gsap.isTweening(rig);
  skip = sheetOpen && !camMoving ? !skip : false;
  if (!skip) renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
let skip = false;
requestAnimationFrame(frame);
boot();
window.portafolio = { go, unfocus, openCase, enterStack, skipIntro };

// two-finger zoom would magnify the page and push the 3D scene and its labels out of place
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });

/* sound: starts with the first click or key (browser rule); the choice to mute is remembered */
const soundBtn = $('#soundBtn');
try { if (localStorage.getItem('portafolio-sound') === 'off') music.setEnabled(false); } catch (e) { /* storage blocked */ }
function paintSound() {
  soundBtn.setAttribute('aria-pressed', String(music.enabled));
  soundBtn.querySelector('span').textContent = music.enabled ? 'Sonido' : 'Silencio';
}
paintSound();
const unlockAudio = () => music.unlock();
addEventListener('pointerdown', unlockAudio, { capture: true });
addEventListener('keydown', unlockAudio, { capture: true });
soundBtn.addEventListener('click', () => {
  music.unlock();
  music.setEnabled(!music.enabled);
  try { localStorage.setItem('portafolio-sound', music.enabled ? 'on' : 'off'); } catch (e) { /* storage blocked */ }
  paintSound();
});
