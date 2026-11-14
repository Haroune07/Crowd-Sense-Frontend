import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { getSession } from '../lib/session.js';

export default function Code() {
  const manif = getSession().manif;
  const [copied, setCopied] = useState(false);

  async function share() {
    const text = `Join "${manif.name}" on Crowd-Sense with the code ${manif.code}`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(manif.code);
      setCopied(true);
    }
  }

  return (
    <div className="mesh" style={{ minHeight: '100dvh', padding: '110px 16px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="in" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 6px' }}>
        <span className="glass" style={{ width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E7A5A' }}>
          <Icon name="check" size={28} stroke={2.6} />
        </span>
        <h1 className="disp" style={{ fontSize: 40 }}>Your protest<span>is ready</span></h1>
        <p className="copy num" style={{ fontSize: 17 }}>{manif.name} · {new Date(manif.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      <div className="glass in2" style={{ borderRadius: 26, padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Code to share</span>
        <div className="code-cells">{manif.code.split('').map((c, i) => <span key={i} className="cell">{c}</span>)}</div>
        <p className="copy" style={{ fontSize: 14 }}>Also on your profile.</p>
      </div>
      <div className="in3" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button type="button" className="btn btn-ink" onClick={share}><Icon name="share" size={20} />{copied ? 'Code copied' : 'Share the code'}</button>
        <Link to="/map" className="btn btn-line">Go to the map</Link>
      </div>
    </div>
  );
}
