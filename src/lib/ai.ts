/**
 * MiniMax AI 集成 - 原生 API 调用
 *
 * 配置方式：
 * 在服务器环境变量中设置 MINIMAX_API_KEY
 * 或在 Vercel / 环境变量中配置 NEXT_PUBLIC_MINIMAX_API_KEY
 *
 * MiniMax API 文档: https://www.minimaxi.com/document
 */

// ─── 类型定义 ────────────────────────────────────────────
export interface ImageGenResult { url: string; }
export interface VideoGenResult { url: string; }
export interface CopyGenResult { text: string; }

interface MiniMaxError {
  base_resp?: { status_code?: number; status_msg?: string }
  error?: string
}

// ─── 工具函数 ────────────────────────────────────────────
async function minimaxFetch(endpoint: string, body: Record<string, unknown>, apiKey: string): Promise<Response> {
  const baseUrls = [
    'https://api.minimax.chat',
    'https://api.minimaxi.chat',
  ]
  for (const base of baseUrls) {
    try {
      const res = await fetch(`${base}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(60000),
      })
      if (res.ok) return res
      // 尝试下一个
    } catch {
      // continue
    }
  }
  throw new Error('MiniMax API 服务不可用')
}

function parseError(res: unknown): string {
  const e = res as MiniMaxError
  return e?.base_resp?.status_msg || e?.error || '未知错误'
}

// ─── 角度 ID → 中文名称映射 ───────────────────────────────
export const ANGLE_MAP: Record<string, string> = {
  front:   '正面图',
  side:    '侧面图',
  back:    '背面图',
  angle45: '45°视角',
  top:     '俯视图',
  detail:  '细节图',
}

// ─── 角度 ID → 英文 Prompt ───────────────────────────────
const ANGLE_PROMPTS: Record<string, string> = {
  front:   'Clean white background, front view of product, centered, professional e-commerce photography, high quality, studio lighting',
  side:    'Clean white background, side view (90 degree angle), product facing right, same product identity, professional e-commerce photo',
  back:    'Clean white background, back view of product, centered, same style as reference photo, professional studio shot',
  angle45: 'Clean white background, 45-degree angle view, product slightly rotated for dynamic feel, professional e-commerce photography',
  top:     'Clean white background, top-down overhead view, looking straight down at the product, bird eye perspective, full product visible',
  detail:  'Clean white background, close-up macro detail shot showing texture and quality, shallow depth of field, premium product photography',
}

// ─── 商品图生成 ───────────────────────────────────────────
/**
 * 使用 MiniMax Image API 生成商品多角度图
 * API: POST /v1/image_generations
 */
export async function generateProductImage(
  inputImageUrl: string,
  angle: string,
  apiKey: string
): Promise<ImageGenResult> {
  const prompt = ANGLE_PROMPTS[angle] || ANGLE_PROMPTS.angle45
  const model = 'MiniMax-Image-01'

  const res = await minimaxFetch('/v1/image_generations', {
    model,
    prompt,
    image_url: inputImageUrl,
    num_images: 1,
    width: 1024,
    height: 1024,
  }, apiKey)

  const data = await res.json() as {
    data?: Array<{ image_url?: string; b64_image?: string }>
    base_resp?: { status_code: number; status_msg: string }
  }

  if (data.base_resp?.status_code !== 0 && data.base_resp?.status_code !== 200) {
    throw new Error(data.base_resp?.status_msg || '图像生成失败')
  }

  const img = data.data?.[0]
  const url = img?.image_url || (img?.b64_image ? `data:image/png;base64,${img.b64_image}` : '')

  if (!url) throw new Error('未获取到生成的图像')
  return { url }
}

// ─── 文案生成 ────────────────────────────────────────────
/**
 * 使用 MiniMax LLM 生成种草文案
 * API: POST /v1/text/chatquery_v2
 */
export async function generateCopy(
  product: string,
  platform: 'xiaohongshu' | 'douyin' | 'weibo',
  apiKey: string
): Promise<CopyGenResult> {
  const systemPrompts: Record<string, string> = {
    xiaohongshu: `你是一位专业的小红书种草文案博主，擅长写有感染力的商品推荐文案。

要求：
- 开头有代入感的生活场景切入，引发共鸣
- 产品卖点融入真实体验，不生硬推销
- 适当用 emoji，每段不要太长
- 结尾有互动引导（收藏/点赞/评论）
- 字数 300-500 字
- 语气亲切自然，像朋友推荐`,
    douyin: `你是一位抖音带货主播，擅长写有节奏感、冲动消费型的带货脚本。

要求：
- 前 3 秒必须抓眼球（疑问句/冲突场景/数字）
- 痛点 + 解决方案结构化表达
- 多次重复核心卖点，制造记忆点
- 结尾有促单话术
- 配合字幕标注和镜头建议
- 字数 400-600 字
- 语气有激情，节奏快`,
    weibo: `你是一位生活方式类微博博主，擅长写自然种草的长图文。

要求：
- 轻松第一人称分享口吻，自然不刻意
- 图文结合，有层次感
- 植入自然，不像硬广告
- 适当带话题标签 #好物推荐 #种草
- 字数 200-400 字
- 语气轻松随意`,
  }

  const model = 'abab6.5s-chat'

  const res = await minimaxFetch('/v1/text/chatquery_v2', {
    model,
    tokens_to_generate: 1024,
    temperature: 0.8,
    messages: [
      { role: 'system', content: systemPrompts[platform] },
      { role: 'user', content: `请为以下商品写一篇种草内容：\n\n${product}` },
    ],
  }, apiKey)

  const data = await res.json() as {
    choices?: Array<{ messages?: Array<{ text?: string }> }>
    base_resp?: { status_code: number; status_msg: string }
  }

  if (data.base_resp?.status_code !== 0 && data.base_resp?.status_code !== 200) {
    throw new Error(data.base_resp?.status_msg || '文案生成失败')
  }

  const text = data.choices?.[0]?.messages?.[0]?.text?.trim()
  if (!text) throw new Error('未获取到生成的文案')
  return { text }
}

// ─── 短视频脚本生成 ──────────────────────────────────────
/**
 * 使用 MiniMax LLM 生成短视频脚本
 */
export async function generateVideoScript(
  product: string,
  scene: string,
  apiKey: string
): Promise<CopyGenResult> {
  const sceneMap: Record<string, { label: string; desc: string }> = {
    unbox:  { label: '开箱展示', desc: '商品开箱 + 细节展示 + 使用体验 + 促单引导，节奏从期待→惊喜→说服' },
    style:  { label: '穿搭/摆放', desc: '整体展示 + 细节特写 + 场景搭配 + 情绪收尾' },
    detail: { label: '细节特写', desc: '全景→细节放大→对比展示→品质总结' },
    scene:  { label: '场景带入', desc: '生活场景开场→产品植入→沉浸体验→情感共鸣' },
  }

  const sceneInfo = sceneMap[scene] || sceneMap.unbox

  const prompt = `你是一位专业的抖音短视频编导，擅长写带分镜的短视频脚本。

商品信息：${product}
视频场景：${sceneInfo.label}
场景特点：${sceneInfo.desc}

请按以下格式生成脚本（总时长 30-60 秒）：

【视频脚本】场景：${sceneInfo.label} | 时长：约 45 秒

[0-5秒 | 开场 Hook]
画面：
配音/字幕：

[6-15秒 | 主体内容]
画面：
配音/字幕：

[16-30秒 | 深度展示]
画面：
配音/字幕：

[31-45秒 | 促单收尾]
画面：
配音/字幕：

🎵 建议 BGM 风格：
📌 注意事项：`

  const model = 'abab6.5s-chat'
  const res = await minimaxFetch('/v1/text/chatquery_v2', {
    model,
    tokens_to_generate: 1536,
    temperature: 0.8,
    messages: [{ role: 'user', content: prompt }],
  }, apiKey)

  const data = await res.json() as {
    choices?: Array<{ messages?: Array<{ text?: string }> }>
    base_resp?: { status_code: number; status_msg: string }
  }

  if (data.base_resp?.status_code !== 0 && data.base_resp?.status_code !== 200) {
    throw new Error(data.base_resp?.status_msg || '脚本生成失败')
  }

  const text = data.choices?.[0]?.messages?.[0]?.text?.trim()
  if (!text) throw new Error('未获取到生成的脚本')
  return { text }
}

// ─── AI 虚拟模特视频生成 ─────────────────────────────────
/**
 * 使用 MiniMax Video API 生成商品展示视频
 * API: POST /v1/video_generations
 */
export async function generateProductVideo(
  productImageUrl: string,
  apiKey: string,
  duration = 6
): Promise<VideoGenResult> {
  const prompt = 'Professional product showcase video, smooth rotating view, clean white background, e-commerce advertising style, high quality'

  const res = await minimaxFetch('/v1/video_generations', {
    model: 'video-01',
    prompt,
    input_image_urls: [productImageUrl],
    duration,
  }, apiKey)

  const data = await res.json() as {
    data?: Array<{ video_url?: string }>
    base_resp?: { status_code: number; status_msg: string }
  }

  if (data.base_resp?.status_code !== 0 && data.base_resp?.status_code !== 200) {
    throw new Error(data.base_resp?.status_msg || '视频生成失败')
  }

  const videoUrl = data.data?.[0]?.video_url
  if (!videoUrl) throw new Error('未获取到生成的视频')
  return { url: videoUrl }
}
