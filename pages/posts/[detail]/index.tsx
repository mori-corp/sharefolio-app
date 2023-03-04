import { useState, useEffect } from 'react'
import { db } from '../../../firebase'
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import type { NextPage } from 'next'
import Layout from '@/components/Layout'
import {
  Divider,
  Input,
  Flex,
  Box,
  Text,
  Heading,
  Button,
  List,
  Link,
  Stack,
  Image,
  UnorderedList,
  ListItem,
  ListIcon,
  VStack,
} from '@chakra-ui/react'
import { LanguageTags } from '@/components/LanguageTags'
import { PostType } from '@/types/post'
import { useSetRecoilState } from 'recoil'
import { postState, usePostIdValue, useAuhotrIdValue } from '@/lib/atoms'
import { useUser } from '@/lib/auth'
import { AuthorType } from '@/types/author'

type CommentType = {
  uid: string
  username: string
  avator: string
  text: string
  timestamp: number
}
/**
    各投稿の詳細ページ
 */
const Detail: NextPage = () => {
  const [post, setPost] = useState<PostType>({
    id: '',
    appName: '',
    title: '',
    description: '',
    image: '',
    level: '',
    language: [''],
    appUrl: '',
    github: '',
    postedDate: null,

    authorId: '',
  })
  const [author, setAuthor] = useState<AuthorType>({
    uid: '',
    username: '',
    photoUrl: '',
  })

  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<CommentType[]>([])
  const router = useRouter()
  const { detail } = router.query
  const postIdValue = usePostIdValue()
  const authorIdValue = useAuhotrIdValue()
  const setPostDetail = useSetRecoilState<PostType>(postState)
  /**
   * Recoilで状態管理された、ログインユーザーの情報
   */
  const user = useUser()

  // postsコレクションから、投稿データを参照
  useEffect(() => {
    const docRef = doc(db, 'posts', postIdValue)
    const readPost = async () => {
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setPost({
          ...docSnap.data(),
          id: postIdValue,
          title: docSnap.data().title,
          appName: docSnap.data().appName,
          description: docSnap.data().description,
          image: docSnap.data().image,
          appUrl: docSnap.data().appUrl,
          language: docSnap.data().language,
          level: docSnap.data().level,
          github: docSnap.data().github,
          postedDate: docSnap.data().postedDate,
          authorId: docSnap.data().authorId,
        })
      } else {
        // doc.data() が undefined のケース
        console.log('No such document!')
        alert('投稿情報の読み込みに失敗しました。')
      }
    }
    // usersコレクションから、投稿者情報を参照
    const readAuthor = async () => {
      const userRef = doc(db, 'users', authorIdValue)
      const userDocSnap = await getDoc(userRef)

      if (userDocSnap.exists()) {
        setAuthor({
          ...userDocSnap.data(),
          uid: userDocSnap.data().uid,
          username: userDocSnap.data().username,
          photoUrl: userDocSnap.data().photoUrl,
        })
      } else {
        // doc.data() will be undefined in this case
        console.log('No such user!')
      }
    }

    // コメントを参照
    const readComments = () => {
      const collectionRef = collection(docRef, 'comments')
      const q = query(collectionRef, orderBy('timestamp', 'desc'))

      onSnapshot(q, (snapshot) => {
        setComments(
          snapshot.docs.map((doc) => ({
            ...doc.data(),
            uid: doc.id,
            username: doc.data().username,
            avator: doc.data().photoUrl,
            text: doc.data().text,
            timestamp: doc.data().timestamp,
          }))
        )
      })
    }

    readPost()
    readAuthor()
    readComments()
  }, [])

  // コメントの追加機能
  const addComment = async () => {
    try {
      // ログインユーザー情報を取得
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const username = docSnap.data().username
        const userPhoto = docSnap.data().photoUrl

        // コメントの追加
        const postRef = doc(db, 'posts', postIdValue)
        const collectionRef = collection(postRef, 'comments')
        await addDoc(collectionRef, {
          username: username,
          photoUrl: userPhoto,
          text: comment,
          timestamp: serverTimestamp(),
        })
      }
    } catch (error) {
      console.log(error)
      alert('投稿に失敗しました。もう一度、やり直してください。')
    } finally {
      setComment('')
    }
  }

  //編集画面遷移時に、Recoilへ状態保持
  const handleEditButtonClick = (postId: string) => {
    setPostDetail({
      id: postId,
      title: post.title,
      appName: post.appName,
      description: post.description,
      image: post.image,
      appUrl: post.appUrl,
      language: post.language,
      level: post.level,
      github: post.github,
      postedDate: post.postedDate,
      authorId: post.authorId,
    })
  }

  // timestampを、yy/mm/dd/hh/mm形式へ変換
  const getDisplayTime = (e: any) => {
    if (e === null) return
    const year = e.toDate().getFullYear()
    const month = ('0' + (e.toDate().getMonth() + 1)).slice(-2)
    const date = ('0' + e.toDate().getDate()).slice(-2)
    const hour = ('0' + e.toDate().getHours()).slice(-2)
    const min = ('0' + e.toDate().getMinutes()).slice(-2)

    return `${year}年${month}月${date}日 ${hour}:${min}`
  }

  const levels = (level: string) => {
    switch (level) {
      case 'beginner':
        return '初級'
      case 'intermediate':
        return '中級'
      case 'advanced':
        return '上級'
    }
  }

  return (
    <Layout title={post.title}>
      <Flex flexDirection={'column'} align={'center'} w={'full'}>
        {/* 投稿タイトル */}
        <Heading
          maxW={'2xl'}
          textAlign={'center'}
          fontSize={{ base: 'lg', sm: '2xl' }}
          px={{ base: 4, sm: 8 }}
          mt={20}
        >
          {post.title}
        </Heading>
        <Stack
          textAlign={'center'}
          w={{ base: '100%', md: '80%' }}
          p={4}
          spacing='4'
        >
          {/* アプリ名 */}
          <Text
            my={4}
            fontSize={{ base: '2xl', sm: '4xl' }}
            fontWeight={'bold'}
            color={'blue.400'}
          >
            {post.appName}
          </Text>

          {/* アプリの説明欄 */}
          <Box
            rounded={'lg'}
            bg={'white'}
            boxShadow={'lg'}
            py={10}
            px={{ base: 4, md: 10 }}
          >
            <Text fontSize={{ base: 'sm', sm: 'md' }} align={'left'}>
              {post.description}
            </Text>
          </Box>

          {/* アプリ画像 */}
          {post.image && (
            <Image
              borderRadius='lg'
              src={post.image}
              alt={`image of ${post.appName}`}
              objectFit='contain'
              maxH={'lg'}
            />
          )}

          {/* アプリの詳細情報 */}
          <Box
            rounded={'lg'}
            bg={'white'}
            boxShadow={'lg'}
            py={10}
            px={{ base: 4, md: 10 }}
            textAlign={'left'}
          >
            <List spacing={4} fontSize={{ base: 'sm', sm: 'md' }}>
              {/* アプリURL */}
              <ListItem>
                <ListIcon color='green.500' />
                アプリURL：
                <Link href={post.appUrl} color={'blue.400'} isExternal>
                  {post.appUrl}
                </Link>
              </ListItem>

              {/* GitHub */}
              <ListItem>
                <ListIcon color='green.500' />
                GitHub：
                <Link href={post.github} color={'blue.400'} isExternal>
                  {post.github}
                </Link>
              </ListItem>

              {/* 使用言語 */}
              <ListItem>
                <ListIcon color='green.500' />
                使用言語：
                <LanguageTags tags={post.language} />
              </ListItem>

              {/* レベル */}
              <ListItem>
                <ListIcon color='green.500' />
                レベル：{levels(post.level)}
              </ListItem>
            </List>
          </Box>

          {/* 投稿者情報 */}
          <Flex alignItems={'center'}>
            <Text>投稿者：</Text>
            <Image
              src={author.photoUrl ? author.photoUrl : '/user.png'}
              boxSize={'40px'}
              borderRadius={'full'}
              alt={`icon of ${author.username}`}
              mr={2}
            />
            <Text fontWeight={'bold'}>{author.username}</Text>
          </Flex>
          <Divider h={4} />

          {/* ハートアイコン */}
          {/* <Flex align={"center"} justify={"space-between"}>
            <HStack>
              <Icon as={AiOutlineHeart} w={6} h={6} />
              <Text fontSize={"sm"}>100 Likes</Text>
            </HStack> */}

          {/* コメント欄 */}
          <Text fontWeight={'bold'} fontSize={'2xl'} py={4} color={'gray.600'}>
            コメント一覧
          </Text>
          {user.uid ? (
            <form>
              <Flex alignItems={'center'}>
                {/* 入力欄フォーム */}
                <Input
                  id='comment'
                  type='text'
                  placeholder='コメントを入力'
                  autoComplete='off'
                  bg={'white'}
                  my={4}
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value)
                  }}
                />

                {/* コメント送信ボタン */}
                <Button
                  isDisabled={!comment}
                  bg={'blue.400'}
                  color={'white'}
                  _hover={{
                    bg: 'blue.500',
                  }}
                  ml={2}
                  onClick={addComment}
                >
                  送信
                </Button>
              </Flex>
            </form>
          ) : (
            <VStack py={4}>
              <Text fontWeight={'bold'} color={'gray.400'}>
                ログインするとコメントできます
              </Text>
              <NextLink href='/login' passHref>
                <Button
                  px={10}
                  as='a'
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
            </VStack>
          )}

          {/* 各コメント */}
          <UnorderedList styleType='none' m={0}>
            {comments.map((comment) => (
              <ListItem key={comment.uid}>
                <Stack
                  rounded={'lg'}
                  bg={'white'}
                  boxShadow={'lg'}
                  py={4}
                  px={{ base: 4, sm: 8 }}
                  textAlign={'left'}
                  mb={4}
                >
                  <Flex alignItems={'center'} justifyContent={'start'}>
                    {/* アイコン */}
                    <Image
                      src={comment.avator ? comment.avator : '/user.png'}
                      boxSize={'28px'}
                      borderRadius={'full'}
                      alt={`icon of ${comment.username}`}
                      mr={2}
                    />
                    {/* ユーザー名 */}
                    <Text fontSize={'sm'}>{comment.username}さん</Text>
                    <Text ml={2} fontSize={'sm'} color={'gray.500'}>
                      {getDisplayTime(comment.timestamp)}
                    </Text>
                  </Flex>
                  {/* コメント内容 */}
                  <Text fontSize={'sm'} py={4}>
                    {comment.text}
                  </Text>
                </Stack>
              </ListItem>
            ))}
          </UnorderedList>

          {/* 戻る/編集ボタン部分 */}
          <Stack>
            {/* 編集ボタン：ログインしているユーザーと、投稿者idが一致した場合のみ表示*/}
            {user.uid === post.authorId && (
              <NextLink href={`/posts/${detail}/edit`} passHref>
                <Button
                  as='a'
                  loadingText='Submitting'
                  size='lg'
                  bg={'pink.400'}
                  color={'white'}
                  _hover={{
                    bg: 'pink.500',
                  }}
                  onClick={() => handleEditButtonClick(post.id)}
                >
                  編集
                </Button>
              </NextLink>
            )}

            {/* 戻るボタン */}
            <NextLink href='/' passHref>
              <Button
                as='a'
                loadingText='Submitting'
                size='lg'
                bg={'gray.400'}
                color={'white'}
                _hover={{
                  bg: 'gray.500',
                }}
              >
                戻る
              </Button>
            </NextLink>
          </Stack>
        </Stack>
      </Flex>
    </Layout>
  )
}

export default Detail
