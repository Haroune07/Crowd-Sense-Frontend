import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import TopBar from '../components/TopBar.jsx';
import { api } from '../lib/api.js';

export default function NewPoll() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function publish(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.createPoll(question);
      navigate('/votes');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={publish} className="page with-actionbar">
      <TopBar title="New poll" right={<button type="button" className="icon-btn glass" aria-label="Cancel" onClick={() => navigate('/votes')}><Icon name="close" /></button>} />
      <div className="in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="lab" htmlFor="q">Question</label>
          <textarea className="inp" id="q" rows={2} value={question} onChange={(e) => setQuestion(e.target.value)} required maxLength={120}
            placeholder="Move the march to City Hall?" style={{ fontSize: 17, fontWeight: 500 }} />
        </div>
        <div>
          <span className="lab">What students will see</span>
          <div className="mesh" style={{ borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, border: '1px solid rgba(255,255,255,.8)' }}>
            <h2 style={{ fontSize: 19, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{question || 'Your question'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
              <span className="btn btn-ink" style={{ minHeight: 46, fontSize: 15 }}>Yes</span>
              <span className="btn btn-line" style={{ minHeight: 46, fontSize: 15 }}>No</span>
            </div>
          </div>
        </div>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="actionbar">
        <p className="fine">A quick poll, not an official strike vote.</p>
        <button className="btn btn-ink" disabled={busy}>Publish the poll</button>
      </div>
    </form>
  );
}
