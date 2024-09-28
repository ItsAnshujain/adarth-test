import { Button } from '@mantine/core';
import { useState } from 'react';
import { Plus } from 'react-feather';
import { useSearchParams } from 'react-router-dom';
import InputModal from './InputModal';

const SubHeader = ({ text }) => {
  const [opened, setOpened] = useState(false);
  const toggleAddModal = () => setOpened(!opened);
  const [searchParams] = useSearchParams();
  const parentId = searchParams.get('parentId');

  return (
    <>
      <div className="h-[60px] border-b border-gray-450 flex justify-between items-center">
        <p className="text-lg font-bold">{text}</p>
        <Button
          onClick={toggleAddModal}
          className="bg-purple-450 flex align-center py-2 text-white rounded-md px-4 text-sm"
        >
          <Plus size={16} className="mt-[1px] mr-1" /> Add{' '}
          {parentId !== 'null' ? `Sub ${text}` : text}
        </Button>
      </div>
      <InputModal opened={opened} setOpened={setOpened} />
    </>
  );
};

export default SubHeader;
