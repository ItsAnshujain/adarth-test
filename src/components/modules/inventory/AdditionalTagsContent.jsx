import React, { memo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Badge } from '@mantine/core';

const AdditionalTagsContent = ({ list }) => (
  <div className="flex gap-x-2">
    {list?.length
      ? list.map(
          (item, index) =>
            index < 2 && (
              <Badge
                key={uuidv4()}
                size="lg"
                className="capitalize w-fit"
                title={item}
                variant="outline"
                color="cyan"
                radius="xs"
              >
                {item}
              </Badge>
            ),
        )
      : '-'}
  </div>
);

export default memo(AdditionalTagsContent);
