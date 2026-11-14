import { Link, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { getSession } from '../lib/session.js';

// Title row at the top of a screen. `back` shows a back button, `right` adds buttons on the right.
export default function TopBar({ title, sub, back, right }) {
  const navigate = useNavigate();
  return (
    <div className="topbar fade">
      <div className="topbar-left">
        {back && (
          <button type="button" className="icon-btn glass" aria-label="Back" onClick={() => (back === true ? navigate(-1) : navigate(back))}>
            <Icon name="back" />
          </button>
        )}
        <div style={{ minWidth: 0 }}>
          <h1 className="t1">{title}</h1>
          {sub && <span className="copy num" style={{ fontSize: 14 }}>{sub}</span>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Avatar({ size = 44, style }) {
  const name = getSession().user?.displayName || '?';
  return (
    <Link to="/profile" className="avatar" aria-label="Profile" style={{ width: size, height: size, ...style }}>
      {name[0].toUpperCase()}
    </Link>
  );
}
