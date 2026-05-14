import { useState } from 'react'
import './index.css'
import GuidanceScreen from './components/GuidanceScreen'
import CameraScreen from './components/CameraScreen'
import PreviewScreen from './components/PreviewScreen'
import ProductScreen from './components/ProductScreen'
import LoadingScreen from './components/LoadingScreen'
import ResultScreen from './components/ResultScreen'
import ErrorScreen from './components/ErrorScreen'

const BRAND = 'MARKA'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [screen, setScreen] = useState('guidance')
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [processedPhoto, setProcessedPhoto] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [resultUrl, setResultUrl] = useState(null)
  const [error, setError] = useState(null)

  async function processPhoto(blob) {
    setScreen('loading-photo')
    setError(null)
    try {
      const form = new FormData()
      form.append('photo', blob, 'photo.jpg')
      const controller = new AbortController()
      const tid = setTimeout(() => controller.abort(), 60000)
      const res = await fetch(`${API}/api/process-photo`, { method: 'POST', body: form, signal: controller.signal })
      clearTimeout(tid)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || `Sunucu hatası (${res.status})`)
      }
      const data = await res.json()
      setProcessedPhoto(data.processed_image)
      setScreen('preview')
    } catch (e) {
      const msg = e.name === 'AbortError' ? 'İşlem zaman aşımına uğradı.' : e.message
      setError(msg)
      setScreen('photo-error')
    }
  }

  function handlePhotoCaptured(photoBlobs) {
    const blob = photoBlobs[0]
    setCapturedPhoto(blob)
    processPhoto(blob)
  }

  async function handleTryOn() {
    setScreen('loading-tryon')
    setError(null)
    try {
      const form = new FormData()
      form.append('person_image', processedPhoto)
      form.append('product_id', selectedProduct.id)
      form.append('size', selectedSize)
      form.append('category', selectedProduct.category)

      const controller = new AbortController()
      const tid = setTimeout(() => controller.abort(), 120000)
      const res = await fetch(`${API}/api/try-on`, { method: 'POST', body: form, signal: controller.signal })
      clearTimeout(tid)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || `Sunucu hatası (${res.status})`)
      }
      const data = await res.json()
      setResultUrl(data.result_url)
      setScreen('result')
    } catch (e) {
      const msg = e.name === 'AbortError' ? 'Giydirme zaman aşımına uğradı. Tekrar dene.' : e.message
      setError(msg)
      setScreen('tryon-error')
    }
  }

  function reset() {
    setScreen('guidance')
    setCapturedPhoto(null)
    setProcessedPhoto(null)
    setSelectedProduct(null)
    setSelectedSize(null)
    setResultUrl(null)
    setError(null)
  }

  const screens = {
    guidance: <GuidanceScreen brand={BRAND} onStart={() => setScreen('camera')} />,

    camera: (
      <CameraScreen
        brand={BRAND}
        onComplete={handlePhotoCaptured}
        onBack={() => setScreen('guidance')}
      />
    ),

    'loading-photo': <LoadingScreen message="Fotoğraf işleniyor..." subtext="Biraz bekle." />,

    'photo-error': (
      <ErrorScreen
        brand={BRAND}
        message={error}
        primaryLabel="Tekrar Dene"
        onPrimary={() => processPhoto(capturedPhoto)}
        secondaryLabel="Fotoğrafı Yenile"
        onSecondary={() => { setCapturedPhoto(null); setScreen('camera') }}
      />
    ),

    preview: (
      <PreviewScreen
        brand={BRAND}
        photo={processedPhoto}
        onConfirm={() => setScreen('products')}
        onRetake={() => { setCapturedPhoto(null); setScreen('camera') }}
      />
    ),

    products: (
      <ProductScreen
        brand={BRAND}
        error={error}
        selectedProduct={selectedProduct}
        selectedSize={selectedSize}
        onSelectProduct={setSelectedProduct}
        onSelectSize={setSelectedSize}
        onTryOn={handleTryOn}
        onBack={() => setScreen('preview')}
      />
    ),

    'loading-tryon': <LoadingScreen message="Kıyafet giydiriliyor..." subtext="5-15 saniye sürebilir, bekle." />,

    'tryon-error': (
      <ErrorScreen
        brand={BRAND}
        message={error}
        primaryLabel="Tekrar Dene"
        onPrimary={handleTryOn}
        secondaryLabel="Farklı Ürün Seç"
        onSecondary={() => setScreen('products')}
      />
    ),

    result: (
      <ResultScreen
        brand={BRAND}
        resultUrl={resultUrl}
        product={selectedProduct}
        onTryAnother={() => { setSelectedProduct(null); setSelectedSize(null); setScreen('products') }}
        onReset={reset}
      />
    ),
  }

  return screens[screen] ?? screens.guidance
}
