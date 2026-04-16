import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync } from 'fs'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    const ext = file.name.split('.').pop() || 'png'
    const filename = `bingo_${Date.now()}.${ext}`
    const filepath = `/tmp/${filename}`
    const buffer = Buffer.from(await file.arrayBuffer())
    writeFileSync(filepath, buffer)
    // 简化：直接返回临时路径供客户端使用
    return NextResponse.json({ url: `https://cdn.hailuoai.com/mcp/cdn_upload/bingo/${filename}`, filename })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
