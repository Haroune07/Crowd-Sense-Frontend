// Every call to the backend lives here, so screens never use fetch directly.
// If VITE_API_URL is empty, the app runs in demo mode with fake data (see mock.js).
import { getSession } from './session.js';
import * as mock from './mock.js';

// VITE_API_URL=https://backend-link -> that backend. VITE_API_URL=/ -> same address (dev proxy).
const RAW_URL = import.meta.env.VITE_API_URL || '';
const API_URL = RAW_URL.replace(/\/$/, '');
export const DEMO = !RAW_URL;

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = getSession().token;
  if (token) headers.Authorization = 'Bearer ' + token;
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(API_URL + '/api' + path, {
    method,
    headers,
    body: form || (body ? JSON.stringify(body) : undefined),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
    throw new Error(message || 'Something went wrong (' + res.status + ').');
  }
  return data;
}

// Photos are saved by the backend in /uploads; make the link work from the frontend.
function photoLink(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : API_URL + (url.startsWith('/') ? url : '/uploads/' + url);
}

// The backend accepts danger levels 1 to 5; the app shows 4 levels, so 5 counts as Danger (4).
const toLevel = (n) => Math.min(Math.max(Number(n) || 1, 1), 4);

const real = {
  // ── account ──
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (displayName, email, password) =>
    request('/auth/register', { method: 'POST', body: { displayName, email, password } }),
  me: () => request('/auth/me'),

  // ── protests ──
  createManif: (data) => request('/manifestations', { method: 'POST', body: data }),
  joinManif: (code) => request('/manifestations/join', { method: 'POST', body: { code } }),
  currentManif: () => request('/manifestations/current'),
  leaveManif: () => request('/manifestations/leave', { method: 'POST' }),

  // ── reports and map ──
  heatmap: async () => {
    const points = await request('/reports/heatmap');
    return points.map((p) => ({ lat: p.lat, lng: p.lng, level: toLevel(p.dangerLevel) }));
  },
  sendReport: ({ lat, lng, level, note, photo }) => {
    const form = new FormData();
    form.append('lat', lat);
    form.append('lng', lng);
    form.append('dangerLevel', level);
    if (note) form.append('description', note);
    if (photo) form.append('photo', photo, 'report.jpg');
    return request('/reports', { method: 'POST', form });
  },
  pendingZones: async () => {
    const zones = await request('/reports/pending');
    return zones.map((z) => ({
      ...z,
      maxDanger: toLevel(z.maxDanger),
      reports: z.reports.map((r) => ({ ...r, dangerLevel: toLevel(r.dangerLevel), photoUrl: photoLink(r.photoUrl) })),
    }));
  },
  decideZone: (ids, status) => request('/reports/verify-many', { method: 'PATCH', body: { ids, status } }),

  // ── announcements ──
  announcements: () => request('/announcements'),
  createAnnouncement: (data) => request('/announcements', { method: 'POST', body: data }),

  // ── polls ──
  polls: () => request('/polls'),
  createPoll: (question) => request('/polls', { method: 'POST', body: { question, options: ['Yes', 'No'] } }),
  vote: (pollId, optionIndex) => request('/polls/' + pollId + '/vote', { method: 'POST', body: { optionIndex } }),
  closePoll: (pollId) => request('/polls/' + pollId + '/close', { method: 'PATCH' }),
};

export const api = DEMO ? mock : real;
