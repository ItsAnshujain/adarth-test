import React from 'react';
import { Button, Menu as MantineMenu } from '@mantine/core';
import { ChevronDown } from 'react-feather';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

const Menu = ({ btnLabel, className, options = [] }) => (
  <MantineMenu shadow="md" width={200}>
    <MantineMenu.Target>
      <Button
        rightIcon={<ChevronDown />}
        className={classNames('bg-black text-sm  text-white', className)}
      >
        {btnLabel}
      </Button>
    </MantineMenu.Target>

    <MantineMenu.Dropdown>
      {options.map(item => (
        <Link to={item?.path} key={item?.path}>
          <MantineMenu.Item className="font-bold">{item.label}</MantineMenu.Item>
        </Link>
      ))}
    </MantineMenu.Dropdown>
  </MantineMenu>
);

export default Menu;
