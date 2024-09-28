import { Badge, Button, Chip, HoverCard } from '@mantine/core';
import React, { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Dropzone } from '@mantine/dropzone';
import classNames from 'classnames';
import { useUploadFile } from '../../../../apis/queries/upload.queries';
import upload from '../../../../assets/upload.svg';
import { supportedTypes } from '../../../../utils';

const updatedSupportedTypes = [...supportedTypes, 'MP4'];

const UploadMediaButton = ({ updateData, isActive, id, hasMedia = false }) => {
  const openRef = useRef(null);
  const uploadFile = useUploadFile();
  const handleUpload = async params => {
    const formData = new FormData();
    formData.append('files', params?.[0]);
    const res = await uploadFile.mutateAsync(formData);

    if (res?.[0].Location) {
      updateData('media', res[0].Location, id);
    }
  };

  return (
    <>
      <Dropzone
        style={{ padding: 0, border: 'none' }}
        onDrop={handleUpload}
        multiple={false}
        disabled={!isActive || uploadFile.isLoading}
        openRef={openRef}
        maxSize={5000000}
      >
        {/* children */}
      </Dropzone>
      <HoverCard openDelay={1000}>
        <HoverCard.Target>
          <Button
            disabled={uploadFile.isLoading}
            onClick={() => (isActive ? openRef.current() : null)}
            loading={uploadFile.isLoading}
            className={classNames(
              isActive ? 'bg-purple-350 cursor-pointer' : 'bg-purple-200 cursor-not-allowed',
              'py-1 px-2 h-[70%] flex items-center gap-2 text-white rounded-md',
            )}
          >
            {hasMedia ? (
              <>
                <Chip
                  classNames={{ checkIcon: 'text-white', label: 'bg-transparent' }}
                  checked
                  variant="filled"
                  color="green"
                  radius="lg"
                  size="xs"
                />
                {uploadFile.isLoading ? 'Uploading' : 'Uploaded'}
              </>
            ) : uploadFile.isLoading ? (
              'Uploading'
            ) : (
              'Upload'
            )}
            <img src={upload} alt="Upload" className="ml-2" />
          </Button>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <div className="text-sm flex flex-col">
            <span className="font-bold text-gray-500">Supported types</span>
            <div className="mt-1">
              {updatedSupportedTypes.map(item => (
                <Badge key={uuidv4()} className="mr-2">
                  {item}
                </Badge>
              ))}
            </div>
            <p className="mt-1 font-bold text-gray-500">Media size cannot be more than 5MB</p>
          </div>
        </HoverCard.Dropdown>
      </HoverCard>
    </>
  );
};

export default UploadMediaButton;
