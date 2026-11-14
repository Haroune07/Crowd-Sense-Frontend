// Demo mode: fake backend that lives in memory. Same functions as the real API in api.js,
// so screens don't know the difference. Used when VITE_API_URL is empty.
import { DEMO_POINTS } from './demoPoints.js';

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();
let nextId = 100;

const db = {
  user: { id: 'u1', displayName: 'Sam', email: 'sam@cegep.qc.ca', role: 'protester' },
  manif: {
    id: 'm1',
    name: 'Grève 14 novembre',
    description: 'Peaceful march to the Ministry of Education.',
    startsAt: new Date().toISOString(),
    meetingLat: 45.5155,
    meetingLng: -73.5606,
    code: 'K7P2QX',
  },
  points: [...DEMO_POINTS],
  pending: [
    { id: 'r1', lat: 45.51390, lng: -73.56040, dangerLevel: 4, description: 'Windows broken near the bank', createdAt: minutesAgo(1) },
    { id: 'r2', lat: 45.51396, lng: -73.56031, dangerLevel: 4, description: 'Police lines forming', createdAt: minutesAgo(2) },
    { id: 'r3', lat: 45.51402, lng: -73.56045, dangerLevel: 3, description: 'People running toward Berri', createdAt: minutesAgo(3) },
    { id: 'r4', lat: 45.51388, lng: -73.56048, dangerLevel: 4, description: 'Smoke near the corner', createdAt: minutesAgo(4) },
    { id: 'r5', lat: 45.51395, lng: -73.56038, dangerLevel: 4, description: 'Crowd pushing', createdAt: minutesAgo(4) },
    { id: 'r6', lat: 45.51620, lng: -73.56240, dangerLevel: 3, description: 'Shouting in front of the metro', createdAt: minutesAgo(3) },
    { id: 'r7', lat: 45.51625, lng: -73.56232, dangerLevel: 2, description: 'Lots of people blocking the door', createdAt: minutesAgo(5) },
    { id: 'r8', lat: 45.51340, lng: -73.56380, dangerLevel: 2, description: 'Cars honking, a bit tense', createdAt: minutesAgo(4) },
    { id: 'r9', lat: 45.51790, lng: -73.55860, dangerLevel: 1, description: 'All calm here, music', createdAt: minutesAgo(6) },
  ],
  announcements: [
    { id: 'a1', severity: 'urgent', title: 'Avoid Ste-Catherine', message: 'Things are tense near Saint-Denis. Go around by Rue Berri.', lat: 45.5139, lng: -73.5604, createdAt: minutesAgo(2) },
    { id: 'a2', severity: 'warning', title: 'Meeting point moved', message: 'We now meet at the Berri entrance of the park.', lat: 45.5155, lng: -73.5606, createdAt: minutesAgo(12) },
    { id: 'a3', severity: 'info', title: 'Water at the medic tent', message: 'Free water and first aid next to the fountain.', createdAt: minutesAgo(14) },
    { id: 'a4', severity: 'info', title: 'March starts at 10:30', message: 'We wait for the second group, then we leave together.', createdAt: minutesAgo(48) },
    { id: 'a5', severity: 'warning', title: 'Metro Berri-UQAM is busy', message: 'Use the Saint-Laurent station to arrive or leave.', createdAt: minutesAgo(70) },
    { id: 'a6', severity: 'info', title: 'Bring your student card', message: 'Some places may ask for it.', createdAt: minutesAgo(130) },
  ],
  polls: [
    { id: 'p0', question: 'Move the march to City Hall?', options: ['Yes', 'No'], counts: [26, 15], isActive: true, createdAt: minutesAgo(5) },
    { id: 'p1', question: 'Start the march at 10:00?', options: ['Yes', 'No'], counts: [96, 22], isActive: false, createdAt: minutesAgo(60) },
    { id: 'p2', question: 'Bring signs or banners?', options: ['Yes', 'No'], counts: [62, 35], isActive: false, createdAt: minutesAgo(180) },
    { id: 'p3', question: 'Meet at Émilie-Gamelin?', options: ['Yes', 'No'], counts: [126, 17], isActive: false, createdAt: minutesAgo(1500) },
    { id: 'p4', question: 'Join the Thursday strike?', options: ['Yes', 'No'], counts: [151, 59], isActive: false, createdAt: minutesAgo(4300) },
  ],
};

