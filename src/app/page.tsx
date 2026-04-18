'use client'

import Link from 'next/link'
import styles from './page.module.css'

const features = [
  {
    id: 'image',
    icon: '🖼️',
    title: '商品图生成',
    desc: 'AI自动生成精美商品主图，一键优化展示效果',
    gradient: 'gradient1',
    href: '/generate/image',
    visual: '✨'
  },
  {
    id: 'text',
    icon: '✍️',
    title: '种草文案',
    desc: '智能创作小红书、抖音等平台种草内容',
    gradient: 'gradient2',
    href: '/generate/text',
    visual: '📝'
  },
  {
    id: 'model',
    icon: '👗',
    title: '虚拟模特',
    desc: 'AI模特试穿效果，节省拍摄成本',
    gradient: 'gradient3',
    href: '/generate/model',
    visual: '👤'
  },
  {
    id: 'translate',
    icon: '🌐',
    title: '多语言翻译',
    desc: '一键翻译15+语种，助力跨境电商',
    gradient: 'gradient4',
    href: '/generate/translate',
    visual: '🌍'
  },
]

export default function HomePage() {
  return (
    <>
      <div className={styles.gradientBg} />
      
      <nav className="navbar">
        <Link href="/" className="logo">
          <div className="logo-icon">B</div>
          BingoTool
        </Link>
        
        <ul className="nav-links">
          <li><Link href="/generate/image">商品图</Link></li>
          <li><Link href="/generate/text">种草文案</Link></li>
          <li><Link href="/generate/model">虚拟模特</Link></li>
          <li><Link href="/generate/translate">翻译</Link></li>
        </ul>
        
        <div className="nav-actions">
          <Link href="/admin" className="btn btn-ghost" style={{ marginRight: '12px' }}>
            管理后台
          </Link>
          <Link href="/login" className="btn btn-primary">
            立即开始
          </Link>
        </div>
      </nav>

      <main className={styles.hero}>
        <div className={styles.heroLabel}>
          <span>✨</span> AI 驱动创意平台
        </div>
        
        <h1>
          让创意<br />无限延伸
        </h1>
        
        <p>
          BingoTool 专为电商从业者打造<br />
          商品图、文案、模特，一键搞定
        </p>
        
        <div className={styles.heroActions}>
          <Link href="/login" className="btn btn-primary">
            🚀 立即体验
          </Link>
          <Link href="#features" className="btn btn-secondary">
            了解更多
          </Link>
        </div>
      </main>

      <section className={styles.showcase} id="features">
        <div className={styles.showcaseLabel}>核心功能</div>
        <h2>强大的 AI 能力</h2>
        <p className={styles.showcaseDesc}>
          告别繁琐的传统创作流程，用 AI 释放创意潜能
        </p>
      </section>

      <section className={styles.features}>
        <div className={styles.featuresGrid}>
          {features.map((f) => (
            <Link key={f.id} href={f.href} className={`${styles.featureCard} ${styles[f.gradient]}`}>
              <div className={styles.featureVisual}>
                <div className={styles.featureVisualInner}>
                  <span className={styles.featureIconLarge}>{f.visual}</span>
                </div>
              </div>
              <div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <span className={styles.learnMore}>
                  了解更多 →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <h2>准备好开始了吗？</h2>
        <p>立即体验 BingoTool，让创作变得简单</p>
        <Link href="/login" className={`btn btn-primary ${styles.ctaBtn}`}>
          🚀 开始使用
        </Link>
      </section>

      <footer className={styles.footer}>
        © 2024 BingoTool. All rights reserved.
      </footer>
    </>
  )
}
