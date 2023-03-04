import { auth } from '../../firebase'
import { signOut } from 'firebase/auth'
import { useState, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { userState } from '@/lib/auth'
import { Flex, Text, Stack, useDisclosure, Button } from '@chakra-ui/react'
import NextLink from 'next/link'
import { NAV_ITEMS } from './NavItems'
import { useRouter } from 'next/router'

export const MobileNav: React.FC = () => {
  const { onToggle } = useDisclosure()
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
    <Stack bg={'white'} p={4} display={{ md: 'none' }}>
      {/* ログインしている時 */}
      {isLogin ? (
        <>
          {NAV_ITEMS.map((navItem) => (
            <Stack spacing={4} onClick={onToggle} key={navItem.label}>
              <Flex
                py={2}
                justify={'space-between'}
                align={'center'}
                _hover={{
                  textDecoration: 'none',
                }}
              >
                <NextLink href={navItem.href ?? '#'}>
                  <Text
                    as='a'
                    fontWeight={600}
                    color={'gray.600'}
                    _hover={{
                      cursor: 'pointer',
                    }}
                    marginBottom={'10px'}
                  >
                    {navItem.label}
                  </Text>
                </NextLink>
              </Flex>
            </Stack>
          ))}
        </>
      ) : (
        <>
          <Flex
            py={2}
            justify={'space-between'}
            align={'center'}
            _hover={{
              textDecoration: 'none',
            }}
          >
            <NextLink href='/posts'>
              <Text
                as='a'
                fontWeight={600}
                color={'gray.600'}
                _hover={{
                  cursor: 'pointer',
                }}
                marginBottom={'10px'}
              >
                投稿一覧
              </Text>
            </NextLink>
          </Flex>
        </>
      )}

      {/* ログアウト状態の時 */}
      {!isLogin && (
        <Flex direction={'column'} maxW={'80px'}>
          <NextLink href='/login' passHref>
            <Button
              as='a'
              fontSize={'sm'}
              fontWeight={600}
              color={'white'}
              bg={'blue.400'}
              _hover={{
                bg: 'blue.300',
              }}
              mb={4}
            >
              Login
            </Button>
          </NextLink>
          <NextLink href='/signup' passHref>
            <Button
              as='a'
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
        </Flex>
      )}

      {/* ログアウトボタン */}
      {isLogin && (
        <Button
          as='a'
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
    </Stack>
  )
}
