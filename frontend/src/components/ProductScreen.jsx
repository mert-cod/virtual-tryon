import { useState } from 'react'

const SUBCATEGORIES = {
  ust: [
    { key: 'all',        label: 'Tümü' },
    { key: 'gomlek',     label: 'Gömlek' },
    { key: 'tisort',     label: 'Tişört' },
    { key: 'kazak',      label: 'Kazak' },
    { key: 'sweatshirt', label: 'Sweatshirt' },
    { key: 'ceket',      label: 'Ceket' },
    { key: 'blazer',     label: 'Blazer' },
  ],
  alt: [
    { key: 'all',      label: 'Tümü' },
    { key: 'pantolon', label: 'Pantolon' },
    { key: 'etek',     label: 'Etek' },
    { key: 'sort',     label: 'Şort' },
    { key: 'tayt',     label: 'Tayt' },
    { key: 'jean',     label: 'Jean' },
  ],
}

export default function ProductScreen({ brand, products = [], selectedProduct, onSelectProduct, onTryOn, onBack }) {
  const [category, setCategory] = useState('ust')
  const [subcategory, setSubcategory] = useState('all')

  function changeCategory(key) {
    setCategory(key)
    setSubcategory('all')
    onSelectProduct(null)
  }

  const filtered = products.filter(p => {
    if (p.category !== category) return false
    if (subcategory === 'all') return true
    return p.subcategory === subcategory
  })

  return (
    <div className="page">
      <div className="header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="header-brand">{brand}</span>
        <span style={{ width: 40 }} />
      </div>
      <div className="product-layout">
        {/* Sol — ürün grid */}
        <div className="product-grid-area">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px' }}>Koleksiyon</h2>
            <div className="category-tabs">
              {[['ust', 'Üst Giyim'], ['alt', 'Alt Giyim']].map(([key, label]) => (
                <button key={key} className={`tab ${category === key ? 'active' : ''}`}
                  onClick={() => changeCategory(key)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="subcategory-bar">
            {SUBCATEGORIES[category].map(s => (
              <button key={s.key} className={`subcategory-btn ${subcategory === s.key ? 'active' : ''}`}
                onClick={() => setSubcategory(s.key)}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="product-grid">
            {filtered.map(p => (
              <div key={p.id} className={`product-card ${selectedProduct?.id === p.id ? 'selected' : ''}`}
                onClick={() => onSelectProduct(p)}>
                <ProductImage src={p.image} alt={p.name} />
                <div className="product-card-info">
                  <h4>{p.name}</h4>
                  <span>{p.price} ₺</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sağ — panel */}
        <div className="product-panel">
          {selectedProduct ? (
            <>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 8 }}>Seçilen Ürün</p>
                <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{selectedProduct.name}</h2>
                <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{selectedProduct.price} ₺</p>
                <p style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.6, marginBottom: 20 }}>
                  Kıyafeti üstünde görmek için butona bas. Yapay zeka saniyeler içinde giydiriyor.
                </p>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn-gold" onClick={onTryOn}>
                  Üstümde Gör
                </button>
                <button className="btn-secondary" onClick={() => onSelectProduct(null)}>
                  Farklı Ürün Seç
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--gray)', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Bir ürün seç</p>
                <p style={{ fontSize: 13, lineHeight: 1.7 }}>Soldan beğendiğin kıyafeti seç,<br />üstünde nasıl durduğunu gör.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductImage({ src, alt }) {
  const [failed, setFailed] = useState(false)
  if (failed) return (
    <div className="no-product-img">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
      </svg>
    </div>
  )
  return <img src={src} alt={alt} onError={() => setFailed(true)} />
}
