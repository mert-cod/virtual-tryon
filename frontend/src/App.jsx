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
  const [capturedPhotos, setCapturedPhotos] = useState([])
  const [processedPhotos, setProcessedPhotos] = useState([]) // 3 işlenmiş foto
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [resultUrls, setResultUrls] = useState([]) // 3 sonuç
  const [error, setError] = useState(null)

  async function processPhotos(photoBlobs) {
    setScreen('loading-photo')
    setError(null)
    try {
      // 3 fotoğrafı paralel işle
      const results = await Promise.all(photoBlobs.map(async (blob, i) => {
        const form = new FormData()
        form.append('photo', blob, `photo${i}.jpg`)
        const controller = new AbortController()
        const tid = setTimeout(() => controller.abort(), 300000)
        const res = await fetch(`${API}/api/process-photo`, { method: 'POST', body: form, signal: controller.signal })
        clearTimeout(tid)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.detail || `Sunucu hatası (${res.status})`)
        }
        const data = await res.json()
        return data.processed_image
      }))
      setProcessedPhotos(results)
      setScreen('preview')
    } catch (e) {
      const msg = e.name === 'AbortError' ? 'İşlem zaman aşımına uğradı.' : e.message
      setError(msg)
      setScreen('photo-error')
    }
  }

  function handleAllPhotosCaptured(photoBlobs) {
    setCapturedPhotos(photoBlobs)
    processPhotos(photoBlobs)
  }

  async function handleTryOn() {
    setScreen('loading-tryon')
    setError(null)
    try {
      // 3 fotoğraf için sırayla try-on yap (paralel yaparsak API limit'e takılır)
      const urls = []
      for (let i = 0; i < processedPhotos.length; i++) {
        const form = new FormData()
        form.append('person_image', processedPhotos[i])
        form.append('product_id', selectedProduct.id)
        form.append('size', selectedSize)

        const controller = new AbortController()
        const tid = setTimeout(() => controller.abort(), 300000)
        const res = await fetch(`${API}/api/try-on`, { method: 'POST', body: form, signal: controller.signal })
        clearTimeout(tid)

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.detail || `Sunucu hatası (${res.status})`)
        }
        const data = await res.json()
        urls.push(data.result_url)
      }
      setResultUrls(urls)
      setScreen('result')
    } catch (e) {
      const msg = e.name === 'AbortError' ? 'Giydirme zaman aşımına uğradı. Tekrar dene.' : e.message
      setError(msg)
      setScreen('tryon-error')
    }
  }

  function reset() {
    setScreen('guidance')
    setCapturedPhotos([])
    setProcessedPhotos([])
    setSelectedProduct(null)
    setSelectedSize(null)
    setResultUrls([])
    setError(null)
  }

  const screens = {
    guidance: <GuidanceScreen brand={BRAND} onStart={() => setScreen('camera')} />,

    camera: (
      <CameraScreen
        brand={BRAND}
        onComplete={handleAllPhotosCaptured}
        onBack={() => setScreen('guidance')}
      />
    ),

    'loading-photo': <LoadingScreen message="Fotoğraflar işleniyor..." subtext="3 fotoğraf işleniyor, biraz bekle." />,

    'photo-error': (
      <ErrorScreen
        brand={BRAND}
        message={error}
        primaryLabel="Tekrar Dene"
        onPrimary={() => processPhotos(capturedPhotos)}
        secondaryLabel="Fotoğrafları Yenile"
        onSecondary={() => { setCapturedPhotos([]); setScreen('camera') }}
      />
    ),

    preview: (
      <PreviewScreen
        brand={BRAND}
        photo={processedPhotos[0]}
        onConfirm={() => setScreen('products')}
        onRetake={() => { setCapturedPhotos([]); setScreen('camera') }}
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

    'loading-tryon': <LoadingScreen message="Kıyafet giydiriliyor..." subtext="3 açıdan giydiriliyor, 3-5 dakika sürebilir. Lütfen bekle." />,

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
        resultUrls={resultUrls}
        product={selectedProduct}
        onTryAnother={() => { setSelectedProduct(null); setSelectedSize(null); setScreen('products') }}
        onReset={reset}
      />
    ),
  }

  return screens[screen] ?? screens.guidance
}
