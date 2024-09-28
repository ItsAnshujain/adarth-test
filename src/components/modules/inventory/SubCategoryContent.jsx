import React, { memo } from 'react';
import { stringToColour } from '../../../utils';

const SubCategoryContent = ({ subCategory }) => (
  <div>
    {subCategory ? (
      <p
        className="h-6 px-3 flex items-center rounded-xl text-white font-medium text-[13px] capitalize"
        style={{
          background: stringToColour(subCategory),
        }}
      >
        {subCategory}
      </p>
    ) : (
      <span>-</span>
    )}
  </div>
);

export default memo(SubCategoryContent);
