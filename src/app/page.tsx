import Link from 'next/link'

export default function Home() {
  return (
    <>
      {/* 导航栏 */}
      <nav className="navbar">
        <div className="container">
          <div className="logo">BingoTool</div>
          <ul className="nav-links">
            <li><Link href="/dashboard">仪表盘</Link></li>
            <li><Link href="/generate/image">商品图</Link></li>
            <li><Link href="/generate/text">种草文案</Link></li>
            <li><Link href="/generate/model">虚拟模特</Link></li>
            <li><Link href="/generate/translate">翻译</Link></li>
          </ul>
          <div>
            <Link href="/login">
              <button className="btn btn-secondary">登录</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero区域 */}
      <section className="hero">
        <div className="container">
          <h1>AI内容生成平台</h1>
          <p>一键生成商品主图、种草文案、短视频脚本</p>
          <Link href="/login">
            <button className="btn btn-primary">免费开始使用</button>
          </Link>
        </div>
      </section>

      {/* 功能介绍 */}
      <div className="container">
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">🖼️</div>
            <h3>商品图生成</h3>
            <p>上传商品图片，AI自动生成精美主图，支持背景替换、场景合成，让你的商品脱颖而出。</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✍️</div>
            <h3>种草文案</h3>
            <p>输入商品信息，AI生成小红书、抖音风格的种草文案，吸睛又转化，让用户忍不住下单。</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👗</div>
            <h3>虚拟模特试穿</h3>
            <p>上传服装图片，AI生成模特上身效果图，多肤色、多场景可选，省去拍摄成本。</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>多语言翻译</h3>
            <p>一键将内容翻译成英语、日语、韩语等15+语种，助力跨境电商快速出海。</p>
          </div>
        </div>
      </div>

      {/* 底部 */}
      <footer style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
        <div className="container">
          <p>© 2024 BingoTool. 让内容生产更简单。</p>
        </div>
      </footer>
    </>
  )
}
