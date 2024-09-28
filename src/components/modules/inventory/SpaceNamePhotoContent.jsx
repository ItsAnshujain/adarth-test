import { Badge, Box, Image, Text } from '@mantine/core';
import classNames from 'classnames';
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { getOccupiedStateColor } from '../../../utils';

const SpaceNamePhotoContent = ({
  id,
  spaceName,
  spacePhoto,
  isUnderMaintenance,
  occupiedStateLabel,
  togglePreviewModal,
  dimensions,
  location,
  isTargetBlank = false,
}) => (
  <div className="flex items-center justify-between gap-2 mr-4">
    <div className="flex justify-start items-center flex-1">
      <Box
        className={classNames('bg-white border rounded-md', spacePhoto ? 'cursor-zoom-in' : '')}
        onClick={() =>
          spacePhoto ? togglePreviewModal(spacePhoto, spaceName, dimensions, location) : null
        }
      >
        {spacePhoto ? (
          <Image src={spacePhoto} alt="img" height={32} width={32} />
        ) : (
          <Image src={null} withPlaceholder height={32} width={32} />
        )}
      </Box>
      <Link
        to={`/inventory/view-details/${id}`}
        className="text-purple-450 font-medium px-2"
        target={isTargetBlank ? '_blank' : '_self'}
      >
        <Text className="overflow-hidden text-ellipsis underline" lineClamp={1} title={spaceName}>
          {spaceName}
        </Text>
      </Link>
    </div>
    {isUnderMaintenance || occupiedStateLabel ? (
      <Badge
        className="capitalize"
        variant="filled"
        color={getOccupiedStateColor(isUnderMaintenance, occupiedStateLabel)}
      >
        {isUnderMaintenance ? 'Under Maintenance' : occupiedStateLabel}
      </Badge>
    ) : null}
  </div>
);

export default memo(SpaceNamePhotoContent);
