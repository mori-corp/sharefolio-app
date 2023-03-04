import React from 'react'
import { Image, Text, HStack } from '@chakra-ui/react'

// 投稿者のデータ型定義
type AuthorProps = {
  name: string
}

export const Author: React.FC<AuthorProps> = (props) => {
  return (
    <HStack spacing='2' display='flex' alignItems='center'>
      {/* プロフィール画像 */}
      <Image
        borderRadius='full'
        boxSize='20px'
        src='/user.png'
        alt={`Avatar of ${props.name}`}
        border='1px'
        borderColor='gray.200'
      />

      {/* ユーザーネーム */}
      <Text fontWeight='medium' fontSize={'sm'}>
        {props.name}
      </Text>
      <Text>—</Text>
    </HStack>
  )
}
