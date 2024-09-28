import React, { useState } from 'react';
import { RangeSlider as MantineRangeSlider } from '@mantine/core';

const RangeSlider = ({
  marks,
  controlledRangeValue = false,
  setControlledRangeValue = () => {},
  ...props
}) => {
  const [rangeValue, setRangeValue] = useState([6500, 8500]);

  const handleChange = e => {
    setControlledRangeValue(e);
    setRangeValue(e);
  };

  return (
    <MantineRangeSlider
      value={controlledRangeValue || rangeValue}
      onChange={handleChange}
      marks={marks}
      {...props}
    />
  );
};

export default RangeSlider;
