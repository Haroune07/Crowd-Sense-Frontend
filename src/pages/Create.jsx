import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar.jsx';
import PickMap from '../components/PickMap.jsx';
import { api } from '../lib/api.js';
import { saveSession } from '../lib/session.js';

export default function Create() {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ name: '', date: today, time: '10:00', place: '', description: '' });
  const [point, setPoint] = useState({ lat: 45.5155, lng: -73.5606 }); // Place Émilie-Gamelin by default
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function create(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { manifestation, accessToken } = await api.createManif({
        name: form.name,
        description: [form.place, form.description].filter(Boolean).join(' · '),
        startsAt: new Date(form.date + 'T' + form.time).toISOString(),
        meetingLat: point.lat,
        meetingLng: point.lng,
      });
      saveSession({ token: accessToken, manif: manifestation });
      saveSession({ user: await api.me() });
      navigate('/code');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={create} className="page with-actionbar">
      <TopBar title="Create a protest" back="/start" />
      <div className="in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="lab" htmlFor="n">Name</label><input className="inp" id="n" value={form.name} onChange={set('name')} required placeholder="Grève 14 novembre" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          <div><label className="lab" htmlFor="d">Date</label><input className="inp num" id="d" type="date" value={form.date} onChange={set('date')} required /></div>
          <div><label className="lab" htmlFor="t">Start time</label><input className="inp num" id="t" type="time" value={form.time} onChange={set('time')} required /></div>
        </div>
        <div>
          <span className="lab">Meeting point</span>
          <div className="card" style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <PickMap value={point} onPick={setPoint} place={form.place} onPlace={(place) => setForm((f) => ({ ...f, place }))} height={260} />
          </div>
        </div>
        <div><label className="lab" htmlFor="desc">Description</label><textarea className="inp" id="desc" rows={3} value={form.description} onChange={set('description')} /></div>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="actionbar"><button className="btn btn-ink" disabled={busy}>Create the protest</button></div>
    </form>
  );
}
