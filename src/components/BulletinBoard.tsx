import { Text } from "@radix-ui/themes";
import Scrip from "./Scrip";
import { useState, useRef } from "react";
import { createScrip } from "../models/scrip";
import {
  Modal as NextModal, ModalContent,
  ModalHeader, ModalBody, ModalFooter, Button, Input,
  Select, SelectItem
} from "@nextui-org/react";
import { DatePickerInput } from "@mantine/dates";
import type {Selection} from "@nextui-org/react";
import { FrameContext } from "../contexts/FrameContext";
import { motion } from "motion/react";
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  createScripInDb, exportDatabaseToFile, importDatabaseFromFile,
  selectAllScrips, setSelectedScrip
} from '../redux/features/scripSlice';
import { PlusIcon, GearIcon } from "@radix-ui/react-icons";

interface CreateScripModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description: string; type: string; timeSpan: { start: Date; end: Date; }, createdAt: Date }) => void;
}

function CreateScripModal({ isOpen, onOpenChange, onSubmit }: CreateScripModalProps) {
  const [newScripData, setNewScripData] = useState({
    name: "",
    description: ""
  });
  const [selectedType, setSelectedType] = useState<Selection>(new Set([]));
  const [timeSpan, setTimeSpan] = useState<[Date | null, Date | null]>([null, null]);

  const handleSubmit = () => {
    if (!timeSpan[0] || !timeSpan[1]) return;
    onSubmit({
      ...newScripData,
      type: Array.from(selectedType)[0].toString(),
      timeSpan: { start: timeSpan[0], end: timeSpan[1] },
      createdAt: new Date()
    });
    setNewScripData({ name: "", description: "" });
    setSelectedType(new Set([]));
    setTimeSpan([null, null]);
  };

  return (
    <NextModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
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
                label: "text-accentGold"
              }}
              selectedKeys={selectedType}
              onSelectionChange={setSelectedType}
            >
              <SelectItem key="hello" value="type1">Type 1</SelectItem>
              <SelectItem key="type2" value="type2">Type 2</SelectItem>
            </Select>

            <DatePickerInput
              type="range"
              label="Time Span"
              value={timeSpan}
              onChange={setTimeSpan}
              classNames={{
                label: "text-accentGold",
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

interface SettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function SettingsModal({ isOpen, onOpenChange }: SettingsModalProps) {
  const dispatch = useAppDispatch();

  return (
    <NextModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
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
        <ModalFooter>
          
        </ModalFooter>
      </ModalContent>
    </NextModal>
  );
}

export default function BulletinBoard() {
  const dispatch = useAppDispatch();
  const scrips = useAppSelector(selectAllScrips);
  const selectedScripId = useAppSelector(state => state.scrip.selectedScripId);
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const handleCreateScrip = async (data: { name: string; description: string; type: string; timeSpan: { start: Date; end: Date; } }) => {
    const newScrip = createScrip(
      data.name || "New Scrip",
      data.description || "Description",
      [data.type],
      data.timeSpan.start,
      data.timeSpan.end,
      new Date()
    );

    await dispatch(createScripInDb(newScrip));
    setModalOpen(false);
  };

  return (
    <div className="w-full h-full">
      <FrameContext.Provider value={{ frameRef }}>
        <motion.div
          ref={frameRef}
          className="flex flex-row gap-4 w-full h-full bg-backdrop1 rounded-lg p-2"
          data-tauri-drag-region
        >
          {scrips.map((scrip) => (
            <Scrip
              key={scrip.id}
              id={scrip.id!}
              isSelected={scrip.id === selectedScripId}
              onSelect={() => dispatch(setSelectedScrip(scrip.id ? (scrip.id === selectedScripId ? null : scrip.id) : null))}
            />
          ))}
        </motion.div>

        <Button
          isIconOnly
          radius="full"
          className="fixed bottom-4 right-4 bg-accentGold"
          size="md"
          onPress={() => setModalOpen(true)}
        >
          <PlusIcon className="w-4 h-4 text-accentDark" />
        </Button>

        <Button
          isIconOnly
          radius="full"
          className="fixed bottom-4 left-4 bg-accentGold"
          size="md"
          onPress={() => setSettingsModalOpen(true)}
        >
          <GearIcon className="w-4 h-4 text-accentDark" />
        </Button>

        <CreateScripModal
          isOpen={modalOpen}
          onOpenChange={setModalOpen}
          onSubmit={handleCreateScrip}
        />

        <SettingsModal
          isOpen={settingsModalOpen}
          onOpenChange={setSettingsModalOpen}
        />

      </FrameContext.Provider>
    </div>
  );
}

