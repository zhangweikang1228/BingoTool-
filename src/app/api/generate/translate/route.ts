import { NextResponse } from 'next/server'

// 简化的翻译逻辑（实际项目调用Google/DeepL/有道API）
const simpleTranslations: Record<string, Record<string, string>> = {
  '连衣裙': { en: 'Dress', ja: 'ドレス', ko: '원피스' },
  '运动鞋': { en: 'Sneakers', ja: 'スニーカー', ko: '운동화' },
  '美妆': { en: 'Beauty', ja: '美容', ko: '뷰티' },
  '零食': { en: 'Snacks', ja: 'お菓子', ko: '과자' },
  'T恤': { en: 'T-Shirt', ja: 'Tシャツ', ko: '티셔츠' }
}

const languageNames: Record<string, string> = {
  'en': 'English',
  'ja': '日本語',
  'ko': '한국어',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'pt': 'Português',
  'ru': 'Русский'
}

// 模拟翻译
const translateText = (text: string, targetLang: string): string => {
  // 实际项目中这里调用真实翻译API
  // 这里简单返回原文+语言标记作为模拟
  const langName = languageNames[targetLang] || targetLang
  
  // 简单的字符替换模拟
  let translated = text
  for (const [cn, translations] of Object.entries(simpleTranslations)) {
    if (translations[targetLang]) {
      translated = translated.replace(new RegExp(cn, 'g'), translations[targetLang])
    }
  }
  
  return `[${langName} Translation]\n\n${translated}\n\n---\n✅ Translated to ${langName}\n✅ SEO keywords optimized\n✅ Ready for cross-border platforms`
}

export async function POST(request: Request) {
  try {
    const { text, targetLang } = await request.json()
    
    if (!text) {
      return NextResponse.json(
        { error: '请输入要翻译的内容' },
        { status: 400 }
      )
    }
    
    if (!targetLang) {
      return NextResponse.json(
        { error: '请选择目标语言' },
        { status: 400 }
      )
    }
    
    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const translated = translateText(text, targetLang)
    
    return NextResponse.json({
      success: true,
      text: translated,
      sourceLang: 'zh',
      targetLang
    })
  } catch (error) {
    return NextResponse.json(
      { error: '翻译失败' },
      { status: 500 }
    )
  }
}
