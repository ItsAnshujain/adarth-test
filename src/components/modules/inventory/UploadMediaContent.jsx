import React, { memo } from 'react';
import { useFormContext } from 'react-hook-form';
import UploadMediaButton from '../bookings/Create/UploadMediaButton';

const UploadMediaContent = ({ id, updateData }) => {
  const form = useFormContext();

  const watchPlace = form.watch('place') || [];

  return (
    <UploadMediaButton
      updateData={updateData}
      isActive={watchPlace?.find(item => item._id === id)}
      hasMedia={watchPlace?.find(item => (item._id === id ? !!item?.media : false))}
      id={id}
    />
  );
};

export default memo(UploadMediaContent);
