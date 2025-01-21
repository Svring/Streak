import { Text } from "@radix-ui/themes";
import {
  ModalHeader, ModalBody, Textarea,
  Button
} from "@nextui-org/react";
import { DatePickerInput } from "@mantine/dates";
import { TextInput } from '@mantine/core';
import { useState } from "react";
import type { Scrip } from "../models/scrip";
import { BookmarkIcon } from "@radix-ui/react-icons";

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
  
  const handleSave = () => {
    onSave({
      ...scrip,
      name,
      description,
      type,
      timeSpan
    });
  };

  return (
    <>
      <ModalHeader>
        <TextInput
          variant="underlined"
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

          <Button
            isIconOnly radius="full" size="md"
            className="absolute bottom-4 right-4 bg-accentGold text-accentDark shadow-lg"
            onPress={handleSave}
          >
            <BookmarkIcon className="w-4 h-4" />
          </Button>
        </div>
      </ModalBody>
    </>
  );
} 