'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

const features = [
  {
    id: 'image',
    icon: '📸',
    title: '商品图生成',
    desc: '一键生成多角度商品主图',
    image: '/image-banner.png',
    gradient: 'gradient1',
    href: '/generate/image',
  },
  {
    id: 'model',
    icon: '👗',
    title: '虚拟模特',
    desc: 'AI 生成服装模特展示图',
    image: '/model-banner.png',
    gradient: 'gradient3',
    href: '/generate/model',
  },
  {
    id: 'text',
    icon: '✍️',
    title: '种草文案',
    desc: '爆款文案一键生成',
    image: '/copy-banner.png',
    gradient: 'gradient2',
    href: '/generate/text',
  },
  {
    id: 'translate',
    icon: '🌍',
    title: '多语言翻译',
    desc: '跨境电商本地化翻译',
    image: '/translate-banner.png',
    gradient: 'gradient4',
    href: '/generate/translate',
  },
]

export default function HomePage() {
  const router = useRouter()
  const isAuthenticated = true // TODO: 实际应从 cookie 中读取

  return (
    <>
      <div className={styles.gradientBg} />
      
      <nav className="navbar">
        <Link href="/" className="logo">
          <div className="logo-icon">B</div>
          BingoTool
        </Link>
        
        <ul className="nav-links">
          {features.map(f => (
            <li key={f.id}>
              <Link href={f.href}>{f.title}</Link>
            </li>
          ))}
        </ul>
        
        <div className="nav-actions">
          <Link href="/dashboard" className="btn btn-ghost" style={{ marginRight: '12px' }}>
            工作台
          </Link>
          <div className="user-avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #818cf8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            U
          </div>
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
          <Link href="/dashboard" className="btn btn-primary">
            🚀 进入工作台
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
            <div 
              key={f.id} 
              className={`${styles.featureCard} ${styles[f.gradient]}`}
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(f.href)}
            >
              <div className={styles.featureVisual} style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.1), rgba(0,0,0,0.3))' }} />
                <img 
                  src={f.image} 
                  alt={f.title}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transition: 'transform 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: 'white' }}>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', display: 'block' }}>{f.icon} {f.title}</span>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>{f.desc}</span>
                </div>
              </div>
              <div>
                <span className={styles.learnMore}>
                  立即使用 →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <h2>准备好开始了吗？</h2>
        <p>立即体验 BingoTool，让创作变得简单</p>
        <Link href="/dashboard" className={`btn btn-primary ${styles.ctaBtn}`}>
          🚀 开始使用
        </Link>
      </section>

      <footer className={styles.footer}>
        © 2024 BingoTool. All rights reserved.
      </footer>
    </>
  )
}
