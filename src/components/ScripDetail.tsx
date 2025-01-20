import { Modal, ModalContent, Button } from "@nextui-org/react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectScripById, updateScripInDb } from "../redux/features/scripSlice";
import { ScripDetailView } from "./ScripDetailView";
import { ScripDetailEdit } from "./ScripDetailEdit";

interface ScripDetailProps {
  id: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ScripDetail({ id, isOpen, onClose }: ScripDetailProps) {
  const dispatch = useAppDispatch();
  const scrip = useAppSelector(state => selectScripById(state, id));
  const [modifying, setModifying] = useState(false);

  if (!scrip) return null;

  const handleSave = async (updatedScrip: typeof scrip) => {
    await dispatch(updateScripInDb(updatedScrip));
    setModifying(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      backdrop="blur"
      placement="center"
      className="dark w-1/3 h-5/6 relative overflow-visible"
    >
      <ModalContent>
        {({
          true: <ScripDetailEdit scrip={scrip} onSave={handleSave} />,
          false: <ScripDetailView scrip={scrip} />
        }[modifying.toString()])}

        <Button
          isIconOnly radius="full" size="md"
          className="bottom-4 left-4 bg-accentGold text-accentDark shadow-lg"
          onPress={() => setModifying(!modifying)}
        >
          {modifying ? "✓" : "M"}
        </Button>
      </ModalContent>
    </Modal>
  );
}
