import { Button, Menu } from '@mantine/core';
import classNames from 'classnames';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const viewBy = {
  reset: 'Yearly',
  week: 'Weekly',
  month: 'Monthly',
  quarter: 'Quarterly',
  year: 'Yearly',
};

const list = [
  { label: 'Reset', value: 'year' },
  { label: 'Weekly', value: 'week' },
  { label: 'Monthly', value: 'month' },
  { label: 'Quarterly', value: 'quarter' },
  { label: 'Yearly', value: 'year' },
];

const ViewByFilter = ({ handleViewBy = () => {} }) => {
  const [activeView, setActiveView] = useState('year');
  const handleActiveView = viewType => {
    setActiveView(viewType);
    handleViewBy(viewType);
  };
  return (
    <Menu shadow="md" width={130}>
      <Menu.Target>
        <Button className="secondary-button">View By: {viewBy[activeView]}</Button>
      </Menu.Target>
      <Menu.Dropdown>
        {list.map(({ label, value }) => (
          <Menu.Item
            key={uuidv4()}
            onClick={() => handleActiveView(value)}
            className={classNames(
              activeView === value && label !== 'Reset' && 'text-purple-450 font-medium',
              label === 'Reset' && 'text-red-450 font-medium',
            )}
          >
            {label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export default ViewByFilter;
