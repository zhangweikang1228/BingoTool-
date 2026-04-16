import NextAuth, { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getUserByGithubId, createUser } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId:     process.env.GITHUB_CLIENT_ID     || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    // WeChat 扫码登录
    CredentialsProvider({
      id: 'wechat-scan',
      name: '微信扫码登录',
      credentials: {
        openid:   { label: 'openid',   type: 'text' },
        nickname: { label: 'nickname', type: 'text' },
        avatar:   { label: 'avatar',   type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.openid) return null
        return { id: credentials.openid, name: credentials.nickname, email: `${credentials.openid}@wechat`, image: credentials.avatar }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github') {
        const ghProfile = profile as { id?: number; login?: string; avatar_url?: string; name?: string; email?: string }
        let existing = getUserByGithubId(String(ghProfile.id))
        if (!existing) {
          existing = createUser({
            name: ghProfile.name || ghProfile.login || 'GitHub 用户',
            email: ghProfile.email || `${ghProfile.id}@github`,
            avatar: ghProfile.avatar_url,
            provider: 'github',
            githubId: String(ghProfile.id),
            plan: 'free',
          })
        }
        user.id = existing.id
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) { token.userId = user.id; token.provider = account?.provider || 'github' }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId
        ;(session.user as any).provider = token.provider
      }
      return session
    },
  },
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'bingo-tool-dev-secret-change-in-production',
}
