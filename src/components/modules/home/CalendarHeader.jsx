import { ActionIcon, Button, ColorSwatch, Flex, Group, Popover, Select } from '@mantine/core';
import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'react-feather';
import classNames from 'classnames';
import { monthsInShort } from '../../../utils/constants';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 15 }, (_, index) => ({
  label: currentYear + index,
  value: currentYear + index,
}));

const CalendarHeader = ({
  monthTitle,
  onPrevious = () => {},
  onNext = () => {},
  onFilter = () => {},
}) => {
  const [opened, setOpened] = useState(false);
  const [activeYear, setActiveYear] = useState(currentYear);
  const [activeMonth, setActiveMonth] = useState();

  const handleActiveYear = year => {
    setActiveYear(year);
    setActiveMonth();
  };

  const handleActiveMonth = month => {
    onFilter(`${activeYear.toString()}-${month.value}-01`);
    setActiveMonth(month.value);
    setOpened(false);
  };

  return (
    <article className="h-14 relative rounded-t-lg bg-gray-50">
      <div className="absolute right-[16px] top-[22px] flex gap-4">
        <Group className="flex gap-1">
          <ColorSwatch color="#914EFB" size={10} mr={4} />
          <p className="text-black text-xs">Vacant Inventory</p>
        </Group>
        <Group className="flex gap-1">
          <ColorSwatch color="#28B446" size={10} mr={4} />
          <p className="text-black text-xs">Booking Starting</p>
        </Group>
        <Group className="flex gap-1">
          <ColorSwatch color="#FD3434" size={10} mr={4} />
          <p className="text-black text-xs">Booking Ending</p>
        </Group>
      </div>
      <Flex className="items-center absolute left-[16px] top-[2px] bottom-0  flex gap-2">
        <ActionIcon
          onClick={() => {
            onPrevious();
            setActiveMonth();
            setActiveYear(currentYear);
          }}
        >
          <ChevronLeft className="h-5 text-black" />
        </ActionIcon>
        <Popover
          opened={opened}
          onChange={setOpened}
          width={300}
          position="bottom-start"
          shadow="md"
          radius={12}
        >
          <Popover.Target>
            <Button className="light-button font-medium" onClick={() => setOpened(o => !o)}>
              {monthTitle || ''}
            </Button>
          </Popover.Target>

          <Popover.Dropdown>
            <Select
              data={years}
              className="mb-3"
              value={activeYear}
              onChange={handleActiveYear}
              rightSection={<ChevronDown size={16} />}
              styles={{ rightSection: { pointerEvents: 'none' } }}
            />

            <Group className="grid grid-cols-3 grid-rows-4 gap-x-2 gap-y-3">
              {monthsInShort.map(month => (
                <Button
                  key={month.value}
                  className={classNames(
                    activeMonth === month.value ? 'primary-button' : 'light-button',
                    'font-medium border-gray-200 rounded-md p-0',
                  )}
                  onClick={() => handleActiveMonth(month)}
                >
                  {month.label}
                </Button>
              ))}
            </Group>
          </Popover.Dropdown>
        </Popover>
        <ActionIcon
          onClick={() => {
            onNext();
            setActiveMonth();
            setActiveYear(currentYear);
          }}
        >
          <ChevronRight className="h-5 text-black" />
        </ActionIcon>
      </Flex>
    </article>
  );
};

export default CalendarHeader;
