import { auth } from '../../firebase'
import { signOut } from 'firebase/auth'
import { useRecoilState } from 'recoil'
import { userState } from '@/lib/auth'
import { NAV_ITEMS } from './NavItems'
import { Box, Text, Stack, Button, HStack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export const DesktopNav: React.FC = () => {
  const [user, setUser] = useRecoilState(userState)
  const [isLogin, setIsLogin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsLogin(user.uid !== '')
  }, [])

  // ログアウト処理
  const handleLogout = async () => {
    alert('ログアウトしました')
    await signOut(auth)
    setUser({
      uid: '',
      photoUrl: '',
      displayName: '',
    })

    router.reload()
  }

  return (
    <Stack
      direction={'row'}
      spacing={4}
      // alignItems={"center"}
      justify={'right'}
      w={'full'}
    >
      <HStack>
        {/* 未ログイン状態では、ナビゲーション非表示 */}
        {isLogin && (
          <>
            {NAV_ITEMS.map((navItem) => (
              <Box key={navItem.label}>
                {/* リンク */}
                <NextLink
                  href={user.uid === '' ? '/' : navItem.href ?? '#'}
                  passHref
                >
                  <Text
                    as='a'
                    p={2}
                    fontSize={'sm'}
                    fontWeight={'bold'}
                    color={'gray.600'}
                    _hover={{
                      textDecoration: 'none',
                      color: 'blue.600',
                      cursor: 'pointer',
                    }}
                  >
                    {navItem.label}
                  </Text>
                </NextLink>
              </Box>
            ))}
          </>
        )}

        {/* Sign upボタン */}
        {!isLogin && (
          <>
            <NextLink href='/login' passHref>
              <Button
                as='a'
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'blue.400'}
                _hover={{
                  bg: 'blue.300',
                }}
              >
                Login
              </Button>
            </NextLink>
            <NextLink href='/signup' passHref>
              <Button
                as='a'
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'pink.400'}
                _hover={{
                  bg: 'pink.300',
                }}
              >
                Sign up
              </Button>
            </NextLink>
          </>
        )}

        {/* ログアウトボタン */}
        {isLogin && (
          <Button
            as='a'
            display={{ base: 'none', md: 'inline-flex' }}
            fontSize={'sm'}
            fontWeight={600}
            color={'white'}
            bg={'blue.400'}
            _hover={{
              bg: 'blue.300',
            }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        )}
      </HStack>
    </Stack>
  )
}
