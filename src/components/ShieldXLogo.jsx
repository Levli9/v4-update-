import React from 'react';

export default function ShieldXLogo({ className = '', compact = false }) {
  return (
    <span
      className={`shieldx-logo ${compact ? 'shieldx-logo--compact' : ''} ${className}`}
      aria-hidden="true"
    >
      <span className="shieldx-logo__ring shieldx-logo__ring--outer" />
      <span className="shieldx-logo__ring shieldx-logo__ring--inner" />
      <svg viewBox="0 0 72 82" className="shieldx-logo__shield" role="img">
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

        <path
          d="M36 3 65 13v23c0 20.2-11.5 34.9-29 43C18.5 70.9 7 56.2 7 36V13L36 3Z"
          fill="url(#shieldx-fill)"
          stroke="url(#shieldx-edge)"
          strokeWidth="2.5"
        />
        <path
          d="M36 10.5 58.5 18v18.2c0 15.3-8.4 26.8-22.5 34.2-14.1-7.4-22.5-18.9-22.5-34.2V18L36 10.5Z"
          fill="#070715"
          fillOpacity="0.72"
          stroke="#b8fbff"
          strokeOpacity="0.45"
        />
        <path
          d="m23 28 13 13 13-13M23 54l13-13 13 13"
          fill="none"
          stroke="#eaffff"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M36 14v12M36 57v9" stroke="#00e6ff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="36" cy="41" r="3.2" fill="#ffffff" />
      </svg>
      <span className="shieldx-logo__spark shieldx-logo__spark--one" />
      <span className="shieldx-logo__spark shieldx-logo__spark--two" />
    </span>
  );
}
