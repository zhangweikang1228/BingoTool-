'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type AuthMode = 'login' | 'register'
type LoginType = 'password' | 'phone'

export default function LoginPage() {
  const router = useRouter()
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [loginType, setLoginType] = useState<LoginType>('password')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [success, setSuccess] = useState(false)

  // 表单数据
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // 密码强度
  const [showRegisterLink, setShowRegisterLink] = useState(false)

  useEffect(() => {
    if (document.cookie.includes('user_id=')) {
      router.push('/dashboard')
    }
  }, [router])

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const sendCode = async () => {
    const targetPhone = (authMode === 'register' || loginType === 'phone') ? phone : phone
    
    if (authMode === 'login' && loginType === 'password') {
      setError('')
      setSuccess(false)
      return
    }
    
    if (!targetPhone || targetPhone.length !== 11) {
      setError('请输入正确的11位手机号')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: targetPhone })
      })
      
      if (res.ok) {
        setCountdown(60)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const data = await res.json()
        setError(data.message || '发送失败，请重试')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // 登录 - 邮箱
    if (authMode === 'login' && loginType === 'password') {
      if (!email) {
        setError('请输入邮箱地址')
        return
      }
      if (!email.includes('@')) {
        setError('请输入正确的邮箱地址')
        return
      }
      if (!password) {
        setError('请输入密码')
        return
      }
      if (password.length < 6) {
        setError('密码至少6位')
        return
      }
    } 
    // 登录 - 手机
    else if (authMode === 'login' && loginType === 'phone') {
      if (!phone || phone.length !== 11) {
        setError('请输入正确的11位手机号')
        return
      }
      if (!code || code.length !== 6) {
        setError('请输入6位验证码')
        return
      }
    } 
    // 注册 - 邮箱
    else if (authMode === 'register' && loginType === 'password') {
      if (!email) {
        setError('请输入邮箱地址')
        return
      }
      if (!email.includes('@')) {
        setError('请输入正确的邮箱地址')
        return
      }
      if (!password) {
        setError('请输入密码')
        return
      }
      if (password.length < 8) {
        setError('密码至少8位')
        return
      }
      if (password !== confirmPassword) {
        setError('两次密码输入不一致')
        return
      }
    }
    // 注册 - 手机
    else {
      if (!phone || phone.length !== 11) {
        setError('请输入正确的11位手机号')
        return
      }
      if (!code || code.length !== 6) {
        setError('请输入6位验证码')
        return
      }
      if (!password) {
        setError('请设置密码')
        return
      }
      if (password.length < 8) {
        setError('密码至少8位')
        return
      }
    }
    
    setLoading(true)
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: (authMode === 'login' && loginType === 'password') || (authMode === 'register' && loginType === 'password') ? email : undefined,
          phone: (authMode === 'login' && loginType === 'phone') || (authMode === 'register' && loginType === 'phone') ? phone : undefined,
          password,
          code,
          mode: authMode
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        // 注册成功后自动登录
        router.push('/dashboard')
      } else {
        setError(data.message || (authMode === 'login' ? '登录失败，请检查信息' : '注册失败，请重试'))
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const switchToRegister = () => {
    setAuthMode('register')
    setLoginType('password')
    setError('')
    setSuccess(false)
    setShowRegisterLink(true)
  }

  const switchToLogin = () => {
    setAuthMode('login')
    setError('')
    setSuccess(false)
    setShowRegisterLink(false)
  }

  const getPasswordStrength = (pwd: string): 'weak' | 'medium' | 'strong' | '' => {
    if (!pwd) return ''
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd)) return 'strong'
    if (pwd.length >= 6) return 'medium'
    return 'weak'
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <>
      <div className="ambient-bg"></div>
      
      <div className="login-page">
        <div className="login-card">
          {/* Logo */}
          <div className="login-header">
            <div className="login-logo">B</div>
            <h2>{authMode === 'login' ? '欢迎回来' : '创建账号'}</h2>
            <p>{authMode === 'login' ? '登录你的账号' : '注册你的账号'}</p>
          </div>

          {/* 登录 Tab */}
          {authMode === 'login' && (
            <div className="login-tabs">
              <button 
                className={`login-tab ${loginType === 'password' ? 'active' : ''}`}
                onClick={() => { setLoginType('password'); setError(''); }}
              >
                邮箱登录
              </button>
              <button 
                className={`login-tab ${loginType === 'phone' ? 'active' : ''}`}
                onClick={() => { setLoginType('phone'); setError(''); }}
              >
                手机登录
              </button>
            </div>
          )}

          {/* 注册 Tab */}
          {authMode === 'register' && (
            <div className="login-tabs">
              <button 
                className={`login-tab ${loginType === 'password' ? 'active' : ''}`}
                onClick={() => { setLoginType('password'); setError(''); }}
              >
                邮箱注册
              </button>
              <button 
                className={`login-tab ${loginType === 'phone' ? 'active' : ''}`}
                onClick={() => { setLoginType('phone'); setError(''); }}
              >
                手机注册
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 错误/成功提示 */}
            {error && (
              <div className="alert alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <span>✓</span> 验证码已发送
              </div>
            )}

            {/* 邮箱登录表单 */}
            {(authMode === 'login' && loginType === 'password') && (
              <>
                <div className="form-group">
                  <label className="form-label">邮箱地址</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">密码</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="form-options">
                  <label className="remember-me">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>记住我</span>
                  </label>
                  <a className="forgot-password">忘记密码？</a>
                </div>
              </>
            )}

            {/* 手机登录表单 */}
            {(authMode === 'login' && loginType === 'phone') && (
              <>
                <div className="form-group">
                  <label className="form-label">手机号码</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="请输入11位手机号"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength={11}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">验证码</label>
                  <div className="captcha-container">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="请输入6位验证码"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                    />
                    <button 
                      type="button"
                      className="captcha-btn"
                      onClick={sendCode}
                      disabled={countdown > 0 || loading}
                    >
                      {countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* 邮箱注册表单 */}
            {(authMode === 'register' && loginType === 'password') && (
              <>
                <div className="form-group">
                  <label className="form-label">邮箱地址</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">设置密码</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="请设置密码（至少8位）"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {password && (
                    <div className="password-strength">
                      <div className={`password-strength-bar ${passwordStrength}`}></div>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">确认密码</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="请再次输入密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* 手机注册表单 */}
            {(authMode === 'register' && loginType === 'phone') && (
              <>
                <div className="form-group">
                  <label className="form-label">手机号码</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="请输入11位手机号"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength={11}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">验证码</label>
                  <div className="captcha-container">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="请输入6位验证码"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                    />
                    <button 
                      type="button"
                      className="captcha-btn"
                      onClick={sendCode}
                      disabled={countdown > 0 || loading}
                    >
                      {countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">设置密码</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="请设置密码（至少8位）"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {password && (
                    <div className="password-strength">
                      <div className={`password-strength-bar ${passwordStrength}`}></div>
                    </div>
                  )}
                </div>
              </>
            )}

            <button 
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? '处理中...' : (authMode === 'login' ? '登录' : '注册')}
            </button>
          </form>

          <div className="login-divider">
            <span>{authMode === 'login' ? '或使用以下方式登录' : '或使用以下方式注册'}</span>
          </div>

          <div className="social-login">
            <button className="social-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#4285F4">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="social-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* 登录/注册切换 */}
          <div className="login-footer">
            {authMode === 'login' ? (
              <>
                还没有账号？<a href="#" onClick={switchToRegister} style={{ color: '#2997ff', fontWeight: 600 }}>立即注册</a>
              </>
            ) : (
              <>
                已有账号？<a href="#" onClick={switchToLogin} style={{ color: '#2997ff', fontWeight: 600 }}>立即登录</a>
              </>
            )}
          </div>

          {/* 返回首页 */}
          <div className="back-home">
            <Link href="/">← 返回首页</Link>
          </div>
        </div>
      </div>
    </>
  )
}
