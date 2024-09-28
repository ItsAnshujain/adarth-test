import { ActionIcon, Box, Group } from '@mantine/core';
import React from 'react';
import { Edit, Trash } from 'react-feather';
import toIndianCurrency from '../../../../utils/currencyFormat';

const OperationalCostCard = ({ isPeer = false, item, onEdit = () => {}, onDelete = () => {} }) => (
  <Box key={item?._id} className="py-3 border-b border-black flex justify-between px-5">
    <div className="flex">
      {!isPeer ? (
        <ActionIcon onClick={onEdit}>
          <Edit className="text-black h-5" />
        </ActionIcon>
      ) : null}
      <div className="ml-3">
        <p className="font-medium">{item?.type?.name}</p>
        <p className="font-light text-sm w-[80%] mb-1 text-gray-500">{item?.description}</p>
        <p className="text-xs mb-1">Created at:</p>
        <p className="text-xs text-gray-500 font-medium">
          {item?.day || 'NA'}/{item?.month || 'NA'}/{item?.year}
        </p>
      </div>
    </div>
    <Group align="flex-start">
      <p>{toIndianCurrency(item?.amount)}</p>
      {!isPeer ? (
        <ActionIcon onClick={onDelete}>
          <Trash className="text-black h-5" />
        </ActionIcon>
      ) : null}
    </Group>
  </Box>
);

export default OperationalCostCard;
