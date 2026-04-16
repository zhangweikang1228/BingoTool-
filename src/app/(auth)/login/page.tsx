'use client'
import { signIn } from 'next-auth/react'
import { useState, useCallback } from 'react'

export default function LoginPage() {
  const [wxScanStatus, setWxScanStatus] = useState<'idle'|'showing'|'scanning'|'confirmed'|'expired'>('idle')
  const [wxSessionId, setWxSessionId] = useState('')
  const [wxQrUrl, setWxQrUrl] = useState('')

  const startWechatScan = useCallback(async () => {
    setWxScanStatus('showing')
    try {
      const res = await fetch('/api/auth/wechat/scan?action=create')
      const data = await res.json()
      setWxSessionId(data.sessionId)
      setWxQrUrl(data.qrUrl)
      setWxScanStatus('scanning')
      // 开始轮询
      const poll = setInterval(async () => {
        const pr = await fetch(`/api/auth/wechat/scan?action=poll&sessionId=${data.sessionId}`)
        const pd = await pr.json()
        if (pd.status === 'confirmed') {
          clearInterval(poll)
          setWxScanStatus('confirmed')
          // 触发 NextAuth 的 WeChat credentials 登录
          await signIn('wechat-scan', {
            openid: pd.user.id,
            nickname: pd.user.name,
            avatar: pd.user.avatar || '',
            callbackUrl: '/dashboard',
          })
        } else if (pd.status === 'expired') {
          clearInterval(poll)
          setWxScanStatus('expired')
        }
      }, 2000)
    } catch {
      setWxScanStatus('idle')
    }
  }, [])

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-logo">🛒 <span>BingoTool</span></div>
        <div className="login-subtitle">AI 电商内容工坊</div>
        <div className="login-desc">一键生成商品主图 · 种草文案 · 短视频脚本</div>

        <div className="login-divider">登录 / 注册</div>

        {/* GitHub 登录 */}
        <button className="btn-github" onClick={() => signIn('github', { callbackUrl: '/dashboard' })}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          使用 GitHub 登录
        </button>

        {/* 分割线 */}
        <div className="or-divider"><span>或</span></div>

        {/* 微信扫码 */}
        {wxScanStatus === 'idle' && (
          <button className="btn-wechat" onClick={startWechatScan}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.348 2.21c-1.366-.022-2.775.404-3.585 1.28-.807.874-1.068 2.02-.912 3.112.156 1.092.823 2.026 1.74 2.544a8.5 8.5 0 002.56.728l-.23-1.22a7.45 7.45 0 01-.83-.045c-.274-.026-.544.147-.585.421-.04.275.1.544.35.63l1.21.42c1.11.284 2.238-.412 2.397-1.518.16-1.105-.43-2.15-1.37-2.44-.517-.17-.792.07-1.05.31-.255.238-.59.357-.915.325l-.24-1.192a1.214 1.214 0 00.67-.67c.12-.27-.007-.57-.28-.662zm-2.506 3.076c.45-.05.887.13 1.142.53.255.398.29.901.09 1.32-.204.42-.6.703-1.053.783-.453.08-.92-.05-1.262-.35-.34-.297-.5-.73-.424-1.16.076-.43.4-.803.823-.953zm4.38 0c.45-.05.888.13 1.142.53.255.398.29.901.09 1.32-.203.42-.6.703-1.053.783-.453.08-.92-.05-1.262-.35-.34-.297-.5-.73-.424-1.16.076-.43.4-.803.823-.953z"/>
            </svg>
            微信扫码登录
          </button>
        )}

        {wxScanStatus === 'showing' && (
          <div className="wx-scan-loading">正在生成二维码...</div>
        )}

        {wxScanStatus === 'scanning' && wxQrUrl && (
          <div className="wx-scan-box">
            <div className="wx-tip">请使用微信扫描下方二维码</div>
            <img src={wxQrUrl} alt="微信扫码" className="wx-qr" />
            <div className="wx-expire">有效期 5 分钟</div>
            <button className="btn-ghost btn-sm" onClick={() => setWxScanStatus('idle')}>取消</button>
          </div>
        )}

        {wxScanStatus === 'confirmed' && (
          <div className="wx-scan-box">
            <div className="wx-success">✅ 登录成功！跳转中...</div>
          </div>
        )}

        {wxScanStatus === 'expired' && (
          <div className="wx-scan-box">
            <div className="wx-expired">二维码已过期</div>
            <button className="btn-ghost btn-sm" onClick={() => setWxScanStatus('idle')}>重新生成</button>
          </div>
        )}

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
        .login-divider { font-size: 12px; color: #9ca3af; margin-bottom: 20px; text-transform: uppercase; letter-spacing: .1em; }
        .btn-github { width: 100%; padding: 13px; border: 1.5px solid #e5e7eb; border-radius: 12px; background: #24292e; color: white; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all .2s; margin-bottom: 16px; }
        .btn-github:hover { background: #1a1f23; transform: translateY(-1px); }
        .or-divider { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; color: #9ca3af; font-size: 12px; }
        .or-divider::before, .or-divider::after { content: ''; flex: 1; height: 1px; background: #e5e7eb; }
        .btn-wechat { width: 100%; padding: 13px; border: none; border-radius: 12px; background: #07c160; color: white; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all .2s; margin-bottom: 16px; }
        .btn-wechat:hover { background: #06ad56; transform: translateY(-1px); }
        .wx-scan-loading { padding: 20px; color: #6b7280; font-size: 14px; }
        .wx-scan-box { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 16px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; }
        .wx-tip { font-size: 14px; font-weight: 600; color: #1e1e2e; }
        .wx-qr { width: 180px; height: 180px; border-radius: 8px; }
        .wx-expire { font-size: 12px; color: #9ca3af; }
        .wx-success { font-size: 14px; color: #10b981; font-weight: 600; }
        .wx-expired { font-size: 14px; color: #dc2626; }
        .btn-ghost { background: white; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 12px; padding: 5px 12px; cursor: pointer; color: #6b7280; }
        .btn-sm { font-size: 12px !important; padding: 5px 10px !important; }
        .login-footer { margin-top: 24px; font-size: 11px; color: #9ca3af; }
        .login-footer a { color: #4f46e5; text-decoration: none; }
      `}</style>
    </div>
  )
}
