import { useState, useRef } from 'react'

export default function ResultScreen({ brand, resultUrl, product, onTryAnother, onReset }) {
  const [scale, setScale] = useState(1)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const imgRef = useRef(null)

  function handleClick(e) {
    if (scale > 1) {
      setScale(1)
      setOrigin({ x: 50, y: 50 })
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin({ x, y })
    setScale(2.5)
  }

  function handleWheel(e) {
    e.preventDefault()
    setScale(s => Math.min(Math.max(s - e.deltaY * 0.005, 1), 4))
  }

  return (
    <div className="page">
      <div className="header">
        <button className="back-btn" onClick={onTryAnother}>←</button>
        <span className="header-brand">{brand}</span>
        <span style={{ width: 40 }} />
      </div>
      <div className="result-layout">
        {/* Sol — görsel */}
        <div style={{ position: 'relative', background: '#111', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div
            className={`result-img-wrap ${scale > 1 ? 'zoomed' : ''}`}
            onClick={handleClick}
            onWheel={handleWheel}
            style={{ flex: 1, cursor: scale > 1 ? 'zoom-out' : 'zoom-in' }}
          >
            {resultUrl
              ? <img
                  ref={imgRef}
                  src={resultUrl}
                  alt="Deneme sonucu"
                  draggable={false}
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: `${origin.x}% ${origin.y}%`,
                    transition: scale === 1 ? 'transform 0.3s ease' : 'none',
                  }}
                />
              : <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Görsel yüklenemedi</p>
            }
          </div>

          {/* Zoom bilgisi */}
          <div style={{
            position: 'absolute', bottom: 16, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', pointerEvents: 'none',
            opacity: scale > 1 ? 0 : 1, transition: 'opacity 0.3s',
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
              padding: '6px 14px', borderRadius: 20,
              color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 600,
            }}>
              Tıkla veya kaydır — yakınlaştır
            </div>
          </div>
        </div>

        {/* Sağ — panel */}
        <div className="result-panel">
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 8 }}>Sonuç</p>
            <h2 className="screen-title">Nasıl Durdu?</h2>
            <div style={{ width: 40, height: 2, background: 'var(--black)', borderRadius: 2, marginBottom: 20 }} />
            {product && (
              <div style={{ padding: '16px', background: 'var(--cream)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{product.name}</p>
                <p style={{ fontSize: 13, fontWeight: 700 }}>{product.price} ₺</p>
              </div>
            )}

            {/* Zoom kontrolleri */}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                onClick={() => { setScale(s => Math.min(s + 0.5, 4)) }}
                style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--cream)', fontSize: 18, cursor: 'pointer', fontWeight: 700 }}
              >+</button>
              <button
                onClick={() => { setScale(1); setOrigin({ x: 50, y: 50 }) }}
                style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--cream)', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
              >Sıfırla</button>
              <button
                onClick={() => { setScale(s => Math.max(s - 0.5, 1)) }}
                style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--cream)', fontSize: 18, cursor: 'pointer', fontWeight: 700 }}
              >−</button>
            </div>

            <p style={{ fontSize: 12, color: 'var(--gray)', lineHeight: 1.6, marginTop: 12 }}>
              Görsele tıklayarak veya + / − butonlarıyla yakınlaştır.
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
