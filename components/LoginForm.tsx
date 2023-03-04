import { useState } from 'react'
import { auth, db } from '../firebase'
import NextLink from 'next/link'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { signInWithGoogle } from '@/lib/auth'
import { useRouter } from 'next/router'
import { setDoc, doc } from 'firebase/firestore'
import { useForm, SubmitHandler } from 'react-hook-form'

type Inputs = {
  username: string
  email: string
  password: string
}

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  // googleでサインイン
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // userのuidをdocument idとして指定し、firestoreへデータ格納
          const docRef = doc(db, 'users', user.uid)
          setDoc(docRef, {
            uid: user.uid,
            username: user.displayName,
            email: user.email,
            photoUrl: user.photoURL,
          })
          router.push('/')
        } else {
          console.log('No user exists!')
        }
      })
    } catch (error) {
      alert(error)
    }
  }

  // Email,passwordでのログイン
  const handleLoginWithEmail: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true)
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password)
      router.push('/')
    } catch (erorrs) {
      setIsSubmitting(false)
      console.log(errors)
      alert(
        'ログインに失敗しました。メールアドレスかパスワードに誤りがあります。'
      )
    }
  }

  // ゲストログイン
  const handleGuestLogin = async () => {
    setIsSubmitting(true)
    try {
      await signInWithEmailAndPassword(auth, 'guest@test.com', 'guestuser')
      router.push('/')
    } catch (erorrs) {
      setIsSubmitting(false)
      console.log(errors)
      alert(
        'ログインに失敗しました。メールアドレスかパスワードに誤りがあります。'
      )
    }
  }

  return (
    <Flex minH={'100vh'} align={'center'} justify={'center'} bg={'gray.50'}>
      <Stack
        spacing={8}
        mx={'auto'}
        my={0}
        maxW={'lg'}
        py={4}
        px={{ base: 2 }}
        w={{ base: '100%', md: '80%' }}
      >
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} textAlign={'center'}>
            ログインフォーム
          </Heading>
        </Stack>

        {/* フォームの白枠部分 */}
        <Box
          rounded={'lg'}
          bg={'white'}
          boxShadow={'lg'}
          py={8}
          px={{ base: 4, md: 12 }}
          w={'full'}
        >
          <Stack spacing={4} h={'full'}>
            {/* 認証方法の切り替えボタン */}
            <NextLink passHref href='/signup'>
              <Text
                as='a'
                my={2}
                color={'blue.500'}
                align={'center'}
                fontSize={'sm'}
                _hover={{
                  cursor: 'pointer',
                }}
              >
                まだアカウントをお持ちでない方
              </Text>
            </NextLink>

            {/* フォーム */}
            <form onSubmit={handleSubmit(handleLoginWithEmail)}>
              {/* email入力欄 */}
              <FormControl
                id='email'
                isInvalid={errors.email ? true : false}
                mb={4}
              >
                <FormLabel>Email address</FormLabel>
                <Input
                  id='email'
                  {...register('email', {
                    required: 'メールアドレスを入力してください',
                    pattern: {
                      value: /^[\w\-._]+@[\w\-._]+\.[A-Za-z]+/,
                      message: 'メールアドレスの形式が正しくありません',
                    },
                  })}
                  type='email'
                  placeholder='メールアドレス'
                  autoComplete='off'
                />
                <FormErrorMessage>
                  {errors.email && errors.email.message}
                </FormErrorMessage>
              </FormControl>

              {/* パスワード入力欄 */}
              <FormControl
                id='password'
                isInvalid={errors.password ? true : false}
                mb={8}
              >
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    id='password'
                    {...register('password', {
                      required: 'パスワードを入力してください',
                    })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder='パスワード'
                    autoComplete='off'
                  />

                  {/* パスワード可視化ボタン */}
                  <InputRightElement>
                    <Button
                      variant={'ghost'}
                      onClick={() =>
                        setShowPassword((showPassword) => !showPassword)
                      }
                    >
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>
                  {errors.password && errors.password.message}
                </FormErrorMessage>
              </FormControl>

              {/* ログインボタン */}
              <Stack>
                <Button
                  type='submit'
                  loadingText='Submitting'
                  size='md'
                  bg={'blue.400'}
                  color={'white'}
                  _hover={{
                    bg: 'blue.500',
                  }}
                  isLoading={isSubmitting}
                >
                  ログイン
                </Button>
              </Stack>
            </form>

            {/* ゲストログインボタン */}
            <Button
              onClick={handleGuestLogin}
              loadingText='Submitting'
              size='md'
              bg={'green.400'}
              color={'white'}
              _hover={{
                bg: 'green.500',
              }}
              isLoading={isSubmitting}
            >
              ゲストログイン
            </Button>

            {/* Google Sign inボタン */}
            <Button
              loadingText='Submitting'
              size='md'
              bg={'pink.400'}
              color={'white'}
              _hover={{
                bg: ' pink.500',
              }}
              onClick={handleGoogleSignIn}
              isLoading={isSubmitting}
            >
              Login with Google
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  )
}
