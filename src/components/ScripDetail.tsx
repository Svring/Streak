import { Heading, Text } from "@radix-ui/themes";
import {
  Modal, ModalContent, ModalHeader, ModalBody, Chip, Button,
  Textarea
} from "@nextui-org/react";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectScripById, updateScripInDb } from "../redux/features/scripSlice";
import { DatePicker, DatePickerInput } from "@mantine/dates";
import { TextInput, Indicator } from '@mantine/core';
import { dateToCalendarDate, calendarDateToDate } from "../utility/dateFormatter";
import { motion, AnimatePresence } from "motion/react";

interface ScripDetailProps {
  id: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ScripDetail({ id, isOpen, onClose }: ScripDetailProps) {
  const dispatch = useAppDispatch();
  const scrip = useAppSelector(state => selectScripById(state, id));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStreakEntry, setSelectedStreakEntry] = useState<{ date: string, note: string } | null>(null);

  if (!scrip) return null;

  const [name, setName] = useState(scrip.name);
  const [description, setDescription] = useState(scrip.description);
  const [type, setType] = useState(scrip.type);
  const [timeSpan, setTimeSpan] = useState<[Date | null, Date | null]>([
    scrip.timeSpan[0] ? calendarDateToDate(scrip.timeSpan[0]) : null,
    scrip.timeSpan[1] ? calendarDateToDate(scrip.timeSpan[1]) : null
  ]);
  const [streak, setStreak] = useState(scrip.streak);
  const [modifying, setModifying] = useState(false);

  useEffect(() => {
    if (selectedStreakEntry) {
      const currentEntry = streak.find(entry => entry.date.toString() === selectedStreakEntry.date);
      setSelectedStreakEntry(currentEntry ? { date: currentEntry.date.toString(), note: currentEntry.note || '' } : null);
    }
  }, [streak]);

  useEffect(() => {
    if (selectedDate) {
      const selectedCalendarDate = dateToCalendarDate(selectedDate);
      const existingEntry = streak.find(entry => entry.date.toString() === selectedCalendarDate.toString());

      if (existingEntry) {
        if (selectedStreakEntry?.date === selectedCalendarDate.toString()) {
          setStreak(streak.filter(entry => entry.date.toString() !== selectedCalendarDate.toString()));
          setSelectedStreakEntry(null);
        } else {
          setSelectedStreakEntry({ date: selectedCalendarDate.toString(), note: existingEntry.note || '' });
        }
      } else {
        const newEntry = { date: selectedCalendarDate, completed: true, note: '' };
        setStreak([...streak, newEntry]);
        setSelectedStreakEntry({ date: selectedCalendarDate.toString(), note: '' });
      }
      setSelectedDate(null);
    }
  }, [selectedDate]);

  const handleNoteChange = (note: string) => {
    if (!selectedStreakEntry) return;

    const updatedStreak = streak.map(entry =>
      entry.date.toString() === selectedStreakEntry.date
        ? { ...entry, note }
        : entry
    );
    setStreak(updatedStreak);
    setSelectedStreakEntry({ ...selectedStreakEntry, note });
  };

  const handleModalClick = () => {
    if (selectedStreakEntry) {
      setSelectedStreakEntry(null);
    }
  };

  const handleNoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSave = async () => {
    if (!scrip || !scrip.id) return;
    
    const updatedScrip = {
      ...scrip,
      name,
      description,
      type,
      timeSpan: [
        dateToCalendarDate(timeSpan[0]!),
        dateToCalendarDate(timeSpan[1]!)
      ],
      streak
    };
    
    await dispatch(updateScripInDb(updatedScrip));
    setModifying(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        placement="center"
        className="dark w-1/3 h-5/6 relative overflow-visible"
      >
        <ModalContent onClick={handleModalClick}>
          <ModalHeader>
            {modifying ? (
              <TextInput variant="unstyled" className="text-stone-100" size="lg"
                value={name} onChange={e => setName(e.target.value)} />
            ) : (
              <Heading size="4" className="text-stone-100">{name}</Heading>
            )}
          </ModalHeader>
          <ModalBody className="pb-6">
            <div className="flex flex-col gap-2 h-full w-full">
              {modifying ? (
                <Textarea variant="bordered" className="text-stone-100"
                  value={description} onChange={e => setDescription(e.target.value)} />
              ) : (
                <Text size="2" className="text-stone-400">
                  {description}
                </Text>
              )}

              <div className="flex flex-row gap-2 items-center">
                <Text size="2" className="text-stone-100">Type:</Text>
                {modifying ? (
                  <TextInput variant="bordered" className="text-stone-100"
                    value={type} onChange={e => setType([e.target.value])} />
                ) : (
                  <div className="flex flex-row gap-2 items-center">
                    {type.map((type) => (
                      <Chip key={type} size="sm" variant="bordered">
                        {type}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-row gap-2 items-center">
                <Text size="2" className="text-stone-100">
                  Date:
                </Text>
                {modifying ? (
                  <DatePickerInput type="range" clearable value={timeSpan} onChange={setTimeSpan} />
                ) : (
                  <Text size="2" className="text-stone-400">
                    {dateToCalendarDate(timeSpan[0]!).toString()} | {dateToCalendarDate(timeSpan[1]!).toString()}
                  </Text>
                )}
              </div>

              <Text size="2" className="text-stone-100">
                Streak ({streak.length} days)
              </Text>

              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                maxDate={new Date()}
                renderDay={(date) => {
                  const dateString = dateToCalendarDate(date).toString();
                  const hasStreak = streak.some(entry => entry.date.toString() === dateString);
                  return (
                    <Indicator size={4} position="bottom-center" color="green" offset={-2} disabled={!hasStreak}>
                      <div>{date.getDate()}</div>
                    </Indicator>
                  );
                }}
              />
            </div>
          </ModalBody>

          <Button
            isIconOnly
            radius="full"
            className="absolute bottom-4 left-4 bg-stone-800 text-white shadow-lg"
            onPress={() => modifying ? handleSave() : setModifying(true)}
          >
            {modifying ? "✓" : "M"}
          </Button>
          
          <AnimatePresence>
            {selectedStreakEntry && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 10 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className="absolute start-full top-1/3 -translate-y-1/2 text-white 
                shadow-lg rounded-lg w-2/3 min-h-[200px] max-h-[400px] flex items-center"
                onClick={handleNoteClick}
              >
                <div className="w-full rounded-lg shadow-xl">
                  <Textarea
                    variant="bordered"
                    className="text-stone-100 w-full min-h-[200px] max-h-[400px] overflow-y-auto"
                    value={selectedStreakEntry.note}
                    onChange={(e) => handleNoteChange(e.target.value)}
                    placeholder="Add a note for this day..."
                    minRows={8}
                    maxRows={16}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ModalContent>
      </Modal>
    </>
  );
}
