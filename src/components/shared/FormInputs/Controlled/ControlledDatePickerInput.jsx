import { DatePickerInput } from '@mantine/dates';
import { useController, useFormContext } from 'react-hook-form';

const ControlledDatePickerInput = ({ name, ...props }) => {
  const form = useFormContext();
  const { field, fieldState } = useController({
    name,
    control: form.control,
  });

  return (
    <DatePickerInput
      {...field}
      error={fieldState.error?.message}
      classNames={{
        label: 'font-medium text-primary text-base mb-2',
        input: 'border-gray-450',
      }}
      {...props}
    />
  );
};

export default ControlledDatePickerInput;
