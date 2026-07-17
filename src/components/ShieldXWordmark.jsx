import React from 'react';

export default function ShieldXWordmark({ className = '' }) {
  return (
    <span className={`shieldx-wordmark ${className}`} dir="ltr" aria-label="ShieldX">
      <span aria-hidden="true">Shield</span>
      <span className="shieldx-wordmark__x" aria-hidden="true">X</span>
    </span>
  );
}
