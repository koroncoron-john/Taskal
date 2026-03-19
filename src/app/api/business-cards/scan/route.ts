import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

interface ExtractedCard {
    name: string
    company: string
    role: string
    email: string
    phone: string
}

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY が設定されていません' }, { status: 500 })
        }

        const { images } = await req.json() as { images: string[] } // base64 data URL配列

        if (!images || images.length === 0) {
            return NextResponse.json({ error: '画像が指定されていません' }, { status: 400 })
        }

        if (images.length > 10) {
            return NextResponse.json({ error: '一度に処理できる名刺は10枚までです' }, { status: 400 })
        }

        // 各画像をGemini Visionで解析
        const results: ExtractedCard[] = []

        for (const dataUrl of images) {
            // data:image/jpeg;base64,xxxxx → xxxxx
            const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')
            const mimeMatch = dataUrl.match(/^data:(image\/\w+);base64,/)
            const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'

            const prompt = `この名刺画像から以下の情報を抽出してください。
JSON形式で返してください。不明な場合は空文字列にしてください。
{
  "name": "氏名（フルネーム）",
  "company": "会社名・組織名",
  "role": "役職・部署名",
  "email": "メールアドレス",
  "phone": "電話番号（携帯や直通があれば優先）"
}
JSONのみ返してください。説明文は不要です。`

            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                {
                                    inline_data: {
                                        mime_type: mimeType,
                                        data: base64,
                                    }
                                },
                                { text: prompt }
                            ]
                        }],
                        generationConfig: {
                            temperature: 0.1,
                            response_mime_type: 'application/json',
                        }
                    })
                }
            )

            if (!res.ok) {
                const err = await res.text()
                console.error('Gemini API error:', err)
                results.push({ name: '', company: '', role: '', email: '', phone: '' })
                continue
            }

            const data = await res.json()
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

            try {
                const parsed = JSON.parse(text) as ExtractedCard
                results.push({
                    name: parsed.name || '',
                    company: parsed.company || '',
                    role: parsed.role || '',
                    email: parsed.email || '',
                    phone: parsed.phone || '',
                })
            } catch {
                results.push({ name: '', company: '', role: '', email: '', phone: '' })
            }
        }

        return NextResponse.json({ results })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
    }
}
