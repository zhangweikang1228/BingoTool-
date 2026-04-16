/**
 * AI 能力封装 - 通过 OpenClaw Gateway 调用 MiniMax AI
 * 运行环境：Next.js API Routes (Node.js)
 */

const GATEWAY = 'http://127.0.0.1:18789'
const GATEWAY_TOKEN = process.env.OPENCLAW_TOKEN || ''

async function gatewayInvoke(action: string, params: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${GATEWAY}/invoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(GATEWAY_TOKEN ? { 'Authorization': `Bearer ${GATEWAY_TOKEN}` } : {})
    },
    body: JSON.stringify({ action, params })
  })
  if (!res.ok) throw new Error(`Gateway error ${res.status}: ${await res.text()}`)
  return res.json()
}

/** 调用 LLM 生成文本（种草文案） */
export async function llmTask(prompt: string, maxTokens = 2000): Promise<string> {
  const result = await gatewayInvoke('llm-task', { prompt, maxTokens, temperature: 0.8 }) as { result?: string; text?: string }
  return result?.result || result?.text || String(result)
}

/** 调用 image_synthesize 生成商品图 */
export async function generateImage(input: {
  prompt: string
  inputUrls?: string[]
  outputFile: string
  aspectRatio?: string
}): Promise<string> {
  const result = await gatewayInvoke('image_synthesize', {
    requests: [{
      prompt: input.prompt,
      input_urls: input.inputUrls || [],
      output_file: input.outputFile,
      aspect_ratio: input.aspectRatio || '1:1'
    }]
  }) as { cdn_url?: string; url?: string }
  return result?.cdn_url || result?.url || ''
}

/** 调用 gen_videos 生成视频 */
export async function generateVideo(input: {
  prompt?: string
  imageFile?: string
  outputFile: string
  duration?: number
}): Promise<string> {
  const result = await gatewayInvoke('gen_videos', {
    video_requests: [{
      prompt: input.prompt || 'Product showcase video',
      image_file: input.imageFile,
      output_file: input.outputFile,
      duration: input.duration || 6
    }]
  }) as { video_url?: string; url?: string }
  return result?.video_url || result?.url || ''
}
