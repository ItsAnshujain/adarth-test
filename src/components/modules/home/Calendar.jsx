import React, { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useCalendarEvents } from '../../../apis/queries/booking.queries';
import CalendarEventPopover from './CalendarEventPopover';
import { DATE_FORMAT, DATE_FOURTH_FORMAT } from '../../../utils/constants';
import CalendarHeader from './CalendarHeader';

dayjs.extend(customParseFormat);

const Calendar = () => {
  const [month, setMonth] = useState({
    startDate: dayjs().startOf('month').format(DATE_FORMAT),
    endDate: dayjs().endOf('month').format(DATE_FORMAT),
  });
  const [monthTitle, setMonthTitle] = useState(dayjs().startOf('month').format(DATE_FOURTH_FORMAT));
  const ref = useRef(null);
  const calendarEvents = useCalendarEvents({ ...month, utcOffset: dayjs().utcOffset() });

  const handlePreviousNextMonth = (type, filterDate) => {
    const calendarApi = ref.current?.getApi();
    if (filterDate) {
      calendarApi[type](filterDate);
    } else {
      calendarApi[type]();
    }
    const { start, end } = calendarApi.currentData.dateProfile.activeRange;
    const formattedStartDate = dayjs(start).format(DATE_FORMAT);
    const formattedEndDate = dayjs(end).format(DATE_FORMAT);

    setMonth({
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    });
    setMonthTitle(calendarApi.currentData.viewTitle ?? 'NA');
  };

  const renderEventContent = eventInfo => <CalendarEventPopover eventInfo={eventInfo} />;

  const renderDayCellContent = e => (
    <div className="w-full">
      <p className="text-md font-semibold text-center">{e.dayNumberText}</p>
    </div>
  );

  return (
    <>
      <CalendarHeader
        monthTitle={monthTitle}
        onNext={() => handlePreviousNextMonth('next')}
        onPrevious={() => handlePreviousNextMonth('prev')}
        onFilter={filterDate => handlePreviousNextMonth('gotoDate', filterDate)}
      />

      <FullCalendar
        height="84.5%"
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable
        events={calendarEvents.data || []}
        eventContent={renderEventContent}
        dayCellClassNames={() => 'bg-white'}
        ref={ref}
        headerToolbar={{
          left: '',
          center: '',
          right: '',
        }}
        viewClassNames={() => 'bg-white'}
        dayHeaderClassNames={() => 'bg-purple-50 text-md font-medium'}
        eventBackgroundColor="transparent"
        eventBorderColor="transparent"
        dayCellContent={renderDayCellContent}
      />
    </>
  );
};

export default Calendar;
