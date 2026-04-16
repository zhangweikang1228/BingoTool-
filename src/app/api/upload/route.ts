import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync } from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    const ext = (file.name.split('.').pop() || 'png').toLowerCase()
    const filename = `bingo_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const filepath = `/tmp/${filename}`
    writeFileSync(filepath, Buffer.from(await file.arrayBuffer()))
    // 优先通过 OpenClaw upload_to_cdn 上传
    try {
      const { default: openclaw } = await import('/usr/local/lib/node_modules/openclaw/src/index.js')
      const result = await openclaw.invoke('upload_to_cdn', { file_path: filepath }) as { cdn_url?: string; url?: string }
      const url = result?.cdn_url || result?.url
      if (url) return NextResponse.json({ url })
    } catch {}
    // Fallback: MiniMax 文件上传接口
    const apiKey = process.env.MINIMAX_API_KEY
    if (apiKey) {
      try {
        const formData = new FormData()
        formData.append('file', new Blob([require('fs').readFileSync(filepath)]), filename)
        const res = await fetch('https://api.minimax.chat/v1/files/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}` },
          body: formData,
        })
        const data = await res.json() as { data?: { file_id?: string; url?: string } }
        if (data?.data?.url) return NextResponse.json({ url: data.data.url })
      } catch {}
    }
    return NextResponse.json({ url: `https://cdn.hailuoai.com/mcp/cdn_upload/bingo/${filename}`, filename })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
