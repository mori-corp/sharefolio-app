import { useState } from 'react'
import { auth, db } from '../firebase'
import NextLink from 'next/link'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth'
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

export const SignupForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  // Email,passwordでの新規登録
  const handleSignUpWithEmail: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true)
    try {
      const newUser = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      )
      if (newUser) {
        const uid = newUser.user.uid
        const photoUrl = newUser.user.photoURL
        // userのuidをdocument idとして指定し、firestoreへデータ格納
        const docRef = doc(db, 'users', uid)
        await setDoc(docRef, {
          uid: uid,
          username: data.username,
          email: data.email,
          photoUrl: photoUrl,
        })

        router.push(`/mypage/${uid}`)
        setIsSubmitting(false)
      }
    } catch (error) {
      alert(error)
    }
  }

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
            photoUrl: user.photoURL,
          })
        } else {
          console.log('No user exists!')
        }
      })
    } catch (error) {
      alert(error)
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
            新規登録
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
            <NextLink href='/login' passHref>
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
                既にアカウントをお持ちの方
              </Text>
            </NextLink>

            {/* フォーム */}
            <form onSubmit={handleSubmit(handleSignUpWithEmail)}>
              {/* username入力欄 */}
              <FormControl isInvalid={errors.username ? true : false} mb={4}>
                <FormLabel htmlFor='username'>Username</FormLabel>
                <Input
                  id='username'
                  {...register('username', {
                    required: 'ユーザー名を入力してください',
                    maxLength: {
                      value: 20,
                      message: '20文字以内で入力してください',
                    },
                  })}
                  placeholder='ユーザー名'
                  autoComplete='off'
                />
                <FormErrorMessage>
                  {errors.username && errors.username.message}
                </FormErrorMessage>
              </FormControl>

              {/* email入力欄 */}
              <FormControl
                id='email'
                isInvalid={errors.email ? true : false}
                mb={4}
              >
                <FormLabel htmlFor='email'>Email address</FormLabel>
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
                mb={4}
              >
                <FormLabel htmlFor='password'>Password</FormLabel>
                <InputGroup>
                  <Input
                    id='password'
                    {...register('password', {
                      required: '6文字以上で入力してください',
                      minLength: {
                        value: 6,
                        message: '6文字以上で入力してください',
                      },
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

              {/* Submitボタン */}
              <Stack pt={2}>
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
                  登録
                </Button>
              </Stack>
            </form>

            {/* Google Sign inボタン */}
            <Stack>
              <Button
                loadingText='Submitting'
                size='md'
                bg={'pink.400'}
                color={'white'}
                _hover={{
                  bg: ' pink.500',
                }}
                onClick={handleGoogleSignIn}
              >
                Login with Google
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  )
}
