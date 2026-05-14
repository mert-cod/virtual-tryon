export default function ErrorScreen({ brand, message, primaryLabel, onPrimary, secondaryLabel, onSecondary }) {
  return (
    <div className="page">
      <div className="header">
        <span className="header-brand">{brand}</span>
      </div>
      <div className="error-layout">
        <div className="error-card">
          <div className="error-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Bir sorun oluştu</h2>
            <div style={{ width: 40, height: 2, background: 'var(--black)', borderRadius: 2, margin: '0 auto 16px' }} />
            <p style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.65 }}>{message}</p>
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn-primary" onClick={onPrimary}>{primaryLabel}</button>
            <button className="btn-secondary" onClick={onSecondary}>{secondaryLabel}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
