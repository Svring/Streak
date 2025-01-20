import { Text } from "@radix-ui/themes";
import {
  Modal as NextModal, ModalContent,
  ModalHeader, ModalBody, ModalFooter, Button
} from "@nextui-org/react";
import { useAppDispatch } from '../redux/hooks';
import { exportDatabaseToFile, importDatabaseFromFile } from '../redux/features/scripSlice';

interface SettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ isOpen, onOpenChange }: SettingsModalProps) {
  const dispatch = useAppDispatch();

  return (
    <NextModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur"
      placement="center"
      className="dark"
    >
      <ModalContent>
        <ModalHeader>
          <Text size="6" className="text-accentGold" weight="bold">Settings</Text>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <Button
              color="primary"
              className="w-full bg-accentGold text-accentDark"
              onPress={() => dispatch(exportDatabaseToFile())}
            >
              Export Database
            </Button>
            <Button
              color="primary"
              className="w-full bg-accentGold text-accentDark"
              onPress={() => dispatch(importDatabaseFromFile())}
            >
              Import Database
            </Button>
          </div>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </NextModal>
  );
} 