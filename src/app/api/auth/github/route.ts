import { NextResponse } from 'next/server'
import { getGithubAuthUrl } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET() {
  const url = getGithubAuthUrl()
  return NextResponse.redirect(url)
}
