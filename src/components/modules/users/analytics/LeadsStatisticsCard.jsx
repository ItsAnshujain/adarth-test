import { Card, Image } from '@mantine/core';
import classNames from 'classnames';
import React from 'react';

const LeadsStatisticsCard = ({ label, backgroundColor, icon, textColor, count }) => (
  <Card
    key={label}
    className={classNames(
      backgroundColor,
      'h-full rounded-lg flex flex-col p-0 py-3 pl-3 justify-between',
    )}
  >
    <div>
      <Image src={icon} height={20} width={20} fit="contain" />
      <p className="font-medium text-xs mt-3 mb-1">{label}</p>
    </div>
    <p className={classNames(textColor, 'font-medium text-md')}>{count}</p>
  </Card>
);

export default LeadsStatisticsCard;
