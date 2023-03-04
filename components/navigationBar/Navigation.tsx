import {
  Box,
  Flex,
  Image,
  IconButton,
  Collapse,
  useDisclosure,
  HStack,
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import NextLink from 'next/link'
import { DesktopNav } from './DesktopNav'
import { MobileNav } from './MobileNav'

export const Navigation: React.FC = () => {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Box>
      <Flex
        bg={'white'}
        minH={'60px'}
        px={8}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={'gray.200'}
        align={'center'}
      >
        {/* ハンバーガーボタン */}
        <Flex ml={{ base: -2 }} display={{ base: 'flex', md: 'none' }}>
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>

        {/* ナビゲーション部分 */}
        <Flex
          flex={1}
          justify={{ base: 'center', md: 'start' }}
          alignItems={'center'}
          w={'full'}
          h={'60px'}
        >
          {/* *** ロゴ  *** */}
          <NextLink href='/' passHref>
            <HStack h={'60px'} display='flex' alignItems={'center'}>
              <Image
                src='/logo.png'
                alt='logo'
                w={'100px'}
                _hover={{
                  cursor: 'pointer',
                }}
              />
            </HStack>
          </NextLink>

          {/* デスクトップ用ナビゲーション */}
          <Flex display={{ base: 'none', md: 'flex' }} w={'full'}>
            <DesktopNav />
          </Flex>
        </Flex>
      </Flex>

      {/* モバイル用ナビゲーション */}
      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  )
}
