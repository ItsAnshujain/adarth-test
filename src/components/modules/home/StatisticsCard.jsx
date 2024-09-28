import { Card, Group, Image } from '@mantine/core';
import classNames from 'classnames';
import React from 'react';

const StatisticsCard = ({ backgroundColor, icon, label, textColor, count, className }) => (
  <Card
    className={classNames(
      backgroundColor,
      'h-full rounded-lg flex flex-col p-3 gap-y-2',
      className,
    )}
  >
    <Group className="items-start">
      <Image src={icon} height={20} width={20} fit="contain" alt={label} />
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className={classNames(textColor, 'font-semibold text-md')}>{count}</p>
      </div>
    </Group>
  </Card>
);

export default StatisticsCard;
