import { Navigate, Route, Routes } from 'react-router-dom';
import { getSession } from './lib/session.js';
import Login from './pages/Login.jsx';
import Choose from './pages/Choose.jsx';
import Join from './pages/Join.jsx';
import Create from './pages/Create.jsx';
import Code from './pages/Code.jsx';
import MapPage from './pages/MapPage.jsx';
import Report from './pages/Report.jsx';
import News from './pages/News.jsx';
import NewAnnouncement from './pages/NewAnnouncement.jsx';
import Votes from './pages/Votes.jsx';
import NewPoll from './pages/NewPoll.jsx';
import Profile from './pages/Profile.jsx';
import Review from './pages/Review.jsx';
import ReviewZone from './pages/ReviewZone.jsx';
import ZoneMap from './pages/ZoneMap.jsx';

// Only logged-in users who joined a protest can open these screens.
function InProtest({ children, organizer = false }) {
  const s = getSession();
  if (!s.token) return <Navigate to="/login" replace />;
  if (!s.manif) return <Navigate to="/start" replace />;
  if (organizer && s.user?.role !== 'organizer') return <Navigate to="/map" replace />;
  return children;
}

function LoggedIn({ children }) {
  return getSession().token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const s = getSession();
  const home = !s.token ? '/login' : !s.manif ? '/start' : '/map';

  return (
    <div className="screen">
      <Routes>
        <Route path="/" element={<Navigate to={home} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/start" element={<LoggedIn><Choose /></LoggedIn>} />
        <Route path="/join" element={<LoggedIn><Join /></LoggedIn>} />
        <Route path="/create" element={<LoggedIn><Create /></LoggedIn>} />
        <Route path="/code" element={<InProtest organizer><Code /></InProtest>} />
        <Route path="/map" element={<InProtest><MapPage /></InProtest>} />
        <Route path="/report" element={<InProtest><Report /></InProtest>} />
        <Route path="/news" element={<InProtest><News /></InProtest>} />
        <Route path="/news/new" element={<InProtest organizer><NewAnnouncement /></InProtest>} />
        <Route path="/votes" element={<InProtest><Votes /></InProtest>} />
        <Route path="/votes/new" element={<InProtest organizer><NewPoll /></InProtest>} />
        <Route path="/profile" element={<InProtest><Profile /></InProtest>} />
        <Route path="/review" element={<InProtest organizer><Review /></InProtest>} />
        <Route path="/review/:zoneKey" element={<InProtest organizer><ReviewZone /></InProtest>} />
        <Route path="/review/:zoneKey/map" element={<InProtest organizer><ZoneMap /></InProtest>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
