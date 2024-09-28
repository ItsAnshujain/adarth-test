import { Button, Menu } from '@mantine/core';
import React from 'react';
import { IconChevronDown, IconDatabase } from '@tabler/icons';
import { Link } from 'react-router-dom';

const RepositoryMenuPopover = () => (
  <Menu shadow="md" width={150} classNames={{ label: 'text-white' }}>
    <Menu.Target>
      <Button
        rightIcon={<IconChevronDown />}
        className="text-gray-400 border-gray-400 mr-4"
        leftIcon={<IconDatabase />}
      >
        Repository
      </Button>
    </Menu.Target>
    <Menu.Dropdown className="bg-purple-450 rounded-md w-48">
      <Menu.Item
        className="text-white hover:text-black"
        component={Link}
        to="/repository/terms-and-conditions"
      >
        <span className="text-sm">Terms &amp; Conditions</span>
      </Menu.Item>
      <Menu.Item className="text-white hover:text-black" component={Link} to="/repository/company">
        <span className="text-sm">Company</span>
      </Menu.Item>
      <Menu.Item
        className="text-white hover:text-black"
        component={Link}
        to="/repository/co-company"
      >
        <span className="text-sm">Co-Company</span>
      </Menu.Item>
      <Menu.Item className="text-white hover:text-black" component={Link} to="/repository/contact">
        <span className="text-sm">Contact</span>
      </Menu.Item>
    </Menu.Dropdown>
  </Menu>
);

export default RepositoryMenuPopover;
