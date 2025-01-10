import { Text } from "@radix-ui/themes";
import Scrip from "./Scrip";
import { useState, useRef } from "react";
import { createScrip } from "../models/scrip";
import {
  DateRangePicker, Modal as NextModal, ModalContent,
  ModalHeader, ModalBody, ModalFooter, Button, Input,
} from "@nextui-org/react";
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";
import { FrameContext } from "../contexts/FrameContext";
import { motion } from "motion/react";
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { createScripInDb, selectAllScrips, setSelectedScrip } from '../redux/features/scripSlice';

interface CreateScripModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description: string; type: string; timeSpan: { start: CalendarDate; end: CalendarDate; }, createdAt: CalendarDate }) => void;
}

function CreateScripModal({ isOpen, onOpenChange, onSubmit }: CreateScripModalProps) {
  const [newScripData, setNewScripData] = useState({
    name: "",
    description: "",
    type: "",
  });
  const [timeSpan, setTimeSpan] = useState<{ start: CalendarDate; end: CalendarDate } | null>(null);

  const handleSubmit = () => {
    if (!timeSpan) return;
    onSubmit({ ...newScripData, timeSpan, createdAt: today(getLocalTimeZone()) });
    setNewScripData({ name: "", description: "", type: "" });
    setTimeSpan(null);
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
          <Text size="6" color="iris" weight="bold">New Scrip</Text>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-3 dark">
            <Input
              label="Name"
              value={newScripData.name}
              variant="bordered"
              classNames={{
                input: "text-white",
                label: "text-white"
              }}
              onChange={(e) => setNewScripData({ ...newScripData, name: e.target.value })}
            />
            <Input
              label="Description"
              value={newScripData.description}
              variant="bordered"
              classNames={{
                input: "text-white",
                label: "text-white"
              }}
              onChange={(e) => setNewScripData({ ...newScripData, description: e.target.value })}
            />
            <Input
              label="Type"
              value={newScripData.type}
              variant="bordered"
              classNames={{
                input: "text-white",
                label: "text-white"
              }}
              onChange={(e) => setNewScripData({ ...newScripData, type: e.target.value })}
            />
            <DateRangePicker
              label="Time Span"
              value={timeSpan}
              onChange={(value) => value && setTimeSpan(value)}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            Create Scrip
          </Button>
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
  const frameRef = useRef<HTMLDivElement>(null);

  const handleCreateScrip = async (data: { name: string; description: string; type: string; timeSpan: { start: CalendarDate; end: CalendarDate; } }) => {
    const newScrip = createScrip(
      data.name || "New Scrip",
      data.description || "Description",
      [data.type],
      data.timeSpan.start,
      data.timeSpan.end,
      today(getLocalTimeZone())
    );

    await dispatch(createScripInDb(newScrip));
    setModalOpen(false);
  };

  return (
    <div className="w-full h-full">
      <FrameContext.Provider value={{ frameRef }}>
        <motion.div
          ref={frameRef}
          className="flex flex-row gap-4 w-full h-full bg-stone-900 rounded-lg p-2"
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
          className="fixed bottom-4 right-4 bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
          onPress={() => setModalOpen(true)}
        >
          +
        </Button>

        <CreateScripModal
          isOpen={modalOpen}
          onOpenChange={setModalOpen}
          onSubmit={handleCreateScrip}
        />

      </FrameContext.Provider>
    </div>
  );
}

