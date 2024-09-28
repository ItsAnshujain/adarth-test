import { Button, Checkbox, Drawer } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

const SelectColumns = ({ isOpened, styles, onClose, columns }) => {
  const [proposalColumns, setProposalColumns] = useState([]);

  const form = useFormContext();

  const handleCheckedValues = value => {
    if (proposalColumns.some(col => col === value)) {
      setProposalColumns(proposalColumns.filter(col => col !== value));
    } else {
      setProposalColumns(prev => [...prev, value]);
    }
  };

  const applySelectedColumns = () => {
    form.setValue('displayColumns', proposalColumns);
    onClose();
  };

  const selectAll = () => {
    setProposalColumns(columns.map(col => col.enum));
  };

  useEffect(() => {
    setProposalColumns(form.watch('displayColumns'));
  }, [form.watch('displayColumns')]);

  return (
    <Drawer
      className="overflow-auto"
      overlayOpacity={0.1}
      overlayBlur={0}
      size="sm"
      transition="slide-down"
      transitionDuration={1350}
      transitionTimingFunction="ease-in-out"
      padding="xl"
      position="right"
      opened={isOpened}
      styles={styles}
      title="Select Columns"
      onClose={onClose}
    >
      <div className="w-full flex justify-end gap-5">
        <Button
          variant="default"
          className="mb-3 bg-purple-450 text-white w-full"
          onClick={applySelectedColumns}
        >
          Apply
        </Button>
        <Button variant="outline" className="mb-3 w-full" onClick={selectAll}>
          Select all
        </Button>
      </div>
      <div className="overflow-auto">
        {columns?.map(column => (
          <Checkbox
            onChange={event => handleCheckedValues(event.target.value)}
            label={column?.name}
            checked={column.mandatory || proposalColumns?.some(col => col === column?.enum)}
            className="my-2 border p-2"
            disabled={column.mandatory}
            value={column.enum}
          />
        ))}
      </div>
    </Drawer>
  );
};

export default SelectColumns;
