import { Button, Menu } from '@mantine/core';
import classNames from 'classnames';
import React, { useState } from 'react';

const viewBy = {
  'active': 'Active',
  'disabled': 'Disabled',
};

const list = [
  { label: 'Active', value: 'active' },
  { label: 'Disabled', value: 'disabled' },
];

const ViewByFilter = ({ handleViewBy = () => {} }) => {
  const [activeView, setActiveView] = useState('active');

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
            key={label}
            onClick={() => handleActiveView(value)}
            className={classNames(activeView === value && 'text-purple-450 font-medium')}
          >
            {label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export default ViewByFilter;
