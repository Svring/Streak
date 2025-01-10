import { motion } from "motion/react";
import ScripDetail from "./ScripDetail";
import { useFrame } from "../contexts/FrameContext";
import { Heading, Text } from "@radix-ui/themes";
import { Button } from "@nextui-org/react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { deleteScripInDb, selectScripById } from "../redux/features/scripSlice";

interface ScripProps {
  id: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function Scrip({ id, isSelected, onSelect }: ScripProps) {
  const { frameRef } = useFrame();
  const [isDragging, setIsDragging] = useState(false);
  const scrip = useAppSelector(state => selectScripById(state, id));
  const dispatch = useAppDispatch();

  if (!scrip) return null;

  return (
    <>
      <motion.div
        drag
        dragConstraints={frameRef ? frameRef : undefined}
        dragMomentum={false}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{
          scale: 1.05,
          border: "1px solid white",
          transition: { duration: 0.2 },
          zIndex: 10,
        }}
        transition={{ duration: 0.2 }}
        className="relative w-52 h-40 bg-stone-800 rounded-lg p-4 cursor-pointer"
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 0)}
        onClick={() => !isDragging && onSelect?.()}
      >
        <Heading size="4" className="text-stone-100">{scrip.name}</Heading>
        <Text size="2" className="text-stone-400 line-clamp-2">
          {scrip.description}
        </Text>
        <Button size="sm" radius="full"
          isIconOnly aria-label="Discard" color="danger"
          className="absolute top-2 right-2"
          onPress={() => dispatch(deleteScripInDb(id))}
        >
          X
        </Button>
      </motion.div>

      <ScripDetail
        id={id}
        isOpen={isSelected}
        onClose={onSelect}
      />
    </>
  );
}