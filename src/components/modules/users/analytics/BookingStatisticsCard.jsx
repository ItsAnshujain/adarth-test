import { Card, Image } from '@mantine/core';
import classNames from 'classnames';
import React from 'react';

const BookingStatisticsCard = ({ label, backgroundColor, icon, textColor, count }) => (
  <Card
    key={label}
    className={classNames(backgroundColor, 'h-full rounded-lg flex flex-col p-4 gap-y-2')}
  >
    <Image src={icon} height={20} width={20} fit="contain" />
    <span className="font-medium text-xs">{label}</span>
    <p className={classNames(textColor, 'font-medium text-md')}>{count}</p>
  </Card>
);

export default BookingStatisticsCard;
