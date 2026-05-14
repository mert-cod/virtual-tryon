import { useState } from 'react'
import { fal } from '@fal-ai/client'
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

fal.config({ credentials: import.meta.env.VITE_FAL_KEY })

export default function App() {
  const [screen, setScreen] = useState('guidance')
  const [photoBlob, setPhotoBlob] = useState(null)
  const [photoDataUrl, setPhotoDataUrl] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
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
      const cat = selectedProduct.category === 'alt' ? 'bottoms' : 'tops'
      const garmentUrl = window.location.origin + selectedProduct.image

      const personUrl = await fal.storage.upload(photoBlob)

      const result = await fal.subscribe('fal-ai/fashn/v1/try-on', {
        input: {
          model_image: personUrl,
          garment_image: garmentUrl,
          category: cat,
        },
      })

      setResultUrl(result.data.images[0].url)
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
