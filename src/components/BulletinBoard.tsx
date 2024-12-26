import { Flex, Text } from "@radix-ui/themes";
import ScripDetail from "./ScripDetail";
import Database from '@tauri-apps/plugin-sql';
import { useEffect, useState } from "react";
import { Scrip as ScripModel, createScrip, scripSerializer } from "../models/scrip";
import {
  DateRangePicker, Modal as NextModal, ModalContent,
  ModalHeader, ModalBody, ModalFooter, Button, Input,
} from "@nextui-org/react";
import { CalendarDate } from "@internationalized/date";

export default function BulletinBoard() {
  const [scrips, setScrips] = useState<ScripModel[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newScripData, setNewScripData] = useState({
    name: "",
    description: "",
    type: "",
  });
  const [timeSpan, setTimeSpan] = useState<{ start: CalendarDate; end: CalendarDate } | null>(null);

  useEffect(() => {
    connectDb().then(() => {
      fetchScrips();
    });
  }, []);

  async function connectDb() {
    const db = await Database.load('sqlite:main.db');

    // await db.execute(`DROP TABLE IF EXISTS scrips`);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS scrips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        time_span TEXT NOT NULL,
        streak TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async function fetchScrips() {
    const db = await Database.load('sqlite:main.db');
    const result = await db.select<any[]>('SELECT * FROM scrips ORDER BY created_at DESC');
    setScrips(result.map(row => scripSerializer.fromRow(row)));
  }

  const handleCreateScrip = async () => {
    if (!timeSpan) return;

    const newScrip = createScrip(
      newScripData.name || "New Scrip",
      newScripData.description || "Description",
      [newScripData.type],
      timeSpan.start,
      timeSpan.end
    );

    const db = await Database.load('sqlite:main.db');
    const rowData = scripSerializer.toRow(newScrip);
    await db.execute(
      'INSERT INTO scrips (name, description, type, time_span, streak) VALUES ($1, $2, $3, $4, $5)',
      [
        rowData.name,
        rowData.description,
        rowData.type,
        rowData.time_span,
        rowData.streak
      ]
    );

    await fetchScrips();
    setModalOpen(false);
    setNewScripData({ name: "", description: "", type: "" });
    setTimeSpan(null);
  };

  return (
    <div className="relative w-full h-full">
      <Flex
        direction="row" gap="4"
        className="w-full h-full bg-stone-900 rounded-lg p-2"
        data-tauri-drag-region
      >
        {scrips.map((scrip, index) => (
          <ScripDetail key={index} {...scrip} />
        ))}
      </Flex>

      <Button
        isIconOnly
        radius="full"
        className="fixed bottom-4 right-4 bg-gradient-to-tr 
        from-pink-500 to-yellow-500 text-white shadow-lg"
        onPress={() => setModalOpen(true)}
      >
        +
      </Button>

      <NextModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
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
                label="Stay duration"
                value={timeSpan}
                onChange={(value) => value && setTimeSpan(value)}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleCreateScrip}>
              Create Scrip
            </Button>
          </ModalFooter>
        </ModalContent>
      </NextModal>
    </div>
  );
}

