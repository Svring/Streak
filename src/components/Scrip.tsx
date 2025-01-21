import { motion } from "motion/react";
import ScripDetail from "./ScripDetail";
import { useFrame } from "../contexts/FrameContext";
import { Heading, Text } from "@radix-ui/themes";
import { Button, Chip } from "@nextui-org/react";
import { useState, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { deleteScripInDb, selectScripById, updateScripInDb } from "../redux/features/scripSlice";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useLongPress } from 'use-long-press';
import type { StreakEntry } from "../models/scrip";

interface ScripProps {
  id: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

export default function Scrip({ id, isSelected, onSelect }: ScripProps) {
  const { frameRef } = useFrame();
  const [isDragging, setIsDragging] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const dispatch = useAppDispatch();
  const scrip = useAppSelector(state => selectScripById(state, id));

  const hasEntryToday = useMemo(() => {
    if (!scrip?.streak) return false;
    const today = new Date();
    return scrip.streak.some(entry => isSameDay(new Date(entry.date), today));
  }, [scrip?.streak]);

  const handleDelete = useCallback(() => {
    dispatch(deleteScripInDb(id));
  }, [dispatch, id]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setIsLongPressing(false);
  }, []);

  const handleDragEnd = useCallback(() => {
    setTimeout(() => setIsDragging(false), 0);
  }, []);

  const handleClick = useCallback(() => {
    if (!isDragging && !isLongPressing) {
      onSelect?.();
    }
  }, [isDragging, isLongPressing, onSelect]);

  const handleLongPress = useCallback(() => {
    if (!isDragging && scrip) {
      setIsLongPressing(true);
      const today = new Date();

      const updatedStreak: StreakEntry[] = hasEntryToday
        ? scrip.streak.filter(entry => !isSameDay(new Date(entry.date), today))
        : [...scrip.streak, { date: today, note: '' }];

      dispatch(updateScripInDb({
        ...scrip,
        streak: updatedStreak
      }));
    }
  }, [isDragging, scrip, hasEntryToday, dispatch]);

  const bind = useLongPress(handleLongPress, {
    onFinish: () => {
      setTimeout(() => setIsLongPressing(false), 100);
    },
    threshold: 1000,
    cancelOnMovement: true,
  });

  if (!scrip) return null;

  return (
    <>
      <motion.div
        {...bind()}
        drag
        dragConstraints={frameRef ?? undefined}
        dragMomentum={false}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{
          scale: 1.05,
          transition: { duration: 0.2 },
          zIndex: 10,
        }}
        transition={{ duration: 0.2 }}
        className={`relative w-52 h-40 bg-backdrop2 rounded-lg p-4 cursor-pointer ${hasEntryToday ? 'ring-1 ring-accentGold' : ''
          }`}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
      >
        <Heading size="4" className="text-accentWhite">
          {scrip.name}
        </Heading>
        <Text size="2" className="text-accentGray line-clamp-2">
          {scrip.description}
        </Text>

        <Chip
          key={scrip.type[0]}
          size="sm"
          variant="flat"
          className={`absolute bottom-4 left-4 ${
            scrip.type[0] === 'daily' 
              ? 'bg-accentDark text-accentGreen ring-1 ring-accentGreen'
              : 'bg-accentDark text-accentBlue ring-1 ring-accentBlue'
          }`}>
          {scrip.type[0][0].toUpperCase()}
        </Chip>

        <Button
          size="sm"
          radius="full"
          isIconOnly
          className="absolute top-2 right-2 bg-transparent"
          onPress={handleDelete}
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