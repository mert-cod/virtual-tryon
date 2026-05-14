import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { imageBase64, imageType = 'image/jpeg', category = 'ust' } = req.body

  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 gerekli' })

  const sizeList = category === 'alt' ? '34, 36, 38, 40, 42' : 'XS, S, M, L, XL'

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: imageType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Bu fotoğraftaki kişinin vücut yapısını analiz et. ${category === 'alt' ? 'Alt giyim' : 'Üst giyim'} için uygun beden öner. Mevcut bedenler: ${sizeList}. Sadece JSON döndür, başka hiçbir şey yazma: {"size": "M", "reason": "kısa Türkçe açıklama"}`,
            },
          ],
        },
      ],
    })

    const text = msg.content[0].text.trim()
    const json = JSON.parse(text)
    res.json(json)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
