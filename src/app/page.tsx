import Link from 'next/link'

export default function Home() {
  return (
    <>
      {/* 导航栏 */}
      <nav className="navbar">
        <div className="container">
          <Link href="/" className="logo">
            <div className="logo-icon">B</div>
            BingoTool
          </Link>
          <ul className="nav-links">
            <li><Link href="/dashboard">仪表盘</Link></li>
            <li><Link href="/generate/image">商品图</Link></li>
            <li><Link href="/generate/text">种草文案</Link></li>
            <li><Link href="/generate/model">虚拟模特</Link></li>
            <li><Link href="/generate/translate">翻译</Link></li>
          </ul>
          <Link href="/login" className="btn btn-primary">
            立即登录
          </Link>
        </div>
      </nav>

      {/* Hero区域 */}
      <section className="hero">
        <h1>AI内容生成平台</h1>
        <p>一键生成商品主图、种草文案、短视频脚本<br />让内容生产效率提升10倍</p>
        <div className="hero-buttons">
          <Link href="/login" className="btn-white">
            立即开始免费使用
          </Link>
          <Link href="#features" className="btn-outline-white">
            了解更多
          </Link>
        </div>
      </section>

      {/* 功能介绍 */}
      <div className="features" id="features">
        <div className="feature-card">
          <div className="feature-icon">🖼️</div>
          <h3>商品图生成</h3>
          <p>上传商品图片，AI自动生成精美主图，支持背景替换、场景合成，让你的商品脱颖而出。</p>
          <Link href="/login" className="feature-btn">
            立即使用 
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon">✍️</div>
          <h3>种草文案</h3>
          <p>输入商品信息，AI生成小红书、抖音风格的种草文案，吸睛又转化，让用户忍不住下单。</p>
          <Link href="/login" className="feature-btn">
            立即使用 
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon">👗</div>
          <h3>虚拟模特试穿</h3>
          <p>上传服装图片，AI生成模特上身效果图，多肤色、多场景可选，省去拍摄成本。</p>
          <Link href="/login" className="feature-btn">
            立即使用 
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🌐</div>
          <h3>多语言翻译</h3>
          <p>一键将内容翻译成英语、日语、韩语等15+语种，助力跨境电商快速出海。</p>
          <Link href="/login" className="feature-btn">
            立即使用 
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* 底部 */}
      <footer className="footer">
        <p>© 2024 BingoTool. 让内容生产更简单。</p>
      </footer>
    </>
  )
}
