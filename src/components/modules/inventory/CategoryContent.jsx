import { Badge } from '@mantine/core';
import React, { memo } from 'react';
import { categoryColors } from '../../../utils';

const CategoryContent = ({ category }) => {
  const colorType = Object.keys(categoryColors).find(key => categoryColors[key] === category);

  return (
    <div>
      {category ? (
        <Badge color={colorType || 'gray'} size="lg" className="capitalize">
          {category}
        </Badge>
      ) : (
        <span>-</span>
      )}
    </div>
  );
};

export default memo(CategoryContent);
