import React, { useState } from 'react';
import classNames from 'classnames';
import { Button } from '@mantine/core';
import { ChevronDown, Plus } from 'react-feather';
import { useClickOutside } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import ProposalFilter from '../../proposals/Filter';
import BookingFilter from '../../bookings/Filter';
import calendar from '../../../../assets/data-table.svg';
import DateRange from '../../../DateRange';

const DateAndFilterHeader = ({ activeChildTab }) => {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const ref = useClickOutside(() => setShowDatePicker(false));

  const toggleFilter = () => setShowFilter(!showFilter);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);
  const handleCreateProposal = () => navigate('/proposals/create-proposals');

  return (
    <div className="flex">
      <div ref={ref} className="mr-2 relative">
        <Button onClick={toggleDatePicker} variant="default">
          <img src={calendar} className="h-5" alt="calendar" />
        </Button>
        {showDatePicker && (
          <div
            className={classNames(
              activeChildTab === 'booking' || activeChildTab === 'sales'
                ? '-translate-x-[460px]'
                : '-translate-x-1/2',
              'absolute z-20 bg-white -top-0.3',
            )}
          >
            <DateRange handleClose={toggleDatePicker} dateKeys={['from', 'to']} />
          </div>
        )}
      </div>
      <div>
        <Button onClick={toggleFilter} variant="default" className="font-medium">
          <ChevronDown size={16} className="mt-[1px] mr-1" /> Filter
        </Button>
        {showFilter && (activeChildTab === 'booking' || activeChildTab === 'sales') && (
          <BookingFilter isOpened={showFilter} setShowFilter={setShowFilter} />
        )}
        {showFilter && activeChildTab === 'proposal' && (
          <ProposalFilter isOpened={showFilter} setShowFilter={setShowFilter} />
        )}
      </div>
      {activeChildTab === 'proposal' && (
        <div className="mx-2">
          <Button
            variant="default"
            onClick={handleCreateProposal}
            className="font-medium bg-purple-450 text-white"
          >
            <Plus className="h-4" />
            Add Proposal
          </Button>
        </div>
      )}
    </div>
  );
};

export default DateAndFilterHeader;
