import React from 'react';
import { ColorSwatch, Group, Popover } from '@mantine/core';
import { isArray } from 'lodash';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { DATE_THIRD_FORMAT } from '../../../utils/constants';

const CalendarEventPopover = ({ eventInfo }) => {
  const {
    hasVacantSpace,
    hasBookingEnd,
    hasBookingStarted,
    bookingStarting,
    bookingEnding,
    inventoryVacancy,
  } = eventInfo.event.extendedProps;

  return (
    <Popover width={300} withinPortal shadow="md" radius={12}>
      <Popover.Target>
        <Group position="center" spacing="xs" className="cursor-pointer py-2 z-0">
          {hasVacantSpace ? <ColorSwatch color="#914EFB" size={10} /> : null}
          {hasBookingEnd ? <ColorSwatch color="#FD3434" size={10} /> : null}
          {hasBookingStarted ? <ColorSwatch color="#28B446" size={10} /> : null}
        </Group>
      </Popover.Target>

      <Popover.Dropdown className="p-0">
        <article>
          <section className="bg-gray-100 px-2 py-1 rounded-t-xl">
            <p className="text-black text-md font-bold">
              {dayjs(eventInfo.event.start).format(DATE_THIRD_FORMAT)}
            </p>
          </section>
          <section className="p-3 bg-white min-h-[50px] max-h-[150px] overflow-y-auto rounded-b-xl">
            <div>
              {isArray(inventoryVacancy)
                ? inventoryVacancy?.map(item => (
                    <Group key={uuidv4()} className="flex flex-row gap-1 flex-wrap items-start">
                      <div className="mt-2 mr-1">
                        <ColorSwatch color="#914EFB" size={10} />
                      </div>
                      <div className="flex flex-1 flex-wrap gap-x-1">
                        <Link
                          to={`/inventory/view-details/${item?.inventory?.[0]?._id}`}
                          className="flex items-baseline gap-2"
                        >
                          <p
                            className="text-black font-medium max-w-[240px] text-ellipsis whitespace-nowrap overflow-x-hidden"
                            title={item?.inventory?.[0].basicInformation?.spaceName}
                          >
                            {item?.inventory?.[0].basicInformation?.spaceName}
                          </p>
                        </Link>
                        <p>will be vacant for </p>
                        <Link
                          to={`/bookings/view-details/${item?.bookingId}`}
                          className="flex items-baseline gap-2"
                        >
                          <p
                            className="text-black font-medium max-w-[240px] text-ellipsis whitespace-nowrap overflow-x-hidden"
                            title={item?.campaignName}
                          >
                            {item?.campaignName}
                          </p>
                        </Link>
                      </div>
                    </Group>
                  ))
                : null}
            </div>

            <div>
              {isArray(bookingStarting)
                ? bookingStarting?.map(item => (
                    <Group key={item?._id} className="flex flex-row gap-1 flex-wrap items-start">
                      <div className="mt-2 mr-1">
                        <ColorSwatch color="#28B446" size={10} />
                      </div>
                      <div className="flex flex-1 flex-wrap gap-x-1">
                        <Link
                          to={`/bookings/view-details/${item?._id}`}
                          className="flex items-baseline gap-2"
                        >
                          <p
                            className="text-black font-medium max-w-[240px] text-ellipsis whitespace-nowrap overflow-x-hidden"
                            title={item?.campaign?.name}
                          >
                            {item?.campaign?.name}
                          </p>
                        </Link>
                        <p>campaign starting</p>
                      </div>
                    </Group>
                  ))
                : null}
            </div>

            <div>
              {isArray(bookingEnding)
                ? bookingEnding?.map(item => (
                    <Group key={item?._id} className="flex flex-row gap-1 flex-wrap items-start">
                      <div className="mt-2 mr-1">
                        <ColorSwatch color="#FD3434" size={10} />
                      </div>
                      <div className="flex flex-1 flex-wrap gap-x-1">
                        <Link
                          to={`/bookings/view-details/${item?._id}`}
                          className="flex items-baseline gap-2"
                        >
                          <p
                            className="text-black font-medium max-w-[240px] text-ellipsis whitespace-nowrap overflow-x-hidden"
                            title={item?.campaign?.name}
                          >
                            {item?.campaign?.name}
                          </p>
                        </Link>
                        <p>campaign ending</p>
                      </div>
                    </Group>
                  ))
                : null}
            </div>
          </section>
        </article>
      </Popover.Dropdown>
    </Popover>
  );
};

export default CalendarEventPopover;
