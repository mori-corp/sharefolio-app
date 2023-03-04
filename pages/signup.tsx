import type { NextPage } from 'next'
import { useEffect } from 'react'
import { SignupForm } from '@/components/SignupForm'
import Layout from '@/components/Layout'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/router'

/**
    新規登録ページ
 */
const Signup: NextPage = () => {
  const user = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user.uid) {
      router.push('/')
    } else {
      return
    }
  }, [user])

  return (
    <Layout title={'ShareFolio｜ポートフォリオの共有サイト'}>
      <SignupForm />
    </Layout>
  )
}

export default Signup
