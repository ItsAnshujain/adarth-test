import { DatePicker, DatePickerInput } from '@mantine/dates';
import { Calendar } from 'react-feather';

const CustomDateRangePicker = ({
  classes,
  value,
  rangeCalendarMinDate,
  handleSetStartDate,
  datePickerMinDate,
  handleRangeSetting,
  styles,
  handleSetEndDate,
  cx = () => {},
}) => (
  <div className="flex gap-8 pt-4">
    <div className="border rounded-md flex-1 p-4 py-6">
      <DatePicker
        type="range"
        value={value}
        disableOutsideEvents
        hideOutsideDates
        onChange={handleRangeSetting}
        dayClassName={(_, modifiers) =>
          cx({
            [classes?.outside]: modifiers.outside,
            [classes?.weekend]: modifiers.weekend,
            [classes?.selectedRange]: modifiers.selectedInRange,
            [classes?.disabled]: modifiers.disabled,
          })
        }
        allowSingleDateInRange
        minDate={rangeCalendarMinDate}
      />
    </div>
    <div className="flex-1 flex flex-col items-start gap-2">
      <p className="text-lg font-bold">Picked Date</p>
      <p className="font-bold">Date From</p>
      <DatePickerInput
        clearable={false}
        onChange={handleSetStartDate}
        value={value?.[0]}
        icon={<Calendar className="text-black absolute left-[500%]" />}
        styles={styles}
        disableOutsideEvents
        hideOutsideDates
        minDate={datePickerMinDate}
        placeholder="Month Day, Year"
        classNames={{ calendar: 'h-72' }}
      />
      <p className="font-bold mt-3">Date To</p>
      <DatePickerInput
        clearable={false}
        onChange={handleSetEndDate}
        value={value?.[1]}
        icon={<Calendar className="text-black absolute left-[500%]" />}
        styles={styles}
        disableOutsideEvents
        hideOutsideDates
        minDate={datePickerMinDate}
        placeholder="Month Day, Year"
        classNames={{ calendar: 'h-72' }}
      />
    </div>
  </div>
);

export default CustomDateRangePicker;
