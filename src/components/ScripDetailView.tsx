import {
  ModalBody, Chip, Textarea
} from "@nextui-org/react";
import { DatePicker } from "@mantine/dates";
import { Indicator } from '@mantine/core';
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import type { Scrip, StreakEntry } from "../models/scrip";
import { useLongPress } from 'use-long-press';
import { useAppDispatch } from "../redux/hooks";
import { updateScripInDb } from "../redux/features/scripSlice";

interface ScripDetailViewProps {
  scrip: Scrip;
}

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

export function ScripDetailView({ scrip }: ScripDetailViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStreakEntry, setSelectedStreakEntry] = useState<StreakEntry | null>(null);
  const dispatch = useAppDispatch();
  const unsavedChangesRef = useRef<StreakEntry | null>(null);

  const handleDateSelect = (date: Date | null) => {
    if (!date) return;

    const existingEntry = scrip.streak.find(entry => isSameDay(entry.date, date));
    if (existingEntry) {
      setSelectedDate(date);
      setSelectedStreakEntry(existingEntry);
    } else {
      setSelectedDate(null);
      setSelectedStreakEntry(null);
    }
  };

  const handleLongPress = (date: Date) => {
    const existingEntryIndex = scrip.streak.findIndex(entry =>
      isSameDay(entry.date, date)
    );

    let updatedStreak = [...scrip.streak];

    if (existingEntryIndex === -1) {
      // Add new entry if doesn't exist
      updatedStreak.push({ date, note: '' });
    } else if (!scrip.streak[existingEntryIndex].note) {
      // Remove entry if it exists and has no note
      updatedStreak = updatedStreak.filter((_, index) => index !== existingEntryIndex);
    }

    dispatch(updateScripInDb({
      ...scrip,
      streak: updatedStreak
    }));
  };

  const bind = useLongPress((event) => {
    const findDateAttribute = (element: HTMLElement | null): string | null => {
      if (!element) return null;
      const dateAttr = element.getAttribute('data-date');
      if (dateAttr) return dateAttr;
      if (element.parentElement) {
        return findDateAttribute(element.parentElement);
      }
      return null;
    };

    const target = event.target as HTMLElement;
    const dateAttr = findDateAttribute(target);
    if (dateAttr) {
      handleLongPress(new Date(dateAttr));
    }
  }, {
    threshold: 1000,
    cancelOnMovement: true,
  });

  // Save function to reuse across effects
  const saveChanges = () => {
    if (!unsavedChangesRef.current) return;

    const updatedStreak = scrip.streak.map(entry =>
      isSameDay(entry.date, unsavedChangesRef.current!.date)
        ? unsavedChangesRef.current as StreakEntry // Ensure type safety
        : entry
    );

    dispatch(updateScripInDb({
      ...scrip,
      streak: updatedStreak
    }));
    unsavedChangesRef.current = null;
  };

  // Normal debounced save effect
  useEffect(() => {
    if (!selectedStreakEntry) return;
    unsavedChangesRef.current = selectedStreakEntry;

    const timer = setTimeout(() => {
      saveChanges();
    }, 10000); // Reduced from 100000 to more reasonable 500ms

    return () => clearTimeout(timer);
  }, [selectedStreakEntry, scrip]);

  // Save changes when streak entry panel visibility changes
  useEffect(() => {
    // If panel is being hidden (selectedStreakEntry becomes null)
    // and we have unsaved changes, save them
    if (!selectedStreakEntry && unsavedChangesRef.current) {
      saveChanges();
    }
  }, [selectedStreakEntry]);

  // Cleanup effect for component unmount and app closure
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (unsavedChangesRef.current) {
        saveChanges();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (unsavedChangesRef.current) {
        saveChanges();
      }
    };
  }, [scrip]);

  const handleNoteChange = (note: string) => {
    if (!selectedStreakEntry) return;
    setSelectedStreakEntry({ ...selectedStreakEntry, note });
  };

  return (
    <>
      <ModalBody className="w-full h-full py-10 justify-center z-50">
        <div className="flex flex-col items-center gap-4 h-full w-full">
          <div className="flex flex-col justify-center">
            <p className="text-fontColorWhite text-xl text-center">{scrip.name}</p>
            <p className="text-fontColorGray text-sm">
              {scrip.timeSpan[0]?.toLocaleDateString()} - {scrip.timeSpan[1]?.toLocaleDateString()}
            </p>
          </div>

          <p className="text-fontColorWhite text-center">
            {scrip.description}
          </p>

          <div className="flex flex-col justify-center">
            <p className="text-fontColorWhite text-center">
              Streak ({scrip.streak.length} days)
            </p>

            <DatePicker
              value={selectedDate}
              onChange={handleDateSelect}
              maxDate={new Date()}
              getDayProps={(date) => ({
                selected: selectedDate ? isSameDay(date, selectedDate) : false,
                ...bind(),
                'data-date': date.toISOString(),
              })}
              renderDay={(date) => {
                const hasStreak = scrip.streak.some(entry => isSameDay(entry.date, date));
                return (
                  <Indicator size={4} position="bottom-center"
                    color="green" offset={-2} disabled={!hasStreak}>
                    <div>{date.getDate()}</div>
                  </Indicator>
                );
              }}
            />
          </div>
        </div>

        <Chip
          key={scrip.type[0]}
          size="sm"
          variant="flat"
          className="absolute top-4 left-4 bg-accentDark text-accentGold ring-1 ring-accentGold">
          {scrip.type[0]}
        </Chip>

        <AnimatePresence>
          <motion.div
            key="streak-entry-panel"
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: selectedStreakEntry ? 10 : 0, opacity: selectedStreakEntry ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute start-full text-white z-0
            shadow-lg rounded-lg w-5/6 h-5/6 flex items-center bg-backdrop0"
          >
            {selectedStreakEntry && (
              <Textarea
                variant="bordered"
                className="text-stone-100 w-full h-full bg-backdrop0 "
                value={selectedStreakEntry.note}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder="Add a note for this day..."
                minRows={27}
                maxRows={27}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </ModalBody>
    </>
  );
} 