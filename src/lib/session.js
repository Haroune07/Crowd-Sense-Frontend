// Keeps the login token, the user and the protest on the phone (localStorage),
// so reopening the app goes straight to the map.

const KEY = 'crowdsense-session';

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function saveSession(changes) {
  const next = { ...getSession(), ...changes };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

export function isOrganizer() {
  return getSession().user?.role === 'organizer';
}
