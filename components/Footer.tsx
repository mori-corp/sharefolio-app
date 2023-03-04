import {
  ButtonGroup,
  Container,
  IconButton,
  Stack,
  Text,
  Image,
  Link,
} from '@chakra-ui/react'
import * as React from 'react'
import { FaGithub } from 'react-icons/fa'
import NextLink from 'next/link'

export const Footer: React.FC = () => (
  <Container
    as='footer'
    role='contentinfo'
    py={8}
    m={0}
    minW={'100%'}
    borderTop={1}
    borderStyle={'solid'}
    borderColor={'gray.200'}
  >
    <Stack spacing={{ base: '4', md: '5' }}>
      <Stack justify='start' direction='row' align='center'>
        <NextLink href='/'>
          <Image
            src='/logo.png'
            alt='logo'
            w={'80px'}
            _hover={{
              cursor: 'pointer',
            }}
          />
        </NextLink>
        <ButtonGroup variant='ghost'>
          <Link href='https://github.com/mori-corp/sharefolio' isExternal>
            <IconButton
              aria-label='GitHub'
              icon={<FaGithub fontSize='1.25rem' />}
            />
          </Link>
          {/* <IconButton
            as="a"
            aria-label="Twitter"
            icon={<FaTwitter fontSize="1.25rem" />}
          /> */}
        </ButtonGroup>
        <Text fontSize={'12px'} color='gray.400' fontWeight={'bold'}>
          エンジニアのための、オリジナルアプリ
          <br />
          ポートフォリオの共有コミュニティ
        </Text>
      </Stack>
      <Text fontSize='12px' color='subtle'>
        &copy; {new Date().getFullYear()} ShareFolio All rights reserved.
      </Text>
    </Stack>
  </Container>
)
