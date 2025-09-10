import * as React from 'react'

const EcoFocusLogo: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <linearGradient id="eco-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22A06B" />
            <stop offset="100%" stopColor="#176342" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="14" fill="url(#eco-g)" />
        <path d="M9 18c3-6 8-8 14-9-2 6-6 11-12 14 2-3 3-5 4-7-2 1-4 2-6 2z" fill="#fff" opacity="0.9" />
      </svg>
      <span style={{ fontWeight: 700, letterSpacing: 0.2, color: 'var(--theme-elevation-1000)' }}>
        EcoFocus CMS
      </span>
    </div>
  )
}

export default EcoFocusLogo

