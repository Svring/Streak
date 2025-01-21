import { Text } from "@radix-ui/themes";
import {
  Modal as NextModal, ModalContent,
  ModalHeader, ModalBody, ModalFooter, Button, Input,
  Select, SelectItem
} from "@nextui-org/react";
import { DatePickerInput } from "@mantine/dates";
import type { Selection } from "@nextui-org/react";
import { useState } from "react";
import { useAppDispatch } from '../redux/hooks';
import { createScripInDb } from '../redux/features/scripSlice';
import { createScrip } from "../models/scrip";

interface CreateScripModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateScripModal({ isOpen, onOpenChange }: CreateScripModalProps) {
  const dispatch = useAppDispatch();
  const [newScripData, setNewScripData] = useState({
    name: "",
    description: ""
  });
  const [selectedType, setSelectedType] = useState<Selection>(new Set([]));
  const [timeSpan, setTimeSpan] = useState<[Date | null, Date | null]>([null, null]);

  const handleSubmit = async () => {
    if (!timeSpan[0] || !timeSpan[1]) return;
    
    const newScrip = createScrip(
      newScripData.name || "New Scrip",
      newScripData.description || "Description",
      [Array.from(selectedType)[0].toString()],
      timeSpan[0],
      timeSpan[1],
      new Date()
    );

    await dispatch(createScripInDb(newScrip));
    onOpenChange(false);
    
    setNewScripData({ name: "", description: "" });
    setSelectedType(new Set([]));
    setTimeSpan([null, null]);
  };

  return (
    <NextModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      backdrop="blur"
      placement="center"
      className="dark"
    >
      <ModalContent>
        <ModalHeader>
          <Text size="6" className="text-accentGold" weight="bold">New Scrip</Text>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2 dark">
            <Input
              label="Name"
              value={newScripData.name}
              variant="underlined"
              classNames={{
                input: "text-white",
                label: "text-accentGold",
                description: "text-accentGold"
              }}
              onChange={(e) => setNewScripData({ ...newScripData, name: e.target.value })}
            />

            <Input
              label="Description"
              value={newScripData.description}
              variant="underlined"
              classNames={{
                input: "text-white",
                label: "text-accentGold"
              }}
              onChange={(e) => setNewScripData({ ...newScripData, description: e.target.value })}
            />

            <Select
              label="Type"
              variant="underlined"
              classNames={{
                label: "text-accentGold",
                listboxWrapper: "text-accentDark"
              }}
              selectedKeys={selectedType}
              onSelectionChange={setSelectedType}
            >
              <SelectItem key="daily" value="daily">Daily</SelectItem>
              <SelectItem key="project" value="project">Project</SelectItem>
            </Select>

            <DatePickerInput
              type="range"
              label="Time Span"
              value={timeSpan}
              onChange={setTimeSpan}
              variant="unstyled"
              classNames={{
                label: "text-accentGold",
                wrapper: "ring-1 ring-inset ring-accentGold rounded-md"
              }}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button className="bg-accentGold text-accentDark" onPress={handleSubmit}>
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </NextModal>
  );
} 