import { ScrollArea, Button } from '@mantine/core';
import { IconReload } from '@tabler/icons';
import React from 'react';

const DropdownComponent = ({ children, onFetchMoreData, isLoading, hasNextPage, ref }) => (
  <ScrollArea w="100%" ref={ref}>
    {children}
    <div className="px-2">
      {hasNextPage ? (
        <Button
          variant="outline"
          loading={isLoading}
          loaderPosition="right"
          loaderProps={{ color: 'black', size: 'xs' }}
          disabled={!hasNextPage}
          size="xs"
          className="text-xs py-2 mb-3 mt-2 text-black w-full"
          leftIcon={<IconReload size={16} />}
          onClick={onFetchMoreData}
        >
          {isLoading ? 'Loading...' : 'Load More'}
        </Button>
      ) : null}
    </div>
  </ScrollArea>
);

export default DropdownComponent;
