import { useState, useEffect, useCallback } from 'react';
import { Badge, Image, Text, BackgroundImage, Center, Spoiler } from '@mantine/core';
import { v4 as uuidv4 } from 'uuid';
import toIndianCurrency from '../../utils/currencyFormat';
import { useFormContext } from '../../context/formContext';

const Preview = () => {
  const { values } = useFormContext();
  const [previewSpacesPhotos, setPreviewSpacesPhotos] = useState([]);

  const getAllSpacePhotos = useCallback(() => {
    const tempPics = [];

    if (values?.basicInformation?.spacePhoto) tempPics.push(values.basicInformation.spacePhoto);
    if (values?.basicInformation?.longShot) tempPics.push(values.basicInformation.longShot);
    if (values?.basicInformation?.closeShot) tempPics.push(values.basicInformation.closeShot);
    if (values?.basicInformation?.otherPhotos)
      tempPics.push(...values.basicInformation.otherPhotos);

    return tempPics;
  }, [values]);

  const renderBadges = useCallback(
    list =>
      list?.map((item, index) => (
        <p key={uuidv4()} className="pr-1 text-black">
          {item?.label}
          {list.length !== index + 1 && ','}
        </p>
      )),
    [values?.specifications?.previousBrands, values?.specifications?.tags],
  );

  const renderColoredBadges = useCallback(
    list =>
      list?.map(
        (item, index) =>
          index < 10 && (
            <Badge
              key={item?.value}
              className="text-purple-450 bg-purple-100 capitalize"
              size="lg"
              variant="filled"
              radius="sm"
            >
              {item?.label}
            </Badge>
          ),
      ),
    [values?.basicInformation?.audience],
  );

  const renderAdditionalTagsBadges = useCallback(
    list =>
      list?.map(
        (item, index) =>
          index < 10 && (
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
      ),
    [values.specifications.additionalTags],
  );

  useEffect(() => {
    const result = getAllSpacePhotos();
    setPreviewSpacesPhotos(result);
  }, [values]);

  return (
    <div className="grid grid-cols-2 gap-8 pl-5 pt-4">
      <div className="flex flex-1 flex-col w-full">
        {!previewSpacesPhotos?.length ? (
          <Image
            height={300}
            width="100%"
            alt="no_image_placeholder"
            withPlaceholder
            placeholder={<Text align="center">No Image Uploaded</Text>}
          />
        ) : null}
        <div className="flex flex-row flex-wrap justify-start">
          {previewSpacesPhotos?.map(
            (src, index) =>
              index < 4 && (
                <Image
                  key={uuidv4()}
                  className="mr-2 mb-4 border-[1px] bg-slate-100"
                  height={index === 0 ? 300 : 96}
                  width={index === 0 ? '100%' : 112}
                  src={src}
                  fit="cover"
                  alt="poster"
                />
              ),
          )}
          {previewSpacesPhotos?.length > 4 && (
            <div className="border-[1px] border-gray mr-2 mb-4">
              <BackgroundImage src={previewSpacesPhotos[4]} className="w-[112px] h-[96px]">
                <Center className="h-full transparent-black">
                  <Text weight="bold" color="white">
                    +{previewSpacesPhotos.length - 4} more
                  </Text>
                </Center>
              </BackgroundImage>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex-1 pr-7 max-w-1/2">
          <p className="text-lg font-bold">{values?.basicInformation?.spaceName || 'NA'}</p>
          <div>
            <div className="flex gap-2">
              <p className="font-bold text-xs text-purple-450">
                {values?.basicInformation?.category?.label}
              </p>
              <Text weight="bolder" size="xs">
                {values?.basicInformation?.spaceType?.label}
              </Text>
            </div>
            <Spoiler
              maxHeight={45}
              showLabel="Read more"
              hideLabel="Read less"
              className="text-purple-450 font-medium text-[14px]"
              classNames={{ content: 'text-slate-400 font-light text-[14px]' }}
            >
              {values?.basicInformation?.description}
            </Spoiler>
            <div className="flex gap-3 items-center">
              <p className="font-bold my-2">
                {values?.basicInformation?.price
                  ? toIndianCurrency(parseInt(values.basicInformation.price, 10))
                  : 0}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap mb-2">
              {values?.basicInformation?.audience?.length
                ? renderColoredBadges(values?.basicInformation?.audience)
                : null}
            </div>
            <div className="mb-2">
              <p className="text-slate-400">Advertising brands</p>
              <div className="flex w-full flex-wrap">
                {values?.specifications?.previousBrands?.length
                  ? renderBadges(values?.specifications?.previousBrands)
                  : 'None'}
              </div>
            </div>
            <div className="mb-2">
              <p className="text-slate-400">Advertising tags</p>
              <div className="flex w-full flex-wrap">
                {values?.specifications?.tags?.length
                  ? renderBadges(values?.specifications?.tags)
                  : 'None'}
              </div>
            </div>
            <div className="mb-2">
              <p className="text-slate-400">Demographics</p>
              <div className="flex w-full flex-wrap">
                {values?.basicInformation?.demographic?.label || 'NA'}
              </div>
            </div>
            <div className="flex flex-col mb-2">
              <p className="text-slate-400 mb-1">Additional Tags</p>
              <div className="flex gap-x-2">
                {values?.specifications?.additionalTags?.length
                  ? renderAdditionalTagsBadges(values.specifications.additionalTags)
                  : '-'}
              </div>
            </div>
            <div className="mt-3">
              <p className="mb-1">Specifications</p>
              <p className="text-slate-400 mb-2">All the related details regarding campaign</p>
              <div className="flex flex-col ">
                <div className="grid grid-cols-2 p-4 border rounded-md mb-4 flex-1">
                  <div>
                    <p className="text-slate-400 text-md font-light">Media Type</p>
                    <p className="mb-4">{values?.basicInformation?.mediaType?.label}</p>

                    <p className="text-slate-400 text-md font-light">Size (WxH)</p>
                    <div className="mb-4 flex gap-x-2">
                      {values?.specifications?.size.length ? (
                        <p className="max-w-[300px]">
                          {values.specifications.size
                            .map(item => `${item?.width || 0}ft x ${item?.height || 0}ft`)
                            .filter(item => item !== null)
                            .join(', ')}
                        </p>
                      ) : (
                        '-'
                      )}
                    </div>
                    <p className="text-slate-400 text-md font-light">Resolution</p>
                    <p>{values?.specifications?.resolutions || 'NA'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-md font-light">Illumination</p>
                    <p className="mb-4">{values?.specifications?.illuminations?.label}</p>
                    <p className="text-slate-400 text-md font-light">Unit</p>
                    <p className="mb-4">{values?.specifications?.unit}</p>
                    <p className="text-slate-400 text-md font-light">Facing</p>
                    <p>{values?.location?.facing?.label || 'NA'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
