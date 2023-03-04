import { Box } from '@chakra-ui/layout'
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import React from 'react'

type Props = {
  onHandleDeleteButtonClick: () => void
  headerText: string
  bodyText: string
  buttonText: string
  isDanger?: boolean
  disabled: boolean
}

export const DeleteButton: React.FC<Props> = ({
  onHandleDeleteButtonClick,
  buttonText,
  headerText,
  bodyText,
  isDanger,
  disabled,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const onSubmit = () => {
    onHandleDeleteButtonClick()
    onClose()
  }

  return (
    <>
      <Button
        size={'lg'}
        onClick={onOpen}
        colorScheme={isDanger ? 'red' : ''}
        disabled={disabled}
      >
        {buttonText}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{headerText}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>{bodyText}</Box>
          </ModalBody>

          <ModalFooter>
            <Button variant='ghost' onClick={onClose} mr={3}>
              Close
            </Button>
            <Button colorScheme={isDanger ? 'red' : ''} onClick={onSubmit}>
              {buttonText}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
