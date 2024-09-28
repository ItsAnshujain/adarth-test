import React, { useEffect, useMemo, useState } from 'react';
import { AspectRatio, Image, SimpleGrid, Text } from '@mantine/core';
import { Dropzone as MantineDropzone } from '@mantine/dropzone';
import { isString } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

const Dropzone = ({ multiple = false, value, onChange, error, imgUrl, ...props }) => {
  const [files, setFiles] = useState([]);

  const preview = useMemo(() => {
    if (files.length <= 0) return null;

    if (multiple)
      return (
        <SimpleGrid cols={3} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
          {files.map(file => {
            const imageUrl = URL.createObjectURL(file);
            return (
              <Image
                key={uuidv4().toString()}
                src={imageUrl}
                alt="preview"
                imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
              />
            );
          })}
        </SimpleGrid>
      );

    if (isString(files[0])) {
      const imageUrl = files[0];

      return <Image src={imageUrl} alt="preview" />;
    }
    const imageUrl = URL.createObjectURL(files[0]);

    return (
      <Image
        src={imageUrl}
        alt="preview"
        imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
      />
    );
  }, [files]);

  const handleFileDrop = droppedFiles => {
    setFiles(droppedFiles);

    if (multiple === true) onChange?.(droppedFiles);
    else onChange?.(droppedFiles[0]);
  };

  useEffect(() => {
    setFiles(() => {
      if (!value) return [];

      if (Array.isArray(value)) return value;

      return [value];
    });
  }, [value]);

  return (
    <MantineDropzone
      onDrop={handleFileDrop}
      className="min-h-[120px] min-w-[120px]"
      maxSize={5 * 1024 ** 2} // 5 MB
      multiple={false}
      {...props}
      //   accept="image/png,image/jpeg"
      //   resetRef={ref}
    >
      <AspectRatio ratio={1024 / 1024} sx={{ maxWidth: 180 }} mx="auto">
        <div>
          {files.length > 0 ? (
            preview || imgUrl
          ) : (
            <Image src={null} alt="placeholder" withPlaceholder />
          )}
          <Text className="text-red-450">{error}</Text>
        </div>
      </AspectRatio>
    </MantineDropzone>
  );
};

export default Dropzone;
