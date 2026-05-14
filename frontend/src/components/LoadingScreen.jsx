export default function LoadingScreen({ message, subtext }) {
  return (
    <div className="page">
      <div className="loading-screen">
        <div className="spinner" />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px' }}>{message}</p>
          {subtext && <p style={{ fontSize: 13, color: 'var(--gray)', marginTop: 10, lineHeight: 1.6 }}>{subtext}</p>}
        </div>
      </div>
    </div>
  )
}
