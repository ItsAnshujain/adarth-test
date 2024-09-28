import { Button as MantineButton } from '@mantine/core';
import classNames from 'classnames';
import React from 'react';

const Button = ({ children, customVariant, variant, size, className, ...rest }) => (
  <MantineButton
    variant={variant}
    size={size}
    className={classNames(
      customVariant === 'primary'
        ? 'btn-primary'
        : customVariant === 'info'
        ? 'btn-info'
        : customVariant === 'light'
        ? 'btn-light'
        : '',
      className,
    )}
    {...rest}
  >
    {children}
  </MantineButton>
);

Button.defaultProps = {
  customVariant: 'primary',
  size: 'lg',
  className: '',
  variant: 'filled',
};

export default Button;
