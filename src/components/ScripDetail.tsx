import { Flex, Heading, Text, ScrollArea, Box } from "@radix-ui/themes";
import { Scrip as ScripModel } from "../models/scrip";

interface ScripDetailProps extends ScripModel {}

export default function ScripDetail({ name, description, type, timeSpan, streak }: ScripDetailProps) {
  return (
    <Flex direction="column" gap="2" className="bg-stone-800 rounded-lg p-4 w-60">
      <Heading size="4" className="text-stone-100">{name}</Heading>
      <Text size="2" className="text-stone-400">
        {description}
      </Text>
      
      <Flex direction="row" gap="2" className="items-center">
        <Text size="2" className="text-stone-100">
          Type:
        </Text>
        <Text size="2" className="text-stone-400">
          {type.join(", ")}
        </Text>
      </Flex>
      <Flex direction="row" gap="2" className="items-center">
        <Text size="2" className="text-stone-100">
          Date:
        </Text>
        <Text size="2" className="text-stone-400">
          {timeSpan[0].toString()} | {timeSpan[1].toString()}
        </Text>
      </Flex>
      <Text size="2" className="text-stone-100">
        Streak ({streak.length} days)
      </Text>
      <Flex direction="row" gap="2" className="w-full h-1/3 ring-1 ring-stone-700 rounded-lg">
        <ScrollArea
          radius="none"
          type="always"
          scrollbars="horizontal"
          className="w-full h-full"
        >
          <Box width="800px" height="1px" />
        </ScrollArea>
      </Flex>
    </Flex>
  );
}
