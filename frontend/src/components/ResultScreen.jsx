import { useState } from 'react'

const LABELS = ['Önden', 'Arkadan', 'Yandan']

export default function ResultScreen({ brand, resultUrls = [], product, onTryAnother, onReset }) {
  const [current, setCurrent] = useState(0)
  const [scale, setScale] = useState(1)

  function handleClick() {
    setScale(s => s === 1 ? 2.2 : 1)
  }

  function handleWheel(e) {
    e.preventDefault()
    setScale(s => Math.min(Math.max(s - e.deltaY * 0.005, 1), 3.5))
  }

  function prev() { setScale(1); setCurrent(c => Math.max(c - 1, 0)) }
  function next() { setScale(1); setCurrent(c => Math.min(c + 1, resultUrls.length - 1)) }

  const url = resultUrls[current]

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
          {/* Açı seçici */}
          <div style={{ display: 'flex', gap: 6, padding: '14px 16px', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5 }}>
            {LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => { setScale(1); setCurrent(i) }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: current === i ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.15)',
                  color: current === i ? '#000' : 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Görsel */}
          <div
            className={`result-img-wrap ${scale > 1 ? 'zoomed' : ''}`}
            onClick={handleClick}
            onWheel={handleWheel}
            style={{ flex: 1 }}
          >
            {url
              ? <img src={url} alt="Deneme sonucu" style={{ transform: `scale(${scale})` }} draggable={false} />
              : <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Görsel yüklenemedi</p>
            }
            {scale === 1 && <div className="zoom-hint">Yakınlaştırmak için tıkla</div>}
          </div>

          {/* Prev / Next okları */}
          {resultUrls.length > 1 && (
            <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 12, zIndex: 5 }}>
              <button
                onClick={prev}
                disabled={current === 0}
                style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer', backdropFilter: 'blur(8px)', opacity: current === 0 ? 0.3 : 1 }}
              >‹</button>
              <button
                onClick={next}
                disabled={current === resultUrls.length - 1}
                style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer', backdropFilter: 'blur(8px)', opacity: current === resultUrls.length - 1 ? 0.3 : 1 }}
              >›</button>
            </div>
          )}
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

            {/* Küçük önizlemeler */}
            {resultUrls.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {resultUrls.map((u, i) => (
                  <div
                    key={i}
                    onClick={() => { setScale(1); setCurrent(i) }}
                    style={{
                      flex: 1, cursor: 'pointer',
                      borderRadius: 10,
                      overflow: 'hidden',
                      border: current === i ? '2px solid var(--black)' : '2px solid var(--border)',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <img src={u} alt={LABELS[i]} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} />
                  </div>
                ))}
              </div>
            )}

            <p style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.6, marginTop: 16 }}>
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