// Names for the demo zones (the real backend can send `place` too, or the app shows "Zone 1").
const PLACES = [
  { name: 'Rue Sainte-Catherine', lat: 45.5139, lng: -73.5604 },
  { name: 'Métro Berri-UQAM', lat: 45.5162, lng: -73.5624 },
  { name: 'Rue Saint-Denis', lat: 45.5134, lng: -73.5638 },
  { name: 'Village', lat: 45.5179, lng: -73.5586 },
];
function nearestPlace(lat, lng) {
  const dist = (p) => (p.lat - lat) ** 2 + (p.lng - lng) ** 2;
  return PLACES.reduce((best, p) => (dist(p) < dist(best) ? p : best)).name;
}

// Groups pending reports that are within about 100 m (3 decimals of lat/lng).
function groupZones(reports) {
  const zones = {};
  for (const r of reports) {
    const key = r.lat.toFixed(3) + ',' + r.lng.toFixed(3);
    const z = zones[key] || (zones[key] = { zoneKey: key, place: nearestPlace(r.lat, r.lng), lat: r.lat, lng: r.lng, count: 0, maxDanger: 0, latestAt: r.createdAt, reports: [] });
    z.count += 1;
    z.maxDanger = Math.max(z.maxDanger, r.dangerLevel);
    if (r.createdAt > z.latestAt) z.latestAt = r.createdAt;
    z.reports.push({ ...r, photoUrl: null });
  }
  return Object.values(zones).sort((a, b) => b.count - a.count || b.maxDanger - a.maxDanger || (a.latestAt < b.latestAt ? 1 : -1));
}

const token = () => 'demo-token-' + db.user.role;

export async function login() { await wait(); return { accessToken: token() }; }
export async function register(displayName) { await wait(); db.user.displayName = displayName; return { accessToken: token() }; }
export async function me() { await wait(100); return { ...db.user }; }

export async function createManif(data) {
  await wait();
  db.manif = { ...db.manif, ...data, id: 'm' + nextId++, code: Math.random().toString(36).slice(2, 8).toUpperCase() };
  db.user.role = 'organizer';
  return { manifestation: db.manif, accessToken: token() };
}
export async function joinManif(code) {
  await wait();
  if (code.toUpperCase() !== db.manif.code) throw new Error("This code doesn't exist. Check it and try again.");
  db.user.role = 'protester';
  return { manifestation: { ...db.manif, code: undefined }, accessToken: token() };
}
export async function currentManif() { await wait(100); return db.manif; }
export async function leaveManif() { await wait(); db.user.role = 'protester'; return {}; }

export async function heatmap() { await wait(100); return db.points; }
export async function sendReport({ lat, lng, level, note }) {
  await wait(500);
  db.pending.push({ id: 'r' + nextId++, lat, lng, dangerLevel: level, description: note, createdAt: new Date().toISOString() });
  return { ok: true };
}
export async function pendingZones() { await wait(100); return groupZones(db.pending); }
export async function decideZone(ids, status) {
  await wait();
  const decided = db.pending.filter((r) => ids.includes(r.id));
  db.pending = db.pending.filter((r) => !ids.includes(r.id));
  if (status === 'verified') db.points.push(...decided.map((r) => ({ lat: r.lat, lng: r.lng, level: r.dangerLevel })));
  return { ok: true };
}

export async function announcements() { await wait(100); return [...db.announcements].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)); }
export async function createAnnouncement(data) {
  await wait();
  db.announcements.push({ ...data, id: 'a' + nextId++, createdAt: new Date().toISOString() });
  return { ok: true };
}

export async function polls() { await wait(100); return db.polls.map((p) => ({ ...p, counts: [...p.counts] })); }
export async function createPoll(question) {
  await wait();
  db.polls.unshift({ id: 'p' + nextId++, question, options: ['Yes', 'No'], counts: [0, 0], isActive: true, createdAt: new Date().toISOString() });
  return { ok: true };
}
export async function vote(pollId, optionIndex) {
  await wait();
  db.polls.find((p) => p.id === pollId).counts[optionIndex] += 1;
  return { ok: true };
}
export async function closePoll(pollId) {
  await wait();
  db.polls.find((p) => p.id === pollId).isActive = false;
  return { ok: true };
}
