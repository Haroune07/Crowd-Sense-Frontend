import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import TopBar from '../components/TopBar.jsx';
import { api } from '../lib/api.js';
import { LEVELS } from '../lib/levels.js';
import { getPosition, shrinkPhoto } from '../lib/util.js';

// The Urgence flow: location + photo + how bad it is, sent to the organizers.
export default function Report() {
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [position, setPosition] = useState(null);
  const [photo, setPhoto] = useState(null); // the shrunk photo (a Blob)
  const [preview, setPreview] = useState('');
  const [level, setLevel] = useState(4);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Ask for the location as soon as the screen opens, then open the camera.
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    getPosition().then(setPosition).catch((e) => setError(e.message));
    fileInput.current?.click();
  }, []);

  async function onPhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const small = await shrinkPhoto(file);
    setPhoto(small);
    setPreview(URL.createObjectURL(small));
  }

  async function send() {
    if (!position) return setError('We need your location to place the report. Allow it in your browser settings.');
    setBusy(true);
    setError('');
    try {
      await api.sendReport({ ...position, level, note, photo });
      navigate('/map', { state: { toast: 'Sent. An organizer will check it.' } });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="page with-actionbar">
      <TopBar title="Report an urgence" right={<button type="button" className="icon-btn glass" aria-label="Cancel" onClick={() => navigate('/map')}><Icon name="close" /></button>} />

      <input ref={fileInput} type="file" accept="image/*" capture="environment" onChange={onPhoto} hidden />
      <div className="photo in" style={{ height: 250 }}>
        {preview ? <img src={preview} alt="Your photo" /> : (
          <button type="button" onClick={() => fileInput.current.click()} style={{ background: 'none', border: 0, color: '#CBD5E1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <Icon name="camera" size={40} stroke={1.6} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Take a photo</span>
          </button>
        )}
        <span className="chip glass" style={{ position: 'absolute', left: 12, bottom: 12, height: 32, color: 'var(--ink)' }}>
          <Icon name="pin" size={15} stroke={2.2} />{position ? 'Location attached' : 'Finding you…'}
        </span>
        {preview && (
          <button type="button" className="chip glass" onClick={() => fileInput.current.click()} style={{ position: 'absolute', right: 12, bottom: 12, height: 32, color: 'var(--ink)', cursor: 'pointer' }}>Retake</button>
        )}
      </div>

      <div className="in2">
        <span className="lab" style={{ fontSize: 15 }}>How bad is it?</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          {LEVELS.map((l) => {
            const on = level === l.value;
            return (
              <button key={l.id} type="button" aria-pressed={on} onClick={() => setLevel(l.value)}
                style={{ minHeight: 56, borderRadius: 16, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: on ? l.soft : '#fff', border: on ? `2px solid ${l.text}` : '1px solid var(--line)', color: on ? l.text : 'var(--ink)' }}>
                <span className="dot" style={{ width: 12, height: 12, background: l.color }} />{l.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="in3">
        <label className="lab" htmlFor="note">Short note <span className="copy" style={{ fontWeight: 500 }}>(optional)</span></label>
        <input className="inp" id="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={140} placeholder="What do you see?" />
      </div>
      {error && <p className="error">{error}</p>}

      <div className="actionbar">
        <p className="fine" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Icon name="lock" size={16} />Only organizers see the photo. It is deleted after review.</p>
        <button type="button" className="btn btn-red" onClick={send} disabled={busy}><Icon name="send" size={20} stroke={2.2} />{busy ? 'Sending…' : 'Send to organizers'}</button>
      </div>
    </div>
  );
}
