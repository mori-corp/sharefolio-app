import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import {
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Button,
  Input,
  Flex,
  Heading,
  Box,
  Stack,
  Textarea,
  Select,
  Checkbox,
  CheckboxGroup,
  Text,
} from '@chakra-ui/react'
import { usePostValue } from '@/lib/atoms'
import { deleteDoc, doc, updateDoc } from 'firebase/firestore'
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from 'firebase/storage'
import { db, storage } from '../../../firebase'
import { validateImage } from 'image-validator'
import { DeleteButton } from '@/components/DeleteButton'
import { useForm, SubmitHandler } from 'react-hook-form'
import { PostType } from '@/types/post'

/**
    投稿の編集ページ
 */
const Edit: NextPage = () => {
  const {
    id,
    title,
    appName,
    description,
    image,
    appUrl,
    language,
    level,
    github,
  } = usePostValue()

  // 編集後のデータの格納
  const [editedLanguage, setEditedLanguage] = useState([''])
  const [editedFile, setEditedFile] = useState<File>()
  const router = useRouter()
  const { detail } = router.query
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostType>()

  useEffect(() => {
    setEditedLanguage(language)
  }, [])

  // チェックボックスの値の取得関数
  const handleCheckBoxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target
    if (checked) {
      // case1: 言語にチェックがされた時
      setEditedLanguage([...editedLanguage, value])
    } else {
      // case2: 言語からチェックがはずされた時
      setEditedLanguage(editedLanguage.filter((e) => e !== value))
    }
  }

  // アップロードされたファイルのバリデーション関数
  const validateFile = async (file: File) => {
    // 3GBを最大のファイルサイズに設定
    const limitFileSize = 3 * 1024 * 1024
    if (file.size > limitFileSize) {
      alert('ファイルサイズが大きすぎます。\n3メガバイト以下にしてください。')
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
    const reader = new FileReader()
    if (e.target.files !== null) {
      const file = e.target.files[0]
      if (!(await validateFile(file))) {
        return
      }
      reader.onloadend = async () => {
        setEditedFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  //投稿の編集
  const handleEditPost: SubmitHandler<PostType> = async (data) => {
    setIsSubmitting(true)
    // 新しく画像がアップされている場合の投稿動作
    if (editedFile) {
      // アプリイメージ画像の参照とURL生成
      const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      const N = 16
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join('')

      // Cloud storageへアップロード
      const storageRef = ref(storage, `images/${randomChar}_${editedFile.name}`)
      await uploadBytes(storageRef, editedFile)
        .then(() => {
          console.log('画像アップロードに成功しました')
        })
        .catch((error) => {
          console.log(error)
          alert(
            '画像のアップロードに失敗しました。もう一度やり直してください。'
          )
        })

      // cloud storageのURLを取得
      await getDownloadURL(
        ref(storage, `images/${randomChar}_${editedFile.name}`)
      ).then((url) => {
        const docRef = doc(db, 'posts', id)
        const payload = {
          appName: data.appName,
          title: data.title,
          description: data.description,
          image: url,
          level: data.level,
          language: editedLanguage,
          appUrl: data.appUrl,
          github: data.github,
        }

        // 新しい画像と共に、投稿を編集する
        updateDoc(docRef, payload)
          .then(() => {
            alert('投稿の編集が完了しました！')
            router.push('/')
          })
          .catch((error) => {
            console.log(error)
            alert('投稿の編集に失敗しました。もう一度やり直してください。')
          })

        // 既に画像がstorageに存在する場合は、元ファイルを削除
        if (image) {
          const imageRef = ref(storage, image)
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
      //画像情報が存在しない場合の投稿動作
      const docRef = doc(db, 'posts', id)
      const payload = {
        appName: data.appName,
        title: data.title,
        description: data.description,
        level: data.level,
        language: editedLanguage,
        appUrl: data.appUrl,
        github: data.github,
      }

      // 画像データは変更せず、投稿を編集
      updateDoc(docRef, payload)
        .then(() => {
          alert('投稿の編集が完了しました！')
          router.push('/')
        })
        .catch((error) => {
          console.log(error)
          alert('投稿の編集に失敗しました。もう一度やり直してください。')
        })
      setIsSubmitting(false)
    }
  }

  //投稿の削除
  const handleDeleteButtonClick = async (id: string) => {
    // firestoreのドキュメントを、Recoilでセットしている投稿idで参照
    const docRef = doc(db, 'posts', id) //第３引数は、document id

    try {
      await deleteDoc(docRef)
      // 画像ファイルを削除
      if (image) {
        const imageRef = ref(storage, image)
        deleteObject(imageRef)
          .then(() => {
            console.log('画像ファイルが、storageから削除されました。')
          })
          .catch((error) => {
            console.log('画像ファイルの削除に失敗しました。error: ', error)
          })
      }
      alert('投稿を削除しました。')
      router.push('/')
    } catch (error) {
      console.log(error)
      alert('問題が発生しました。もう一度やりなおしてください。')
    }
  }

  const displayedLanguages = [
    'HTML',
    'CSS',
    'Javascript',
    'Vue.js',
    'Nuxt.js',
    'React.js',
    'Next.js',
    'TypeScript',
    'Node.js',
    'Express.js',
    'Firebase',
    'Amplify',
    'SQL',
    'NoSQL',
    'GraphQL',
    'Java',
    'Ruby',
    'Go',
    'PHP',
    'C#',
    'Python',
  ]

  return (
    <Layout title={'投稿の編集｜ShareFolio'}>
      <Flex
        flexDirection={'column'}
        align={'center'}
        w={'full'}
        p={{ base: 2, sm: 4, md: 8 }}
      >
        {/* ヘディング部分 */}
        <Heading fontSize={'4xl'} mb={8}>
          投稿編集ページ
        </Heading>

        <Box
          rounded={'lg'}
          bg={'white'}
          boxShadow={'lg'}
          py={10}
          px={{ base: 4, md: 14 }}
          w={{ base: '100%', md: '80%' }}
        >
          {/* フォーム */}
          <form onSubmit={handleSubmit(handleEditPost)}>
            {/* アプリ名 */}
            <FormControl mb={4} isInvalid={errors.appName ? true : false}>
              <FormLabel
                htmlFor='appName'
                fontWeight={'bold'}
                color={'blue.500'}
              >
                アプリ / サイト名
              </FormLabel>
              <Input
                id='appName'
                type='text'
                {...register('appName', {
                  value: appName,
                  required: '入力が必須の項目です',
                  maxLength: {
                    value: 30,
                    message: '30文字以内で入力してください',
                  },
                })}
              />
              <FormErrorMessage>
                {errors.appName && errors.appName.message}
              </FormErrorMessage>
            </FormControl>

            {/* タイトル */}
            <FormControl mb={4} isInvalid={errors.title ? true : false}>
              <FormLabel htmlFor='title' fontWeight={'bold'} color={'blue.500'}>
                投稿タイトル（必須）
              </FormLabel>
              <Input
                id='title'
                type='text'
                {...register('title', {
                  value: title,
                  required: '入力が必須の項目です',
                  maxLength: {
                    value: 60,
                    message: '60文字以内で入力してください',
                  },
                })}
                autoComplete='off'
              />
              <FormErrorMessage>
                {errors.title && errors.title.message}
              </FormErrorMessage>
            </FormControl>

            {/* 説明 */}
            <FormControl mb={4} isInvalid={errors.description ? true : false}>
              <FormLabel
                htmlFor='description'
                fontWeight={'bold'}
                color={'blue.500'}
              >
                説明
              </FormLabel>
              <Textarea
                id='description'
                placeholder='アプリやサイトの簡単な説明を記載してください。'
                {...register('description', {
                  value: description,
                  required: '入力が必須の項目です',
                  maxLength: {
                    value: 1000,
                    message: '文字数をオーバーしています（1000文字まで）',
                  },
                })}
                rows={10}
                autoComplete='off'
              />
              <FormErrorMessage>
                {errors.description && errors.description.message}
              </FormErrorMessage>
            </FormControl>

            {/* スクショ画像アップロード */}
            <FormControl mb={4}>
              <FormLabel htmlFor='image' fontWeight={'bold'} color={'blue.500'}>
                アプリ / サイトの画像
              </FormLabel>
              <input id='image' type='file' onChange={handleImageSelect} />
              <FormHelperText fontSize={'xs'}>
                例：トップページのスクリーンショット等
              </FormHelperText>
            </FormControl>

            {/* レベル */}
            <FormControl mb={4}>
              <FormLabel htmlFor='level' fontWeight={'bold'} color={'blue.500'}>
                レベル
              </FormLabel>
              <Select
                w={40}
                id='level'
                {...register('level', { value: level })}
              >
                <option value='beginner'>初心者</option>
                <option value='intermediate'>中級者</option>
                <option value='advanced'>上級者</option>
              </Select>
            </FormControl>

            {/* 言語設定 */}
            <FormControl mb={4}>
              <FormLabel
                htmlFor='language'
                fontWeight={'bold'}
                color={'blue.500'}
              >
                使用技術
              </FormLabel>
              <CheckboxGroup defaultValue={language}>
                {displayedLanguages.map((displayedLanguage) => (
                  <Checkbox
                    id='language'
                    m={2}
                    key={displayedLanguage}
                    onChange={handleCheckBoxChange}
                    value={displayedLanguage}
                  >
                    {displayedLanguage}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </FormControl>

            {/* アプリURL */}
            <FormControl mb={4} isInvalid={errors.appUrl ? true : false}>
              <FormLabel
                htmlFor='appUrl'
                fontWeight={'bold'}
                color={'blue.500'}
              >
                アプリ / サイトURL（必須）
              </FormLabel>
              <Input
                id='appUrl'
                type='text'
                placeholder='URL: '
                {...register('appUrl', {
                  value: appUrl,
                  required: '入力が必須の項目です',
                  pattern: {
                    value:
                      /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/,
                    message: 'アドレスの形式が正しくありません',
                  },
                })}
                autoComplete='off'
              />
              <FormErrorMessage>
                {errors.appUrl && errors.appUrl.message}
              </FormErrorMessage>
            </FormControl>

            {/* Github */}
            <FormControl mb={4} isInvalid={errors.github ? true : false}>
              <FormLabel
                htmlFor='github'
                fontWeight={'bold'}
                color={'blue.500'}
              >
                GitHub
              </FormLabel>
              <Input
                id='github'
                type='text'
                placeholder='GitHub: '
                {...register('github', {
                  value: github,
                  pattern: {
                    value:
                      /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/,
                    message: 'アドレスの形式が正しくありません',
                  },
                })}
                autoComplete='off'
              />
              <FormErrorMessage>
                {errors.github && errors.github.message}
              </FormErrorMessage>
            </FormControl>
            {isSubmitting && (
              <Text color={'red.500'} fontWeight={'bold'} my={2}>
                投稿を編集しています...
              </Text>
            )}
            <Stack>
              {/* 更新ボタン */}
              <Button
                type='submit'
                size='lg'
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}
                isLoading={isSubmitting ? true : false}
              >
                編集する
              </Button>

              {/* 削除ボタン */}
              <DeleteButton
                headerText='投稿の削除'
                bodyText='投稿を削除します。この操作は取り消すことができませんが、よろしいですか？'
                onHandleDeleteButtonClick={() => handleDeleteButtonClick(id)}
                buttonText='削除'
                isDanger={true}
                disabled={isSubmitting ? true : false}
              />

              {/* 戻るボタン */}
              <NextLink href={`/posts/${detail}`} passHref>
                <Button
                  as='a'
                  size='lg'
                  bg={'gray.400'}
                  color={'white'}
                  _hover={{
                    bg: 'gray.500',
                  }}
                  disabled={isSubmitting ? true : false}
                >
                  戻る
                </Button>
              </NextLink>
            </Stack>
          </form>
        </Box>
      </Flex>
    </Layout>
  )
}

export default Edit
