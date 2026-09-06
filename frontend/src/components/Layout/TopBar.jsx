import React from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshCw, Wifi, Menu } from 'lucide-react';
import StatusIndicator from '../shared/StatusIndicator';
import './TopBar.css';

const PAGE_TITLES = {
  '/':              { title: 'Dashboard',           sub: 'Market overview & transaction network' },
  '/detection':    { title: 'AI Detection Center', sub: 'Multi-agent GNN analysis' },
  '/transactions': { title: 'Transaction Explorer', sub: 'Blockchain transaction investigation' },
  '/analytics':    { title: 'Detection Analytics',  sub: 'Model performance & pattern analysis' },
};

const TopBar = ({ onMenuClick }) => {
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] || PAGE_TITLES['/'];

  const now = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="topbar__menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={18} />
        </button>
        <div className="topbar__page">
          <h1 className="topbar__title">{page.title}</h1>
          <span className="topbar__sub">{page.sub}</span>
        </div>
      </div>

      <div className="topbar__right">
        <div className="topbar__meta">
          <Wifi size={12} strokeWidth={1.75} />
          <span>API Connected</span>
        </div>
        <div className="topbar__divider" />
        <div className="topbar__meta">
          <span className="topbar__timestamp">Updated {now}</span>
        </div>
        <div className="topbar__divider" />
        <StatusIndicator status="operational" />
        <button className="topbar__refresh" aria-label="Refresh data">
          <RefreshCw size={14} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
