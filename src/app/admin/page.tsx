'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string | null
  phone: string | null
  role: string
  credits: {
    image: number
    video: number
    text: number
    translate: number
  }
  createdAt: string
  lastLogin?: string
}

interface CreditConfig {
  id: string
  type: string
  name: string
  cost: number
  description: string
}

export default function AdminPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [configs, setConfigs] = useState<CreditConfig[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingCredits, setEditingCredits] = useState<{[key: string]: number}>({})
  const [editingConfig, setEditingConfig] = useState<{[key: string]: number}>({})
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [activeTab, setActiveTab] = useState<'users' | 'config'>('users')
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [loggingIn, setLoggingIn] = useState(false)

  useEffect(() => {
    // 简单检查是否已登录（通过cookie）
    const cookies = document.cookie.split(';').reduce((acc, c) => {
      const [k, v] = c.trim().split('=')
      acc[k] = v
      return acc
    }, {} as {[key: string]: string})
    
    if (cookies['is_admin'] === 'true') {
      setIsAdmin(true)
      loadData()
    } else {
      setLoading(false)
    }
  }, [])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    setMessage(null)
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })
      const data = await res.json()
      if (data.success) {
        setIsAdmin(true)
        loadData()
      } else {
        setMessage({ type: 'error', text: data.message || '管理员账号或密码错误' })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch {
      setMessage({ type: 'error', text: '网络错误，请重试' })
      setTimeout(() => setMessage(null), 3000)
    }
    
    setLoggingIn(false)
  }

  const loadData = async () => {
    try {
      const [usersRes, configsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/config')
      ])
      
      const usersData = await usersRes.json()
      const configsData = await configsRes.json()
      
      if (usersData.success) setUsers(usersData.users)
      if (configsData.success) {
        setConfigs(configsData.configs)
        const initConfig: {[key: string]: number} = {}
        configsData.configs.forEach((c: CreditConfig) => {
          initConfig[c.type] = c.cost
        })
        setEditingConfig(initConfig)
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditingCredits({ ...user.credits })
  }

  const handleSaveCredits = async () => {
    if (!selectedUser) return
    
    try {
      const res = await fetch('/api/admin/credits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          credits: editingCredits
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: '额度更新成功' })
        setSelectedUser(null)
        loadData()
      } else {
        setMessage({ type: 'error', text: data.message || '更新失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '更新失败' })
    }
    
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSaveConfig = async (type: string) => {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          cost: editingConfig[type]
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: '配置已更新' })
        loadData()
      } else {
        setMessage({ type: 'error', text: data.message || '更新失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '更新失败' })
    }
    
    setTimeout(() => setMessage(null), 3000)
  }

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    setIsAdmin(false)
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    )
  }

  // 管理员登录页面
  if (!isAdmin) {
    return (
      <>
        <nav className="navbar">
          <Link href="/" className="nav-logo">
            <div className="logo-icon">B</div>
            <span>BingoTool</span>
          </Link>
          <div className="nav-actions">
            <Link href="/login" className="btn btn-ghost">返回登录</Link>
          </div>
        </nav>
        
        <div className="admin-login-page">
          <div className="admin-login-card">
            <h1>管理员登录</h1>
            <p>请输入管理员账号信息</p>
            
            {message && (
              <div className={`message message-${message.type}`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleAdminLogin}>
              <div className="form-group">
                <label>管理员邮箱</label>
                <input
                  type="email"
                  placeholder="管理员邮箱"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>密码</label>
                <input
                  type="password"
                  placeholder="请输入密码"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loggingIn}>
                {loggingIn ? '登录中...' : '登录'}
              </button>
            </form>
            
            <div className="admin-hint">
              <p>请使用管理员账号登录</p>
              <p>如遗忘密码，请联系系统管理员重置</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  // 管理员后台
  return (
    <>
      <nav className="navbar">
        <Link href="/" className="nav-logo">
          <div className="logo-icon">B</div>
          <span>BingoTool</span>
        </Link>
        <div className="nav-info">
          <span className="admin-badge">管理员后台</span>
        </div>
        <div className="nav-actions">
          <button onClick={handleLogout} className="btn btn-ghost">退出登录</button>
        </div>
      </nav>

      <div className="admin-page">
        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            用户管理
          </button>
          <button 
            className={`admin-tab ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveTab('config')}
          >
            额度配置
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>用户列表</h2>
              <p>共 {users.length} 位用户</p>
            </div>
            
            <div className="users-table">
              <div className="table-header">
                <span>用户信息</span>
                <span>商品图额度</span>
                <span>视频额度</span>
                <span>文案额度</span>
                <span>翻译额度</span>
                <span>操作</span>
              </div>
              
              {users.length === 0 ? (
                <div className="empty-state">
                  <p>暂无用户</p>
                </div>
              ) : (
                users.map(user => (
                  <div key={user.id} className="table-row">
                    <span className="user-info">
                      <strong>{user.email || user.phone}</strong>
                      <small>注册于 {new Date(user.createdAt).toLocaleDateString()}</small>
                    </span>
                    <span className="credit-value">{user.credits.image}</span>
                    <span className="credit-value">{user.credits.video}</span>
                    <span className="credit-value">{user.credits.text}</span>
                    <span className="credit-value">{user.credits.translate}</span>
                    <span>
                      <button 
                        className="btn btn-small btn-primary"
                        onClick={() => handleEditUser(user)}
                      >
                        编辑
                      </button>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>额度消耗配置</h2>
              <p>设置每个功能每次消耗的额度</p>
            </div>
            
            <div className="config-grid">
              {configs.map(config => (
                <div key={config.id} className="config-card">
                  <div className="config-info">
                    <h3>{config.name}</h3>
                    <p>{config.description}</p>
                  </div>
                  <div className="config-edit">
                    <label>每次消耗额度</label>
                    <div className="config-input-group">
                      <input
                        type="number"
                        min="1"
                        value={editingConfig[config.type] || config.cost}
                        onChange={(e) => setEditingConfig({
                          ...editingConfig,
                          [config.type]: parseInt(e.target.value) || 0
                        })}
                      />
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleSaveConfig(config.type)}
                      >
                        保存
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 编辑用户额度弹窗 */}
        {selectedUser && (
          <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>编辑用户额度</h3>
                <button className="modal-close" onClick={() => setSelectedUser(null)}>×</button>
              </div>
              <div className="modal-body">
                <p className="modal-user">
                  用户：<strong>{selectedUser.email || selectedUser.phone}</strong>
                </p>
                
                <div className="edit-credits-grid">
                  <div className="edit-credit-item">
                    <label>商品图额度</label>
                    <input
                      type="number"
                      min="0"
                      value={editingCredits.image}
                      onChange={(e) => setEditingCredits({
                        ...editingCredits,
                        image: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div className="edit-credit-item">
                    <label>视频额度</label>
                    <input
                      type="number"
                      min="0"
                      value={editingCredits.video}
                      onChange={(e) => setEditingCredits({
                        ...editingCredits,
                        video: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div className="edit-credit-item">
                    <label>文案额度</label>
                    <input
                      type="number"
                      min="0"
                      value={editingCredits.text}
                      onChange={(e) => setEditingCredits({
                        ...editingCredits,
                        text: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div className="edit-credit-item">
                    <label>翻译额度</label>
                    <input
                      type="number"
                      min="0"
                      value={editingCredits.translate}
                      onChange={(e) => setEditingCredits({
                        ...editingCredits,
                        translate: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setSelectedUser(null)}>
                  取消
                </button>
                <button className="btn btn-primary" onClick={handleSaveCredits}>
                  保存修改
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
