import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { RecoilRoot } from 'recoil'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

type Props = {
  children: JSX.Element
}

const AuthUser = ({ children }: Props) => {
  const user = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (user.uid !== '') {
      return
    } else {
      router.push('/')
    }
  }, [user])
  return children
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <AuthUser>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </AuthUser>
    </RecoilRoot>
  )
}

export default MyApp
