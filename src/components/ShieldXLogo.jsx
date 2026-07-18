import React from 'react';

export default function ShieldXLogo({ className = '', compact = false }) {
  return (
    <span
      className={`shieldx-logo ${compact ? 'shieldx-logo--compact' : ''} ${className}`}
      aria-hidden="true"
    >
      <span className="shieldx-logo__ring shieldx-logo__ring--outer" />
      <span className="shieldx-logo__ring shieldx-logo__ring--inner" />
      <svg viewBox="0 0 72 82" className="shieldx-logo__lock" role="img">
        <defs>
          <linearGradient id="shieldx-fill" x1="15%" y1="5%" x2="85%" y2="95%">
            <stop offset="0%" stopColor="#4df4ff" />
            <stop offset="48%" stopColor="#00b8d4" />
            <stop offset="100%" stopColor="#7657ff" />
          </linearGradient>
          <linearGradient id="shieldx-edge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#00e6ff" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Lock Shackle */}
        <path
          d="M 22,34 V 20 A 14,14 0 0,1 50,20 V 34"
          fill="none"
          stroke="url(#shieldx-edge)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 26,34 V 21 A 10,10 0 0,1 46,21 V 34"
          fill="none"
          stroke="#00e6ff"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Lock Body */}
        <path
          d="M 12,32 H 60 A 4,4 0 0,1 64,36 V 62 A 12,12 0 0,1 52,74 H 20 A 12,12 0 0,1 8,62 V 36 A 4,4 0 0,1 12,32 Z"
          fill="url(#shieldx-fill)"
          stroke="url(#shieldx-edge)"
          strokeWidth="2.5"
        />
        <path
          d="M 16,36 H 56 A 2,2 0 0,1 58,38 V 58 A 8,8 0 0,1 50,66 H 22 A 8,8 0 0,1 14,58 V 38 A 2,2 0 0,1 16,36 Z"
          fill="#070715"
          fillOpacity="0.8"
          stroke="#b8fbff"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />

        {/* Cyberpunk circuit lines */}
        <g className="shieldx-logo__circuit">
          <path d="M 22,46 H 29 M 43,46 H 50" stroke="#00e6ff" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 25,54 H 29 M 43,54 H 47" stroke="#00e6ff" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Glowing Keyhole */}
        <g className="shieldx-logo__keyhole">
          <circle cx="36" cy="48" r="4.5" fill="#ffffff" />
          <path d="M 34.5,51 L 33,60 H 39 L 37.5,51 Z" fill="#ffffff" />
        </g>
      </svg>
      <span className="shieldx-logo__spark shieldx-logo__spark--one" />
      <span className="shieldx-logo__spark shieldx-logo__spark--two" />
    </span>
  );
}
