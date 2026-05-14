export default function GuidanceScreen({ brand, onStart }) {
  return (
    <div className="page">
      <div className="header">
        <span className="header-brand">{brand}</span>
        <span className="header-meta">Virtual Try-On</span>
      </div>
      <div className="guidance-layout">
        <div className="guidance-left">
          <div className="guidance-left-inner">
            <div className="guidance-mark">Virtual Try-On</div>
            <h1 className="guidance-big-title">Kıyafeti<br />Üstünde<br />Gör</h1>
            <div style={{ width: 48, height: 2, background: 'var(--black)', borderRadius: 2 }} />
            <p className="guidance-big-sub">
              Beğendiğin ürünü satın almadan önce nasıl durduğunu gör.
              İade oranları düşsün, alışveriş deneyimin iyileşsin.
            </p>
            <button className="btn-gold" style={{ marginTop: 8 }} onClick={onStart}>
              Başla
            </button>
          </div>
        </div>

        <div className="guidance-right">
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 8 }}>
              Nasıl Çalışır?
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 6 }}>3 Adımda Dene</h2>
            <div style={{ width: 40, height: 2, background: 'var(--black)', borderRadius: 2, marginBottom: 32 }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { n: 1, title: 'Fotoğrafını Ekle', text: 'Kamera ile çek ya da galerinizden yükle. Yüzün otomatik kaldırılır, arka plan beyaza dönüştürülür.' },
              { n: 2, title: 'Ürünü Seç', text: 'Koleksiyonumuzdan istediğin kıyafeti ve bedeni seç.' },
              { n: 3, title: 'Sonucu Gör', text: 'Yapay zeka kıyafeti üstüne giydiriyor. Yakınlaştır, incele, karar ver.' },
            ].map(s => (
              <div key={s.n} className="guidance-step">
                <div className="step-num">{s.n}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                  <div className="step-text">{s.text}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 32, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, color: 'var(--gray)', lineHeight: 1.7 }}>
              Gizliliğin korunur — yüzün otomatik kaldırılır, fotoğrafların sunucuya kaydedilmez.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
