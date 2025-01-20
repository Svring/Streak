import { Text } from "@radix-ui/themes";
import {
  ModalHeader, ModalBody, Textarea
} from "@nextui-org/react";
import { DatePicker, DatePickerInput } from "@mantine/dates";
import { TextInput, Indicator } from '@mantine/core';
import { useState } from "react";
import type { Scrip } from "../models/scrip";

interface ScripDetailEditProps {
  scrip: Scrip;
  onSave: (updatedScrip: Scrip) => Promise<void>;
}

export function ScripDetailEdit({ scrip, onSave }: ScripDetailEditProps) {
  const [name, setName] = useState(scrip.name);
  const [description, setDescription] = useState(scrip.description);
  const [type, setType] = useState(scrip.type);
  const [timeSpan, setTimeSpan] = useState<Date[]>([
    scrip.timeSpan[0],
    scrip.timeSpan[1]
  ]);
  const [streak, setStreak] = useState(scrip.streak);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  };

  const handleDateSelect = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
    
    const existingEntry = streak.find(entry => isSameDay(entry.date, date));
    if (existingEntry) {
      setStreak(streak.filter(entry => !isSameDay(entry.date, date)));
    } else {
      setStreak([...streak, { date, note: '' }]);
    }
  };

  const handleSave = () => {
    onSave({
      ...scrip,
      name,
      description,
      type,
      timeSpan,
      streak
    });
  };

  return (
    <>
      <ModalHeader>
        <TextInput
          variant="unstyled"
          className="text-stone-100"
          size="lg"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="flex flex-col gap-2 h-full w-full">
          <Textarea
            variant="bordered"
            className="text-stone-100"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <div className="flex flex-row gap-2 items-center">
            <Text size="2" className="text-stone-100">Type:</Text>
            <TextInput
              variant="bordered"
              className="text-stone-100"
              value={type[0]}
              onChange={e => setType([e.target.value])}
            />
          </div>

          <div className="flex flex-row gap-2 items-center">
            <Text size="2" className="text-stone-100">
              Date:
            </Text>
            <DatePickerInput
              type="range"
              clearable
              value={[timeSpan[0] || null, timeSpan[1] || null]}
              onChange={dates => setTimeSpan([dates[0] || timeSpan[0], dates[1] || timeSpan[1]])}
            />
          </div>

          <Text size="2" className="text-stone-100">
            Streak ({streak.length} days)
          </Text>

          <DatePicker
            value={selectedDate}
            onChange={handleDateSelect}
            maxDate={new Date()}
            renderDay={(date) => {
              const hasStreak = streak.some(entry => isSameDay(entry.date, date));
              return (
                <Indicator size={4} position="bottom-center" color="green" offset={-2} disabled={!hasStreak}>
                  <div>{date.getDate()}</div>
                </Indicator>
              );
            }}
          />
        </div>
      </ModalBody>
    </>
  );
} 