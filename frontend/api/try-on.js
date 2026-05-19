import { fal } from '@fal-ai/client'

fal.config({ credentials: process.env.FAL_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { personBase64, personType = 'image/jpeg', garmentUrl, category = 'ust' } = req.body

  if (!personBase64 || !garmentUrl) return res.status(400).json({ error: 'Eksik parametre' })

  try {
    const cat = category === 'alt' ? 'bottoms' : 'tops'

    const blob = Buffer.from(personBase64, 'base64')
    const file = new Blob([blob], { type: personType })
    const personUrl = await fal.storage.upload(file)

    const result = await fal.subscribe('fal-ai/fashn/v1/try-on', {
      input: {
        model_image: personUrl,
        garment_image: garmentUrl,
        category: cat,
        mode: 'quality',
      },
    })

    res.json({ result_url: result.data.images[0].url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
