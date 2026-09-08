import React from 'react';

/* Subtle SVG network background pattern */
const NetworkPattern = ({ opacity = 0.03, className = '' }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity }}
  >
    <defs>
      <pattern id="net-grid" width="80" height="80" patternUnits="userSpaceOnUse">
        <circle cx="40" cy="40" r="1.5" fill="#A8A9AD" />
        <circle cx="0"  cy="0"  r="1"   fill="#A8A9AD" />
        <circle cx="80" cy="0"  r="1"   fill="#A8A9AD" />
        <circle cx="0"  cy="80" r="1"   fill="#A8A9AD" />
        <circle cx="80" cy="80" r="1"   fill="#A8A9AD" />
        <line x1="40" y1="40" x2="80" y2="0"  stroke="#A8A9AD" strokeWidth="0.4" />
        <line x1="40" y1="40" x2="80" y2="80" stroke="#A8A9AD" strokeWidth="0.4" />
        <line x1="40" y1="40" x2="0"  y2="0"  stroke="#A8A9AD" strokeWidth="0.4" />
        <line x1="40" y1="40" x2="0"  y2="80" stroke="#A8A9AD" strokeWidth="0.4" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#net-grid)" />
  </svg>
);

export default NetworkPattern;
