import { useEffect, useState } from 'react'

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

export default function ProductScreen({ brand, error, selectedProduct, selectedSize, onSelectProduct, onSelectSize, onTryOn, onBack }) {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('ust')
  const [subcategory, setSubcategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/products')
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function changeCategory(key) {
    setCategory(key)
    setSubcategory('all')
    onSelectProduct(null)
    onSelectSize(null)
  }

  function changeSubcategory(key) {
    setSubcategory(key)
    onSelectProduct(null)
    onSelectSize(null)
  }

  const filtered = products.filter(p => {
    if (p.category !== category) return false
    if (subcategory === 'all') return true
    return p.subcategory === subcategory
  })

  const canTryOn = selectedProduct && selectedSize

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
          {error && <div className="inline-error">{error}</div>}

          {/* Üst / Alt sekmeler */}
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

          {/* Alt kategori filtreleri */}
          <div className="subcategory-bar">
            {SUBCATEGORIES[category].map(s => (
              <button
                key={s.key}
                className={`subcategory-btn ${subcategory === s.key ? 'active' : ''}`}
                onClick={() => changeSubcategory(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p style={{ color: 'var(--gray)', fontSize: 14 }}>Yükleniyor...</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--gray)' }}>
              <p style={{ fontSize: 14 }}>Bu kategoride henüz ürün yok.</p>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map(p => (
                <div key={p.id} className={`product-card ${selectedProduct?.id === p.id ? 'selected' : ''}`}
                  onClick={() => { onSelectProduct(p); onSelectSize(null) }}>
                  <ProductImage src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/products/${p.image}`} alt={p.name} />
                  <div className="product-card-info">
                    <h4>{p.name}</h4>
                    <span>{p.price} ₺</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sağ — seçim paneli */}
        <div className="product-panel">
          {selectedProduct ? (
            <>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 8 }}>Seçilen Ürün</p>
                <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{selectedProduct.name}</h2>
                <p style={{ fontSize: 18, color: 'var(--black)', fontWeight: 700, marginBottom: 20 }}>{selectedProduct.price} ₺</p>
              </div>

              <div>
                <div className="size-label">Beden Seç</div>
                <div className="size-row">
                  {selectedProduct.sizes.map(s => (
                    <button key={s} className={`size-btn ${selectedSize === s ? 'active' : ''}`} onClick={() => onSelectSize(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className={canTryOn ? 'btn-gold' : 'btn-primary'} onClick={onTryOn} disabled={!canTryOn}>
                  {canTryOn ? 'Üstümde Gör' : 'Beden Seç'}
                </button>
                <button className="btn-secondary" onClick={() => { onSelectProduct(null); onSelectSize(null) }}>
                  Ürünü Kaldır
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--gray)', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7 }}>Soldan bir ürün seç,<br />ardından beden seç.</p>
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
