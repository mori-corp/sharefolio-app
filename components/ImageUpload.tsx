import {
  AspectRatio,
  Box,
  Container,
  Heading,
  Input,
  Stack,
} from '@chakra-ui/react'
import { motion, useAnimation } from 'framer-motion'

export const ImageUpload: React.FC = () => {
  const controls = useAnimation()
  const startAnimation = () => controls.start('hover')
  const stopAnimation = () => controls.stop()
  return (
    <Container my='8' p={0}>
      <AspectRatio w={'60'} ratio={1}>
        <Box
          borderColor='gray.300'
          borderStyle='dashed'
          borderWidth='2px'
          rounded='md'
          shadow='sm'
          role='group'
          transition='all 150ms ease-in-out'
          _hover={{
            shadow: 'md',
          }}
          as={motion.div}
          initial='rest'
          animate='rest'
          whileHover='hover'
        >
          <Box position='relative' height='100%' width='100%'>
            <Box
              position='absolute'
              top='0'
              left='0'
              height='100%'
              width='100%'
              display='flex'
              flexDirection='column'
            >
              <Stack
                height='100%'
                width='100%'
                display='flex'
                alignItems='center'
                justify='center'
              >
                <Stack p='8' textAlign='center' spacing='1'>
                  <Heading fontSize='sm' color='gray.700' fontWeight='bold'>
                    画像をアップロード
                  </Heading>
                </Stack>
              </Stack>
            </Box>
            <Input
              type='file'
              height='100%'
              width='100%'
              position='absolute'
              top='0'
              left='0'
              opacity='0'
              aria-hidden='true'
              accept='image/*'
              onDragEnter={startAnimation}
              onDragLeave={stopAnimation}
            />
          </Box>
        </Box>
      </AspectRatio>
    </Container>
  )
}
