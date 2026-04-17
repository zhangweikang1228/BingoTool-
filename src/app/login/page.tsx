'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState(1) // 1: 输入手机号, 2: 输入验证码
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 发送验证码
  const sendCode = async () => {
    if (!phone || phone.length !== 11) {
      setError('请输入正确的手机号')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })
      
      if (res.ok) {
        setStep(2)
      } else {
        setError('发送失败，请重试')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 登录
  const login = async () => {
    if (!code || code.length !== 6) {
      setError('请输入6位验证码')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      })
      
      if (res.ok) {
        router.push('/dashboard')
      } else {
        setError('验证码错误')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 第三方登录
  const socialLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>登录 BingoTool</h1>
        
        {error && (
          <div style={{ 
            padding: '12px', 
            background: '#fee', 
            color: '#c00', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {step === 1 ? (
          <>
            <div className="form-group">
              <label>手机号</label>
              <input
                type="tel"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={11}
              />
            </div>
            
            <button 
              className="btn btn-primary" 
              onClick={sendCode}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '发送中...' : '获取验证码'}
            </button>
          </>
        ) : (
          <>
            <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
              验证码已发送至 {phone}
              <span 
                style={{ color: '#6366f1', marginLeft: '8px', cursor: 'pointer' }}
                onClick={() => setStep(1)}
              >
                修改
              </span>
            </p>
            
            <div className="form-group">
              <label>验证码</label>
              <input
                type="text"
                placeholder="请输入6位验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
              />
            </div>
            
            <button 
              className="btn btn-primary" 
              onClick={login}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '登录中...' : '登录'}
            </button>
            
            <p style={{ 
              marginTop: '16px', 
              textAlign: 'center', 
              color: '#999', 
              fontSize: '12px' 
            }}>
              未收到验证码？<span 
                style={{ color: '#6366f1', cursor: 'pointer' }}
                onClick={sendCode}
              >重新发送</span>
            </p>
          </>
        )}

        <div className="login-divider">或</div>

        <div className="social-login">
          <button onClick={() => socialLogin('google')}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button onClick={() => socialLogin('github')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#333">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </div>
      </div>
    </div>
  )
}
