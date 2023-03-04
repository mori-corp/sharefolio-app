import React, { useState, useEffect } from 'react'
import { db, storage } from '../../../firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from 'firebase/storage'
import type { NextPage } from 'next'
import Layout from '@/components/Layout'
import {
  Flex,
  Heading,
  Box,
  FormControl,
  Input,
  FormLabel,
  Button,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useUser } from '@/lib/auth'
import { validateImage } from 'image-validator'
import { useRouter } from 'next/router'

/**
    ユーザープロフィールページ
 */
const Mypage: NextPage = () => {
  /**
   * Recoilで状態管理された、ログインユーザーの情報
   */
  const user = useUser()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [userPhotoUrl, setUserPhotoUrl] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File>()
  const [isUploaded, setIsUploaded] = useState(true)

  const router = useRouter()

  // firebaseから、ユーザーのドキュメントをidで参照
  useEffect(() => {
    const readProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setUsername(docSnap.data().username)
          setEmail(docSnap.data().email)
          setUserPhotoUrl(docSnap.data().photoUrl)
        } else {
          // doc.data()がundefinedの場合
          console.log('ユーザーが存在しません。')
          alert('ユーザー情報が存在しません。')
        }
      } catch (error) {
        alert('ユーザー情報の読み込みに失敗しました。')
        console.log(error)
      }
    }
    readProfile()
  }, [])

  // アップロードされたファイルのバリデーション関数
  const validateFile = async (file: File) => {
    // 3GBを最大のファイルサイズに設定
    const limitFileSize = 5 * 1024 * 1024
    if (file.size > limitFileSize) {
      alert('ファイルサイズが大きすぎます。\n5メガバイト以下にしてください。')
      return false
    }
    const isValidImage = await validateImage(file)
    if (!isValidImage) {
      alert('画像ファイル以外はアップロードできません。')
      return false
    }
    return true
  }

  // 画像選択関数
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setIsUploaded(false)
    const reader = new FileReader()
    if (e.target.files !== null) {
      const file = e.target.files[0]
      if (!(await validateFile(file))) {
        return
      }
      reader.onloadend = async () => {
        setUploadedFile(file)
      }
      reader.readAsDataURL(file)
    }
    setIsUploaded(true)
  }

  // プロフィールの更新関数
  const handleUpdateButtonClick = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()
    // ユーザーアイコンの画像情報が存在する場合
    if (uploadedFile) {
      // アプリイメージ画像の参照とURL生成
      const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      const N = 16
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join('')

      // Cloud storageへアップロード
      const storageRef = ref(
        storage,
        `icons/${randomChar}_${uploadedFile.name}`
      )
      await uploadBytes(storageRef, uploadedFile)
        .then(() => {
          console.log('画像アップロードに成功しました')
        })
        .catch((error) => {
          console.log('画像アップロードに失敗しました。error: ', error)
        })

      // cloud storageのURLを取得
      await getDownloadURL(
        ref(storage, `icons/${randomChar}_${uploadedFile.name}`)
      ).then((url) => {
        // 追加する項目の定義
        const docRef = doc(db, 'users', user.uid)
        const payload = {
          username: username,
          photoUrl: url,
        }
        // firebase databaseの更新
        updateDoc(docRef, payload)
          .then(() => {
            alert('プロフィールを更新しました。')
            router.push('/')
          })
          .catch((error) => {
            console.log(error)
            alert('問題が発生しました。もう一度やり直してください。')
            router.reload()
          })

        // 既にicon画像がstorageにある場合は、ファイルを削除
        if (userPhotoUrl) {
          const imageRef = ref(storage, userPhotoUrl)
          deleteObject(imageRef)
            .then(() => {
              console.log('画像ファイルが、storageから削除されました。')
            })
            .catch((error) => {
              console.log('画像ファイルの削除に失敗しました。error: ', error)
            })
        }
      })
    } else {
      // ユーザーアイコンの画像情報が存在しない場合
      const docRef = doc(db, 'users', user.uid)
      const payload = {
        username: username,
      }
      // firebase databaseの更新
      updateDoc(docRef, payload)
        .then(() => {
          alert('プロフィールを更新しました。')
          router.push('/')
        })
        .catch((error) => {
          console.log(error)
          alert('問題が発生しました。もう一度やり直してください。')
          router.reload()
        })
    }
  }

  return (
    <Layout title={`マイページ｜${username}`}>
      <Flex
        flexDirection={'column'}
        align={'center'}
        w={'full'}
        p={{ base: 2, sm: 4, md: 8 }}
      >
        <Heading fontSize={'4xl'} mb={8}>
          マイページ
        </Heading>

        <Box
          rounded={'lg'}
          bg={'white'}
          boxShadow={'lg'}
          py={10}
          px={{ base: 4, sm: 4, md: 14 }}
          w={{ base: '100%', sm: '80%', md: '55%' }}
          maxW={'lg'}
        >
          {/* プロフィールアイコン */}
          <VStack mb={8}>
            <Image
              src={userPhotoUrl ? userPhotoUrl : '/no-image-icon.png'}
              alt={`profile icon of ${username}`}
              borderRadius={'100%'}
              maxW={40}
              maxH={40}
            />
            <Text fontSize={'sm'}>
              {!userPhotoUrl && 'プロフィールアイコンが設定されていません'}
            </Text>
          </VStack>
          <Box mb={8}>
            <Text fontWeight={'bold'} color={'blue.400'}>
              メールアドレス
            </Text>
            <Text mt={2}>{email}</Text>
          </Box>
          {/* プロフィール編集フォーム */}
          <form onSubmit={handleUpdateButtonClick}>
            {/* ユーザーネーム入力欄 */}
            <FormControl id='username' isRequired mb={8}>
              <FormLabel fontWeight={'bold'} color={'blue.400'}>
                ユーザーネーム
              </FormLabel>
              <Input
                id='username'
                type='username'
                placeholder='Usernameを入力'
                value={username ? username : ''}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete='off'
              />
            </FormControl>

            {/* アイコン設定 */}
            <FormControl mb={8}>
              <FormLabel fontWeight={'bold'} color={'blue.400'}>
                プロフィールアイコンを変更する
              </FormLabel>
              <input type='file' onChange={handleImageSelect} />
              <Text fontSize={'sm'} mt={2} color={'red.500'}>
                {!isUploaded && '画像をアップロードしています...'}
              </Text>
            </FormControl>

            {/* 更新ボタン */}
            <Button
              type='submit'
              loadingText='Submitting'
              bg={'blue.400'}
              color={'white'}
              _hover={{
                bg: 'blue.500',
              }}
              mr={4}
            >
              更新
            </Button>

            {/* 戻るボタン */}
            <NextLink href='/' passHref>
              <Button
                as='a'
                loadingText='Submitting'
                bg={'gray.400'}
                color={'white'}
                _hover={{
                  bg: 'gray.500',
                }}
              >
                TOPへ
              </Button>
            </NextLink>
          </form>
        </Box>
      </Flex>
    </Layout>
  )
}

export default Mypage
