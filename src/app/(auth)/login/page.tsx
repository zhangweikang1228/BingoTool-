'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginType === 'email' ? email : undefined,
          phone: loginType === 'phone' ? phone : undefined,
          password,
          code: loginType === 'phone' ? code : undefined,
          mode: mode,
        }),
      })

      const data = await res.json()
      if (!data.success) {
        setError(data.message || '操作失败')
        return
      }

      // 登录成功，跳转
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-logo">🛒 <span>BingoTool</span></div>
        <div className="login-subtitle">AI 电商内容工坊</div>
        <div className="login-desc">一键生成商品主图 · 种草文案 · 短视频脚本</div>

        <div className="login-tabs">
          <button
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            登录
          </button>
          <button
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            注册
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="login-type-tabs">
            <button
              type="button"
              className={loginType === 'email' ? 'active' : ''}
              onClick={() => setLoginType('email')}
            >
              邮箱登录
            </button>
            <button
              type="button"
              className={loginType === 'phone' ? 'active' : ''}
              onClick={() => setLoginType('phone')}
            >
              手机登录
            </button>
          </div>

          {loginType === 'email' ? (
            <>
              <input
                type="email"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="密码（至少8位）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </>
          ) : (
            <>
              <input
                type="tel"
                placeholder="手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <div className="code-row">
                <input
                  type="text"
                  placeholder="验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
                <button type="button" className="btn-code">
                  获取验证码
                </button>
              </div>
              <input
                type="password"
                placeholder="设置密码（至少8位）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </>
          )}

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        <div className="login-footer">
          登录即表示同意 <a href="/terms">《使用条款》</a>
        </div>
      </div>

      <style>{`
        .login-root { min-height: 100vh; background: linear-gradient(135deg, #4f46e5, #818cf8); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .login-card { background: white; border-radius: 20px; padding: 40px 32px; width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,.15); text-align: center; }
        .login-logo { font-size: 36px; margin-bottom: 6px; }
        .login-logo span { background: linear-gradient(135deg, #4f46e5, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: 800; }
        .login-subtitle { font-size: 18px; font-weight: 700; color: #1e1e2e; margin-bottom: 6px; }
        .login-desc { font-size: 13px; color: #6b7280; margin-bottom: 28px; }
        .login-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
        .login-tabs button { flex: 1; padding: 10px; border: none; background: #f3f4f6; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; color: #6b7280; }
        .login-tabs button.active { background: #4f46e5; color: white; }
        .login-type-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
        .login-type-tabs button { flex: 1; padding: 8px; border: 1px solid #e5e7eb; background: white; border-radius: 8px; font-size: 13px; cursor: pointer; color: #6b7280; }
        .login-type-tabs button.active { border-color: #4f46e5; color: #4f46e5; }
        input { width: 100%; padding: 12px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; margin-bottom: 12px; outline: none; box-sizing: border-box; }
        input:focus { border-color: #4f46e5; }
        .code-row { display: flex; gap: 8px; }
        .code-row input { flex: 1; margin-bottom: 12px; }
        .btn-code { padding: 0 14px; border: 1.5px solid #4f46e5; background: white; border-radius: 10px; color: #4f46e5; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; }
        .error-msg { color: #dc2626; font-size: 13px; margin-bottom: 12px; padding: 10px; background: #fef2f2; border-radius: 8px; }
        .btn-primary { width: 100%; padding: 14px; border: none; border-radius: 12px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 8px; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-footer { margin-top: 24px; font-size: 11px; color: #9ca3af; }
        .login-footer a { color: #4f46e5; text-decoration: none; }
      `}</style>
    </div>
  )
}
