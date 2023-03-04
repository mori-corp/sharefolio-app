import type { NextPage } from 'next'
import { useEffect } from 'react'
import Layout from '@/components/Layout'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/router'
import { LoginForm } from '@/components/LoginForm'

/**
    ログインページ
 */
const Login: NextPage = () => {
  const user = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user.uid) {
      router.push('/')
    } else {
      return
    }
  }, [])
  return (
    <Layout title={'ShareFolio｜ポートフォリオの共有サイト'}>
      <LoginForm />
    </Layout>
  )
}

export default Login
