import { useRef, useEffect, useState } from 'react'

const STEPS = [
  { key: 'front',    label: 'Önden' },
  { key: 'back',     label: 'Arkadan' },
  { key: 'side',     label: 'Yandan' },
  { key: 'diagonal', label: 'Çaprazdan' },
]

export default function CameraScreen({ brand, onComplete, onBack }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [photos, setPhotos] = useState([])
  const [previews, setPreviews] = useState([])
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraFailed, setCameraFailed] = useState(false)
  const [flash, setFlash] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [facingMode, setFacingMode] = useState('user')

  const allDone = photos.length >= STEPS.length

  useEffect(() => {
    startCamera(facingMode)
    return () => stopCamera()
  }, [facingMode])

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
  }

  function startCamera(mode) {
    stopCamera()
    setCameraReady(false)
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 1920 } },
    }).then(stream => {
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setCameraReady(true)
      }
    }).catch(() => setCameraFailed(true))
  }

  function flipCamera() {
    setFacingMode(m => m === 'user' ? 'environment' : 'user')
  }

  function addPhotos(blobs) {
    const newPhotos = [...photos, ...blobs].slice(0, STEPS.length)
    const newPreviews = newPhotos.map(b => URL.createObjectURL(b))
    setPhotos(newPhotos)
    setPreviews(newPreviews)
  }

  function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    setFlash(true)
    setTimeout(() => setFlash(false), 200)
    canvas.toBlob(blob => addPhotos([blob]), 'image/jpeg', 0.92)
  }

  function handleGallery(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    e.target.value = ''
    addPhotos(files)
  }

  function removePhoto(i) {
    const newPhotos = photos.filter((_, idx) => idx !== i)
    const newPreviews = newPhotos.map(b => URL.createObjectURL(b))
    setPhotos(newPhotos)
    setPreviews(newPreviews)
  }

  function goBack() {
    if (photos.length > 0) removePhoto(photos.length - 1)
    else onBack()
  }

  function confirm() {
    setConfirmed(true)
    setTimeout(() => onComplete(photos), 600)
  }

  const hints = [
    'Kameraya düz bak, kollarını hafifçe aç',
    'Kameraya sırtını dön, dik dur',
    'Sağ yanını kameraya ver, dik dur',
    '45 derece açıyla kameraya bak',
  ]

  return (
    <div className="page">
      <div className="header">
        <button className="back-btn" onClick={goBack}>←</button>
        <span className="header-brand">{brand}</span>
        <span className="header-meta">{Math.min(photos.length, STEPS.length)} / {STEPS.length}</span>
      </div>

      <div className="camera-layout">
        {/* Sol — kamera */}
        <div className="camera-main">
          {flash && <div style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 10, opacity: 0.6, pointerEvents: 'none' }} />}

          {cameraFailed ? (
            <div className="camera-no-access">
              <div className="camera-no-access-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center', lineHeight: 1.7 }}>
                Kamera erişimi yok.<br />Galeriden yükle.
              </p>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted />
              {!allDone && cameraReady && (
                <div className="camera-hint-bar">{hints[photos.length]}</div>
              )}
              {/* Kamera çevirme butonu */}
              {cameraReady && !allDone && (
                <button className="flip-camera-btn" onClick={flipCamera} title="Kamerayı çevir">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>
                </button>
              )}
            </>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Sağ — panel */}
        <div className="camera-panel">
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 8 }}>
              Fotoğraf Çekimi
            </p>
            {allDone ? (
              <>
                <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.3px', marginBottom: 4 }}>Fotoğraflar Hazır</h2>
                <div style={{ width: 32, height: 2, background: 'var(--black)', borderRadius: 2, marginBottom: 12 }} />
                <p style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.6 }}>İstersen fotoğrafları değiştir, hazırsan onayla.</p>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.3px', marginBottom: 4 }}>{STEPS[photos.length].label} Fotoğraf</h2>
                <div style={{ width: 32, height: 2, background: 'var(--black)', borderRadius: 2, marginBottom: 12 }} />
                <p style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.6 }}>{hints[photos.length]}</p>
              </>
            )}
          </div>

          <div className="step-bar">
            {STEPS.map((s, i) => (
              <div key={s.key} className={`step-bar-item ${i < photos.length ? 'done' : ''}`} />
            ))}
          </div>

          <div className="photo-thumbs">
            {STEPS.map((s, i) => (
              <div key={s.key} style={{ flex: 1, position: 'relative' }}>
                {previews[i] ? (
                  <>
                    <img src={previews[i]} alt={s.label} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 10, display: 'block' }} />
                    <button onClick={() => removePhoto(i)} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
                  </>
                ) : (
                  <div className="photo-thumb" style={{ background: 'var(--gray-light)', color: 'var(--gray)', fontSize: 11, fontWeight: 600 }}>{i + 1}</div>
                )}
                <p style={{ fontSize: 9, color: 'var(--gray)', textAlign: 'center', marginTop: 4, fontWeight: 600, letterSpacing: 0.5 }}>{s.label.toUpperCase()}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {allDone ? (
              <button className="btn-primary" onClick={confirm} disabled={confirmed} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>✓</span>
                {confirmed ? 'Gönderiliyor...' : 'Onayla ve Devam Et'}
              </button>
            ) : (
              <>
                {!cameraFailed && (
                  <button className="btn-primary" onClick={capture} disabled={!cameraReady}>
                    {cameraReady ? 'Fotoğraf Çek' : 'Kamera Başlatılıyor...'}
                  </button>
                )}
                <label className="gallery-label">
                  <div className={cameraFailed ? 'btn-primary' : 'btn-secondary'} style={{ textAlign: 'center', pointerEvents: 'none' }}>
                    Galeriden Seç {photos.length > 0 ? `(${STEPS.length - photos.length} kaldı)` : `(${STEPS.length} fotoğraf)`}
                  </div>
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleGallery} />
                </label>
              </>
            )}
          </div>

          <div style={{ marginTop: 'auto', padding: '14px 16px', background: 'var(--cream)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 12, color: 'var(--gray)', lineHeight: 1.7 }}>
              Gizliliğin korunur. Yüzün otomatik kaldırılır, fotoğrafların sunucuya kaydedilmez.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
