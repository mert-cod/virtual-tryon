import { useState } from 'react'

export default function ResultScreen({ brand, resultUrl, product, onTryAnother, onReset }) {
  const [scale, setScale] = useState(1)
  const [hintVisible, setHintVisible] = useState(true)

  function handleClick() {
    setHintVisible(false)
    setScale(s => s === 1 ? 2.2 : 1)
  }

  function handleWheel(e) {
    e.preventDefault()
    setHintVisible(false)
    setScale(s => Math.min(Math.max(s - e.deltaY * 0.005, 1), 3.5))
  }

  return (
    <div className="page">
      <div className="header">
        <button className="back-btn" onClick={onTryAnother}>←</button>
        <span className="header-brand">{brand}</span>
        <span style={{ width: 40 }} />
      </div>
      <div className="result-layout">
        <div className={`result-img-wrap ${scale > 1 ? 'zoomed' : ''}`} onClick={handleClick} onWheel={handleWheel}>
          {resultUrl
            ? <img src={resultUrl} alt="Deneme sonucu" style={{ transform: `scale(${scale})` }} draggable={false} />
            : <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Görsel yüklenemedi</p>}
          {hintVisible && <div className="zoom-hint">Yakınlaştırmak için tıkla</div>}
        </div>

        <div className="result-panel">
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 8 }}>Sonuç</p>
            <h2 className="screen-title">Nasıl Durdu?</h2>
            <div style={{ width: 40, height: 2, background: 'var(--black)', borderRadius: 2, marginBottom: 20 }} />
            {product && (
              <div style={{ padding: '16px', background: 'var(--cream)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 8 }}>
                <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{product.name}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700 }}>{product.price} ₺</p>
              </div>
            )}
            <p style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.6, marginTop: 12 }}>
              Görseli yakınlaştırarak kumaş dokusunu inceleyebilirsin.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
            <button className="btn-gold" onClick={onTryAnother}>Başka Ürün Dene</button>
            <button className="btn-secondary" onClick={onReset}>Başa Dön</button>
          </div>
        </div>
      </div>
    </div>
  )
}
