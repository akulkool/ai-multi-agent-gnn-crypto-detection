import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  ArrowLeftRight,
  BarChart3,
  Network,
  Menu,
  X,
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/',              label: 'Dashboard',     icon: LayoutDashboard },
  { path: '/detection',    label: 'Detection',      icon: ShieldAlert },
  { path: '/transactions', label: 'Transactions',   icon: ArrowLeftRight },
  { path: '/analytics',    label: 'Analytics',      icon: BarChart3 },
];

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={onMobileClose} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        {/* Logo */}
        <div className="sidebar__logo">
          <div className="sidebar__logo-mark">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
              <circle cx="12" cy="12" r="3" fill="#E53935" />
              <circle cx="4"  cy="6"  r="2" fill="#4A5568" />
              <circle cx="20" cy="6"  r="2" fill="#4A5568" />
              <circle cx="4"  cy="18" r="2" fill="#4A5568" />
              <circle cx="20" cy="18" r="2" fill="#4A5568" />
              <line x1="4"  y1="6"  x2="12" y2="12" stroke="#2A2D32" strokeWidth="1.2" />
              <line x1="20" y1="6"  x2="12" y2="12" stroke="#2A2D32" strokeWidth="1.2" />
              <line x1="4"  y1="18" x2="12" y2="12" stroke="#2A2D32" strokeWidth="1.2" />
              <line x1="20" y1="18" x2="12" y2="12" stroke="#2A2D32" strokeWidth="1.2" />
            </svg>
          </div>
          <div className="sidebar__logo-text">
            <span className="sidebar__logo-name">CryptoSentinel</span>
            <span className="sidebar__logo-sub">Market Surveillance</span>
          </div>
          <button className="sidebar__mobile-close" onClick={onMobileClose} aria-label="Close menu">
            <X size={16} />
          </button>
        </div>

        {/* Section label */}
        <div className="sidebar__section-label">Navigation</div>

        {/* Nav */}
        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path);
            return (
              <NavLink
                key={path}
                to={path}
                className={`sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`}
                onClick={onMobileClose}
              >
                <span className="sidebar__nav-indicator" />
                <Icon size={16} strokeWidth={isActive ? 2 : 1.75} />
                <span className="sidebar__nav-label">{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          <div className="sidebar__footer-item">
            <div className="sidebar__footer-dot sidebar__footer-dot--live" />
            <span>Live Monitoring</span>
          </div>
          <div className="sidebar__footer-item sidebar__footer-item--muted">
            GNN v2.1.0 · Multi-Agent
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
