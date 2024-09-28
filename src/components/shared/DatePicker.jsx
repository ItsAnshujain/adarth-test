import { DatePicker as MantineDatePicker } from '@mantine/dates';
import { createStyles } from '@mantine/core';
import { useFormContext } from '../../context/formContext';

export const useStyles = createStyles({
  outside: { opacity: 0 },
  disabled: { color: '#ced4da !important' },
  weekend: { color: '#495057 !important' },
  selected: { color: '#FFF !important' },
});

const DatePicker = ({ name = '', styles, errors, ...props }) => {
  const form = useFormContext();
  const { classes, cx } = useStyles();

  return (
    <MantineDatePicker
      name={name}
      placeholder="DD/MM/YYYY"
      inputFormat="DD/MM/YYYY"
      defaultValue={new Date()}
      styles={styles}
      error={errors}
      disableOutsideEvents
      classNames={{ disabled: '' }}
      dayClassName={(_, modifiers) =>
        cx({
          [classes.outside]: modifiers.outside,
          [classes.weekend]: modifiers.weekend,
          [classes.disabled]: modifiers.disabled,
          [classes.selected]: modifiers.selected,
        })
      }
      {...form.getInputProps(name)}
      {...props}
    />
  );
};

export default DatePicker;
