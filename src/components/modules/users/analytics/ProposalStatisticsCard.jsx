import { Card, Image } from '@mantine/core';
import classNames from 'classnames';
import React from 'react';

const ProposalStatisticsCard = ({ label, icon, textColor, count }) => (
  <Card key={label} className="rounded-lg flex flex-col justify-evenly border p-3">
    <Image src={icon} height={20} width={20} fit="contain" />
    <p className="font-medium text-xs mt-1">{label}</p>
    <p className={classNames(textColor, 'font-medium text-md')}>{count}</p>
  </Card>
);

export default ProposalStatisticsCard;
