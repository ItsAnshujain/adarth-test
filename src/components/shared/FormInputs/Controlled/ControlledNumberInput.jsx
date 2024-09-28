import { Controller, useFormContext } from 'react-hook-form';
import NumberInput from '../NumberInput';

const ControlledNumberInput = ({ name, ...props }) => {
  const form = useFormContext();

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <NumberInput
          {...props}
          onChange={field.onChange}
          onBlur={field.onBlur}
          value={field.value}
          error={form.formState?.errors?.[name]?.message}
        />
      )}
    />
  );
};

export default ControlledNumberInput;
