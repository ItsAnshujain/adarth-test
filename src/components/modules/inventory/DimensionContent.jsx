import { isArray } from 'lodash';
import React, { memo } from 'react';

const DimensionContent = ({ list }) => (
  <div className="flex gap-x-2">
    <p className="max-w-[300px]">
      {list && isArray(list)
        ? list
            .map(ele => `${ele?.width || 0}ft x ${ele?.height || 0}ft`)
            .filter(ele => ele !== null)
            .join(', ')
        : '-'}
    </p>
  </div>
);

export default memo(DimensionContent);
