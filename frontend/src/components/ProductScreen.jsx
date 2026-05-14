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

// Standart beden önerisi (BMI tabanlı)
const TOP_SIZES    = ['XS', 'S', 'M', 'L', 'XL']
const BOTTOM_SIZES = ['34', '36', '38', '40', '42']

function recommendSize(height, weight, category) {
  if (!height || !weight) return null
  const bmi = weight / ((height / 100) ** 2)
  if (category === 'alt') {
    if (bmi < 18.5) return '34'
    if (bmi < 21)   return '36'
    if (bmi < 23.5) return '38'
    if (bmi < 26)   return '40'
    return '42'
  }
  if (bmi < 18.5) return 'XS'
  if (bmi < 21)   return 'S'
  if (bmi < 23.5) return 'M'
  if (bmi < 26)   return 'L'
  return 'XL'
}

function sizeDiff(selected, recommended, category) {
  const arr = category === 'alt' ? BOTTOM_SIZES : TOP_SIZES
  return arr.indexOf(selected) - arr.indexOf(recommended)
}

export default function ProductScreen({ brand, products = [], selectedProduct, selectedSize, onSelectProduct, onSelectSize, onTryOn, onBack }) {
  const [category, setCategory] = useState('ust')
  const [subcategory, setSubcategory] = useState('all')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

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

  const h = parseFloat(height)
  const w = parseFloat(weight)
  const recommended = selectedProduct ? recommendSize(h, w, selectedProduct.category) : null
  const diff = selectedSize && recommended ? sizeDiff(selectedSize, recommended, selectedProduct.category) : 0

  let fitWarning = null
  if (selectedSize && recommended) {
    if (diff >= 2) fitWarning = { text: 'Bu beden sana çok dar kalabilir. Yapay zeka kıyafeti vücuduna sıkışmış gösterecek.', color: '#c0392b' }
    else if (diff === 1) fitWarning = { text: 'Bu beden biraz dar olabilir. Önerilen beden: ' + recommended, color: '#e67e22' }
    else if (diff === -1) fitWarning = { text: 'Bu beden biraz bol olabilir. Önerilen beden: ' + recommended, color: '#7f8c8d' }
    else if (diff <= -2) fitWarning = { text: 'Bu beden sana çok bol kalabilir.', color: '#7f8c8d' }
  }

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
              <button
                key={s.key}
                className={`subcategory-btn ${subcategory === s.key ? 'active' : ''}`}
                onClick={() => changeSubcategory(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--gray)' }}>
              <p style={{ fontSize: 14 }}>Bu kategoride henüz ürün yok.</p>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map(p => (
                <div key={p.id} className={`product-card ${selectedProduct?.id === p.id ? 'selected' : ''}`}
                  onClick={() => { onSelectProduct(p); onSelectSize(null) }}>
                  <ProductImage src={p.image} alt={p.name} />
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
          {/* Boy / Kilo */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 10 }}>Ölçülerin</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--gray)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Boy (cm)</label>
                <input
                  type="number"
                  placeholder="170"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 14, fontWeight: 600, outline: 'none', boxSizing: 'border-box', background: 'var(--cream)' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--gray)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Kilo (kg)</label>
                <input
                  type="number"
                  placeholder="70"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 14, fontWeight: 600, outline: 'none', boxSizing: 'border-box', background: 'var(--cream)' }}
                />
              </div>
            </div>
          </div>

          {selectedProduct ? (
            <>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 8 }}>Seçilen Ürün</p>
                <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{selectedProduct.name}</h2>
                <p style={{ fontSize: 18, color: 'var(--black)', fontWeight: 700, marginBottom: 16 }}>{selectedProduct.price} ₺</p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className="size-label" style={{ margin: 0 }}>Beden Seç</span>
                  {recommended && (
                    <span style={{ fontSize: 11, color: 'var(--gray)', fontWeight: 600 }}>
                      Önerilen: <strong style={{ color: 'var(--black)' }}>{recommended}</strong>
                    </span>
                  )}
                </div>
                <div className="size-row">
                  {selectedProduct.sizes.map(s => (
                    <button
                      key={s}
                      className={`size-btn ${selectedSize === s ? 'active' : ''}`}
                      onClick={() => onSelectSize(s)}
                      style={recommended === s && selectedSize !== s ? { borderColor: 'var(--black)', borderWidth: 2 } : {}}
                    >
                      {s}
                      {recommended === s && <span style={{ display: 'block', fontSize: 8, marginTop: 1, color: selectedSize === s ? 'inherit' : 'var(--gray)' }}>önerilen</span>}
                    </button>
                  ))}
                </div>
              </div>

              {fitWarning && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: fitWarning.color + '15', border: `1px solid ${fitWarning.color}40`, marginTop: 4 }}>
                  <p style={{ fontSize: 12, color: fitWarning.color, lineHeight: 1.5, fontWeight: 600 }}>{fitWarning.text}</p>
                </div>
              )}

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
