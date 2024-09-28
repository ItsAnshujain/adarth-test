import { Image } from '@mantine/core';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React from 'react';
import checkgreen from '../../../../assets/check-success.svg';
import checkbw from '../../../../assets/check-other.svg';

const DATE_FORMAT = 'DD-MM-YYYY h:mm a';

const StatusNode = ({
  status = '',
  isSuccess = false,
  dateAndTime,
  hasBottomEdge = true,
  hasRightEdge = true,
  className = '',
}) => (
  <div className={classNames('relative w-fit mb-14', className)}>
    <div
      className={classNames(
        'border rounded-xl p-5 flex flex-row items-start w-fit min-w-[280px]',
        hasRightEdge &&
          'after:content-[""] after:h-[2px] after:w-[55px] after:bg-green-500 after:absolute after:right-[-55px] after:top-[70px]',
        hasBottomEdge &&
          'before:content-[""] before:h-[55px] before:w-[2px] before:bg-green-500 before:absolute before:bottom-[-55px] before:left-[140px]',
      )}
    >
      <div className="mt-1 mr-2 w-[20px] h-[20px]">
        <Image src={isSuccess ? checkgreen : checkbw} />
      </div>
      <div>
        <p className="text-black font-bold text-xl">{status}</p>
        <p
          className={classNames(isSuccess ? 'text-green-500' : 'text-orange-350', 'font-bold mb-3')}
        >
          {isSuccess ? 'Successful' : 'Ongoing'}
        </p>
        <p className="text-gray-550 font-medium text-md">Date &amp; Time</p>
        <p className="text-black font-medium text-md">
          {dateAndTime ? dayjs(dateAndTime).format(DATE_FORMAT) : 'NA'}
        </p>
      </div>
    </div>
  </div>
);

export default StatusNode;
