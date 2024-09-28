import React from 'react';
import DropdownComponent from './DropdownComponent';

const DropdownWithHandler = (onFetchMoreData, isLoading, hasNextPage) =>
  React.forwardRef(({ children }, ref) => (
    <DropdownComponent
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      onFetchMoreData={onFetchMoreData}
      ref={ref}
    >
      {children}
    </DropdownComponent>
  ));

export default DropdownWithHandler;
