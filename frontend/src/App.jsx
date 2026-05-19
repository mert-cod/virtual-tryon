import { useState } from 'react'
import './index.css'
import GuidanceScreen from './components/GuidanceScreen'
import CameraScreen from './components/CameraScreen'
import PreviewScreen from './components/PreviewScreen'
import ProductScreen from './components/ProductScreen'
import LoadingScreen from './components/LoadingScreen'
import ResultScreen from './components/ResultScreen'
import ErrorScreen from './components/ErrorScreen'
import PRODUCTS from './products'

const BRAND = 'MARKA'

export default function App() {
  const [screen, setScreen] = useState('guidance')
  const [photoBlob, setPhotoBlob] = useState(null)
  const [photoDataUrl, setPhotoDataUrl] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [resultUrl, setResultUrl] = useState(null)
  const [error, setError] = useState(null)

  function handlePhotoCaptured(photos) {
    const blob = photos[0]
    setPhotoBlob(blob)
    const url = URL.createObjectURL(blob)
    setPhotoDataUrl(url)
    setScreen('preview')
  }

  async function handleTryOn() {
    setScreen('loading-tryon')
    setError(null)
    try {
      const garmentUrl = window.location.origin + selectedProduct.image

      const personBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(photoBlob)
      })

      const res = await fetch('/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personBase64,
          personType: photoBlob.type || 'image/jpeg',
          garmentUrl,
          category: selectedProduct.category,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sunucu hatası')

      setResultUrl(data.result_url)
      setScreen('result')
    } catch (e) {
      setError(e.message || 'Bir hata oluştu.')
      setScreen('tryon-error')
    }
  }

  function reset() {
    setScreen('guidance')
    setPhotoBlob(null)
    setPhotoDataUrl(null)
    setSelectedProduct(null)
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

    preview: (
      <PreviewScreen
        brand={BRAND}
        photo={photoDataUrl}
        onConfirm={() => setScreen('products')}
        onRetake={() => { setPhotoBlob(null); setPhotoDataUrl(null); setScreen('camera') }}
      />
    ),

    products: (
      <ProductScreen
        brand={BRAND}
        products={PRODUCTS}
        selectedProduct={selectedProduct}
        onSelectProduct={setSelectedProduct}
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
        onTryAnother={() => { setSelectedProduct(null); setScreen('products') }}
        onReset={reset}
      />
    ),
  }

  return screens[screen] ?? screens.guidance
}
