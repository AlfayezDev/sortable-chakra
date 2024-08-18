import { Box, Button, Flex, Grid } from '@chakra-ui/react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import React, { useCallback, useState } from 'react';
import { SortableCard } from './components/SortableCard';
import { BsUnlock } from 'react-icons/bs';
import { BiLock } from 'react-icons/bi';
import ResizableGrid from './components/grid';

interface FlexItem {
  id: string;
  background: string;
}

const Home: React.FC = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [flexItems, setFlexItems] = useState<FlexItem[]>([
    { id: '1', background: 'teal' },
    { id: '2', background: 'snow' },
    { id: '3', background: 'peru' },
    { id: '4', background: 'red' },
  ]);

  const handleFlexSortEnd = useCallback((newItems: FlexItem[]) => {
    console.log('New flex order:', newItems);
    // You can perform any action with the new order here
  }, []);
  const handleToggleLock = useCallback(() => {
    setIsLocked((prev) => !prev);
  }, []);
  return (
    <Grid gap={4}>
      <Box mb={4} p={4} borderWidth={1} borderRadius="md">
        <Flex align="center">
          <Button
            leftIcon={isLocked ? <BiLock /> : <BsUnlock />}
            onClick={handleToggleLock}
            colorScheme={isLocked ? 'red' : 'green'}
          >
            {isLocked ? 'Unlock Sorting' : 'Lock Sorting'}
          </Button>
        </Flex>
      </Box>

      <FlexWrapper
        setItems={setFlexItems}
        items={flexItems}
        onSortEnd={handleFlexSortEnd}
        isLocked={isLocked}
      />
      <ResizableGrid
        minCellHeight={5}
        minCellWidth={6}
        initialItems={[
          {
            id: '1',
            x: 0,
            y: 0,
            w: 4,
            h: 2,
            content: 'Line Chart',
            backgroundColor: '#f0f0f0',
            chartOptions: {
              chart: {
                type: 'line',
              },
              series: [
                {
                  name: 'Sales',
                  data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
                },
              ],
              xaxis: {
                categories: [
                  1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999,
                ],
              },
            },
          },
          {
            id: '2',
            x: 4,
            y: 0,
            w: 4,
            h: 2,
            content: 'Bar Chart',
            backgroundColor: '#e0e0e0',
            chartOptions: {
              chart: {
                type: 'bar',
              },
              series: [
                {
                  name: 'Profit',
                  data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
                },
              ],
              xaxis: {
                categories: [
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                ],
              },
            },
          },
          {
            id: '3',
            x: 0,
            y: 2,
            w: 4,
            h: 2,
            content: 'Area Chart',
            backgroundColor: '#d0d0d0',
            chartOptions: {
              chart: {
                type: 'area',
              },
              series: [
                {
                  name: 'Website Traffic',
                  data: [31, 40, 28, 51, 42, 109, 100],
                },
              ],
              xaxis: {
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              },
            },
          },
          {
            id: '4',
            x: 4,
            y: 2,
            w: 4,
            h: 2,
            content: 'Pie Chart',
            backgroundColor: '#c0c0c0',
            chartOptions: {
              chart: {
                type: 'pie',
              },
              series: [44, 55, 13, 43, 22],
              labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
            },
          },
          {
            id: '6',
            x: 4,
            y: 4,
            w: 4,
            h: 2,
            content: 'Radar Chart',
            backgroundColor: '#a0a0a0',
            chartOptions: {
              chart: {
                type: 'radar',
              },
              series: [
                {
                  name: 'Series 1',
                  data: [80, 50, 30, 40, 100, 20],
                },
              ],
              xaxis: {
                categories: [
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                ],
              },
            },
          },
        ]}
        isLocked={isLocked}
      />
    </Grid>
  );
};

const FlexWrapper: React.FC<{
  items: FlexItem[];
  onSortEnd: (items: FlexItem[]) => void;
  setItems: (value: FlexItem[] | ((prevVar: FlexItem[]) => FlexItem[])) => void;
  isLocked: boolean;
}> = ({ items, setItems, onSortEnd, isLocked }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (isLocked) return;

      const { active, over } = event;

      if (active.id !== over?.id) {
        setItems((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over?.id);
          const newItems = arrayMove(items, oldIndex, newIndex);
          onSortEnd(newItems);
          return newItems;
        });
      }
    },
    [onSortEnd, isLocked]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={rectSortingStrategy}
        disabled={isLocked}
      >
        <Flex direction="row" gap={5}>
          {items.map((p) => (
            <SortableCard
              key={p.id}
              id={p.id}
              height={100}
              width={200}
              background={p.background}
              cursor={isLocked ? 'not-allowed' : 'grab'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              Card {p.id}
            </SortableCard>
          ))}
        </Flex>
      </SortableContext>
    </DndContext>
  );
}; // Helper function to move array items
const arrayMove = <T,>(array: T[], from: number, to: number): T[] => {
  const newArray = array.slice();
  newArray.splice(
    to < 0 ? newArray.length + to : to,
    0,
    newArray.splice(from, 1)[0]
  );
  return newArray;
};

export default Home;
