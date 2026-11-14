import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Nav from '../components/Nav.jsx';
import TopBar, { Avatar } from '../components/TopBar.jsx';
import { api } from '../lib/api.js';
import { isOrganizer } from '../lib/session.js';
import { usePolling } from '../lib/usePolling.js';
import { timeAgo } from '../lib/util.js';

// Remembers on this phone which polls we voted on (and what), so we show results after voting.
const MY_VOTES = 'crowdsense-my-votes';
const readVotes = () => JSON.parse(localStorage.getItem(MY_VOTES) || '{}');

function percent(poll) {
  const total = poll.counts.reduce((a, b) => a + b, 0);
  return { total, yes: total ? Math.round((poll.counts[0] / total) * 100) : 0 };
}

function Bar({ label, value, color }) {
  return (
    <div>
      <div className="num" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600 }}><span>{label}</span><span>{value}%</span></div>
      <div className="bar-track"><div className="bar-fill" style={{ width: Math.max(value, 4) + '%', background: color }} /></div>
    </div>
  );
}

// Ring showing the Yes percentage. A small sliver always shows, even at 0%.
function Ring({ value }) {
  const c = 2 * Math.PI * 52;
  return (
    <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
      <svg width="88" height="88" viewBox="0 0 120 120" role="img" aria-label={`Yes ${value} percent`}>
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--line)" strokeWidth="9" />
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--ink)" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${(c * Math.max(value, 3.5)) / 100} ${c}`} transform="rotate(-90 60 60)" style={{ transition: 'stroke-dasharray 250ms' }} />
      </svg>
      <span className="num" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>{value}%</span>
    </div>
  );
}

function OpenPoll({ poll, myVote, onVote, onClose }) {
  const { total, yes } = percent(poll);
  return (
    <article className="mesh" style={{ borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, border: '1px solid rgba(255,255,255,.8)', boxShadow: '0 12px 28px -20px rgba(15,23,42,.35)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="copy num" style={{ fontSize: 13 }}>{timeAgo(poll.createdAt)} · {total} votes</span>
        {onClose && <button type="button" className="chip glass" onClick={onClose} style={{ marginLeft: 'auto', height: 32, fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}>Close</button>}
      </div>
      <h2 style={{ fontSize: 20, letterSpacing: '-0.025em', lineHeight: 1.2 }}>{poll.question}</h2>
      {myVote === undefined ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          <button type="button" className="btn btn-ink" onClick={() => onVote(0)}>{poll.options[0]}</button>
          <button type="button" className="btn btn-line" onClick={() => onVote(1)}>{poll.options[1]}</button>
        </div>
      ) : (
        <>
          <div className="glass fade" style={{ borderRadius: 16, padding: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
            <Ring value={yes} />
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Bar label={poll.options[0]} value={yes} color="var(--ink)" />
              <Bar label={poll.options[1]} value={100 - yes} color="#94A3B8" />
            </div>
          </div>
          <span className="copy" style={{ fontSize: 13.5 }}>You voted {poll.options[myVote]}</span>
        </>
      )}
    </article>
  );
}

function PastRow({ poll, open, onToggle }) {
  const { total, yes } = percent(poll);
  return (
    <div className="row-wrap">
      <button type="button" className="row" onClick={onToggle} aria-expanded={open}>
        <span style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{poll.question}</span>
          <span className="num" style={{ fontSize: 12.5, color: 'var(--muted)' }}>{timeAgo(poll.createdAt)}</span>
        </span>
        <span className="chip chip-quiet num" style={{ height: 24 }}>{poll.options[0]} {yes}%</span>
        <Icon name="chev" size={18} stroke={2.2} className={'chev' + (open ? ' open' : '')} />
      </button>
      {open && (
        <div className="fade" style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Bar label={poll.options[0]} value={yes} color="var(--ink)" />
          <Bar label={poll.options[1]} value={100 - yes} color="#94A3B8" />
          <span className="copy num" style={{ fontSize: 12.5 }}>{total} votes</span>
        </div>
      )}
    </div>
  );
}

export default function Votes() {
  const { data, error, reload } = usePolling(api.polls, 10000);
  const [myVotes, setMyVotes] = useState(readVotes);
  const [openId, setOpenId] = useState(null);
  const polls = data || [];
  const open = polls.filter((p) => p.isActive);
  const past = polls.filter((p) => !p.isActive);

  async function vote(poll, optionIndex) {
    const next = { ...myVotes, [poll.id]: optionIndex };
    setMyVotes(next); // show the result right away
    localStorage.setItem(MY_VOTES, JSON.stringify(next));
    await api.vote(poll.id, optionIndex).catch(() => {}); // the backend refuses a second vote (409): that's fine
    reload();
  }

  async function close(poll) {
    await api.closePoll(poll.id);
    reload();
  }

  return (
    <div className="page">
      <TopBar title="Votes" right={
        <div style={{ display: 'flex', gap: 10 }}>
          {isOrganizer() && <Link to="/votes/new" className="icon-btn dark" aria-label="New poll"><Icon name="plus" size={20} stroke={2.4} /></Link>}
          <Avatar />
        </div>
      } />
      {error && <p className="error">{error}</p>}
      {open.length > 0 && (
        <div className="in" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p className="section-title">Open now</p>
          {open.map((p) => (
            <OpenPoll key={p.id} poll={p} myVote={myVotes[p.id]} onVote={(i) => vote(p, i)} onClose={isOrganizer() ? () => close(p) : null} />
          ))}
        </div>
      )}
      {data && open.length === 0 && <p className="copy" style={{ padding: '16px 4px' }}>No open poll right now.</p>}
      {past.length > 0 && (
        <div className="in2">
          <p className="section-title">Past votes</p>
          <div className="card" style={{ overflow: 'hidden' }}>
            {past.map((p) => <PastRow key={p.id} poll={p} open={openId === p.id} onToggle={() => setOpenId(openId === p.id ? null : p.id)} />)}
          </div>
        </div>
      )}
      <Nav />
    </div>
  );
}
