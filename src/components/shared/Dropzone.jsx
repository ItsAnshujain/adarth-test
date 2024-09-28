import React from 'react';
import { Dropzone } from '@mantine/dropzone';
import { Image } from '@mantine/core';
import classNames from 'classnames';
import image from '../../assets/image.png';

const DropzoneComponent = ({
  isLoading,
  onDrop,
  name,
  addExtraContent,
  multiple = false,
  accept = ['image/png', 'image/jpeg'],
  maxSize = 10 * 1024 ** 2, // 30MB
  maxFiles,
  className = 'bg-slate-100',
}) => (
  <Dropzone
    onDrop={onDrop}
    accept={accept}
    className={classNames('h-full w-full flex justify-center items-center', className)}
    loading={isLoading}
    name={name}
    multiple={multiple}
    maxSize={maxSize}
    maxFiles={maxFiles}
    styles={{ inner: { pointerEvents: 'all' } }}
  >
    <Dropzone.Idle>
      <div className="flex items-center justify-center mb-2">
        <Image src={image} alt="placeholder" height={50} width={50} />
      </div>
      {addExtraContent}
    </Dropzone.Idle>
  </Dropzone>
);

export default DropzoneComponent;
