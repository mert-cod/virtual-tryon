export default function PreviewScreen({ brand, photo, onConfirm, onRetake }) {
  return (
    <div className="page">
      <div className="header">
        <button className="back-btn" onClick={onRetake}>←</button>
        <span className="header-brand">{brand}</span>
        <span style={{ width: 40 }} />
      </div>
      <div className="preview-layout">
        <div className="preview-img-area">
          {photo && <img src={photo} alt="İşlenmiş fotoğraf" />}
        </div>
        <div className="preview-panel">
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 8 }}>Önizleme</p>
            <h2 className="screen-title">Fotoğrafı Onayla</h2>
            <div style={{ width: 40, height: 2, background: 'var(--black)', borderRadius: 2, marginBottom: 20 }} />
            <p className="screen-subtitle">
              Fotoğrafın hazır. Devam etmek için onayla,
              tekrar çekmek istersen geri dön.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
            <button className="btn-primary" onClick={onConfirm}>Onayla ve Devam Et</button>
            <button className="btn-secondary" onClick={onRetake}>Tekrar Çek</button>
          </div>
        </div>
      </div>
    </div>
  )
}
