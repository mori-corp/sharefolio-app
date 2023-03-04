import React from 'react'
import { Tag, SpaceProps, Wrap } from '@chakra-ui/react'

type ILanguageTags = {
  tags: Array<string> | undefined
  marginTop?: SpaceProps['marginTop']
}

export const LanguageTags: React.FC<ILanguageTags> = (props) => {
  return (
    <Wrap spacing={1} marginTop={2}>
      {props.tags?.map((tag) => {
        return (
          <Tag size={'sm'} variant='solid' colorScheme='pink' key={tag}>
            {tag}
          </Tag>
        )
      })}
    </Wrap>
  )
}
