import Scrip from "./Scrip";
import { useState, useRef } from "react";
import { Button } from "@nextui-org/react";
import { FrameContext } from "../contexts/FrameContext";
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectAllScrips, setSelectedScrip } from '../redux/features/scripSlice';
import { PlusIcon, GearIcon } from "@radix-ui/react-icons";
import { CreateScripModal } from "./CreateScripModal";
import { SettingsModal } from "./SettingsModal";

export default function BulletinBoard() {
  const dispatch = useAppDispatch();
  const scrips = useAppSelector(selectAllScrips);
  const selectedScripId = useAppSelector(state => state.scrip.selectedScripId);
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  return (
    <div data-tauri-drag-region className="w-full h-full">
      <FrameContext.Provider value={{ frameRef }}>
        <div
          ref={frameRef}
          className="flex flex-wrap gap-4 w-full bg-backdrop1 rounded-lg p-2"
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
        </div>

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
        />

        <SettingsModal
          isOpen={settingsModalOpen}
          onOpenChange={setSettingsModalOpen}
        />

      </FrameContext.Provider>
    </div>
  );
}

