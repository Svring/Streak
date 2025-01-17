import { motion } from "motion/react";
import ScripDetail from "./ScripDetail";
import { useFrame } from "../contexts/FrameContext";
import { Heading, Text } from "@radix-ui/themes";
import { Button } from "@nextui-org/react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { deleteScripInDb, selectScripById } from "../redux/features/scripSlice";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useLongPress } from 'use-long-press';

interface ScripProps {
  id: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function Scrip({ id, isSelected, onSelect }: ScripProps) {
  const { frameRef } = useFrame();
  const [isDragging, setIsDragging] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const scrip = useAppSelector(state => selectScripById(state, id));
  const dispatch = useAppDispatch();

  const bind = useLongPress(() => {
    if (!isDragging) {
      setIsLongPressing(true);
      console.log('Long pressed!');

    }
  }, {
    onFinish: () => {
      setTimeout(() => {
        setIsLongPressing(false);
      }, 100);
    },
    threshold: 2000,
    cancelOnMovement: true,
  });

  if (!scrip) return null;

  return (
    <>
      <motion.div
        {...bind()}
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
        className="relative w-52 h-40 bg-backdrop2 rounded-lg p-4 cursor-pointer"
        onDragStart={() => {
          setIsDragging(true);
          setIsLongPressing(false); // Cancel long press if drag starts
        }}
        onDragEnd={() => {
          setTimeout(() => setIsDragging(false), 0);
        }}
        onClick={() => {
          // Only trigger click if we're not dragging or long pressing
          if (!isDragging && !isLongPressing) {
            onSelect?.();
          }
        }}
      >
        <Heading size="4" className="text-accentWhite">{scrip.name}</Heading>
        <Text size="2" className="text-accentGray line-clamp-2">
          {scrip.description}
        </Text>
        <Button size="sm" radius="full" isIconOnly
          className="absolute top-2 right-2 bg-transparent"
          onPress={() => dispatch(deleteScripInDb(id))}
        >
          <Cross2Icon className="w-4 h-4 text-accentScarlet" />
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