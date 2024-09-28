import { useState, useEffect, useCallback } from 'react';
import { Text, Image, Skeleton, Badge, BackgroundImage, Center, Spoiler } from '@mantine/core';
import { v4 as uuidv4 } from 'uuid';
import { useModals } from '@mantine/modals';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { Carousel, useAnimationOffsetEffect } from '@mantine/carousel';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import layers from '../../../../assets/layers.svg';
import toIndianCurrency from '../../../../utils/currencyFormat';
import MapView from '../CreateSpace/MapView';
import {
  getEveryDayUnits,
  getOccupiedState,
  getOccupiedStateColor,
  tierList,
} from '../../../../utils';
import modalConfig from '../../../../utils/modalConfig';
import { DATE_FORMAT } from '../../../../utils/constants';
import InventoryPreviewImage from '../../../shared/InventoryPreviewImage';

dayjs.extend(isBetween);

const TRANSITION_DURATION = 200;
const updatedModalConfig = { ...modalConfig, size: 'lg' };

const SkeletonTopWrapper = () => (
  <div className="flex flex-col gap-2">
    <Skeleton height={300} width="100%" mb="md" />
    <div className="flex flex-row">
      <Skeleton height={96} width={112} mr="md" />
      <Skeleton height={96} width={112} mr="md" />
      <Skeleton height={96} width={122} mr="md" />
    </div>
  </div>
);

const BasicInfo = ({
  inventoryDetails,
  operationalCost,
  totalCompletedBooking,
  totalOccupancy,
  totalRevenue,
  isInventoryDetailsLoading,
  bookingRange,
}) => {
  const modals = useModals();
  const [previewSpacesPhotos, setPreviewSpacesPhotos] = useState([]);
  const [embla, setEmbla] = useState(null);

  useAnimationOffsetEffect(embla, TRANSITION_DURATION);

  const getAllSpacePhotos = useCallback(() => {
    const tempPics = [];

    if (inventoryDetails?.basicInformation?.spacePhoto)
      tempPics.push(inventoryDetails.basicInformation.spacePhoto);
    if (inventoryDetails?.basicInformation?.longShot)
      tempPics.push(inventoryDetails.basicInformation.longShot);
    if (inventoryDetails?.basicInformation?.closeShot)
      tempPics.push(inventoryDetails.basicInformation.closeShot);
    if (inventoryDetails?.basicInformation?.otherPhotos)
      tempPics.push(...inventoryDetails.basicInformation.otherPhotos);

    return tempPics;
  }, [inventoryDetails]);

  const renderBadges = useCallback(
    list =>
      list?.map((item, index) => (
        <p key={item?._id} className="pr-1 text-black">
          {item?.name}
          {list.length !== index + 1 && ','}
        </p>
      )),
    [inventoryDetails],
  );

  const renderColoredBadges = useCallback(
    list =>
      list?.map(
        (item, index) =>
          index < 10 && (
            <Badge
              key={item?._id}
              className="text-purple-450 bg-purple-100 capitalize"
              size="lg"
              variant="filled"
              radius="sm"
            >
              {item?.name}
            </Badge>
          ),
      ),
    [inventoryDetails],
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
    [inventoryDetails.specifications?.additionalTags],
  );

  const toggleImagePreviewModal = imgIndex =>
    modals.openContextModal('basic', {
      title: 'Preview',
      innerProps: {
        modalBody: (
          <Carousel
            align="center"
            className="px-3"
            loop
            mx="auto"
            slideGap="lg"
            controlsOffset="lg"
            initialSlide={imgIndex}
            nextControlIcon={<ChevronRight size={40} className="bg-white rounded-full" />}
            previousControlIcon={<ChevronLeft size={40} className="bg-white rounded-full" />}
            classNames={{ indicator: 'bg-white-200', control: 'border-none' }}
            getEmblaApi={setEmbla}
          >
            {previewSpacesPhotos?.length &&
              previewSpacesPhotos.map(item => (
                <Carousel.Slide>
                  <InventoryPreviewImage
                    imgSrc={item}
                    dimensions={inventoryDetails?.specifications?.size}
                    location={inventoryDetails?.location?.city}
                    inventoryName={inventoryDetails?.basicInformation?.spaceName}
                  />
                </Carousel.Slide>
              ))}
          </Carousel>
        ),
      },
      ...updatedModalConfig,
    });

  const res = getEveryDayUnits(bookingRange, inventoryDetails?.specifications?.unit);
  const occupiedState = getOccupiedState(
    res[dayjs().format(DATE_FORMAT)]?.remUnit ?? inventoryDetails?.specifications?.unit,
    inventoryDetails?.specifications?.unit,
  );

  useEffect(() => {
    const result = getAllSpacePhotos();
    setPreviewSpacesPhotos(result);
  }, [inventoryDetails]);

  return (
    <div className="grid grid-cols-2 gap-x-8 py-4">
      <div>
        {isInventoryDetailsLoading ? (
          <SkeletonTopWrapper />
        ) : (
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
                      className="mr-2 mb-4 border-[1px] bg-slate-100 cursor-zoom-in"
                      height={index === 0 ? 300 : 96}
                      width={index === 0 ? '100%' : 112}
                      src={src}
                      fit="cover"
                      alt="poster"
                      onClick={() => toggleImagePreviewModal(index)}
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
        )}

        <div className="grid grid-cols-2 grid-rows-2 mt-7 gap-4 mb-8">
          {!isInventoryDetailsLoading ? (
            <>
              <div className="flex items-center border pl-4 py-8">
                <div className="mr-4">
                  <Image src={layers} alt="poster" />
                </div>
                <div>
                  <Text size="sm" weight="300" color="gray">
                    Total Completed Bookings
                  </Text>
                  <Text weight="bold">{totalCompletedBooking ?? 0}</Text>
                </div>
              </div>
              <div className="flex items-center border pl-4">
                <div className="mr-4">
                  <Image src={layers} alt="poster" />
                </div>
                <div>
                  <Text size="sm" weight="300" color="gray">
                    Total Operational Cost
                  </Text>
                  <Text weight="bold">{toIndianCurrency(operationalCost ?? 0)}</Text>
                </div>
              </div>
              <div className="flex items-center border pl-4">
                <div className="mr-4">
                  <Image src={layers} alt="poster" />
                </div>
                <div>
                  <Text size="sm" weight="300" color="gray">
                    Total Revenue
                  </Text>
                  <Text weight="bold">{toIndianCurrency(totalRevenue ?? 0)}</Text>
                </div>
              </div>
              <div className="flex items-center border pl-4">
                <div className="mr-4">
                  <Image src={layers} alt="poster" />
                </div>
                <div>
                  <Text size="sm" weight="300" color="gray">
                    Total Occupancy Days This Year
                  </Text>
                  <Text weight="bold">{totalOccupancy ?? 0}</Text>
                </div>
              </div>
            </>
          ) : (
            <>
              <Skeleton className="flex items-center border pl-4" height={112} />
              <Skeleton className="flex items-center border pl-4" height={112} />
              <Skeleton className="flex items-center border pl-4" height={112} />
              <Skeleton className="flex items-center border pl-4" height={112} />
            </>
          )}
        </div>
      </div>
      <div>
        {!isInventoryDetailsLoading ? (
          <Text size="lg" weight="bolder">
            {inventoryDetails?.basicInformation?.spaceName}
          </Text>
        ) : (
          <Skeleton className="flex mb-4" height={30} />
        )}
        <div>
          {!isInventoryDetailsLoading ? (
            <>
              <div className="flex gap-2">
                <Text weight="bolder" size="xs" className="text-purple-450">
                  {inventoryDetails?.basicInformation?.category?.name}
                </Text>
                <Text weight="bolder" size="xs">
                  {inventoryDetails?.basicInformation?.spaceType?.name}
                </Text>
              </div>
              <Spoiler
                maxHeight={45}
                showLabel="Read more"
                hideLabel="Read less"
                className="text-purple-450 font-medium text-[14px]"
                classNames={{ content: 'text-slate-400 font-light text-[14px]' }}
              >
                {inventoryDetails?.basicInformation?.description}
              </Spoiler>
              <Badge
                className="capitalize"
                variant="filled"
                color={getOccupiedStateColor(inventoryDetails?.isUnderMaintenance, occupiedState)}
              >
                {inventoryDetails?.isUnderMaintenance ? 'Under Maintenance' : occupiedState}
              </Badge>
              <Text weight="bold" className="my-2">
                {toIndianCurrency(inventoryDetails?.basicInformation?.price || 0)}
              </Text>
              <div className="flex gap-2 flex-wrap mb-2">
                {inventoryDetails?.basicInformation?.audience?.length
                  ? renderColoredBadges(inventoryDetails?.basicInformation?.audience)
                  : null}
              </div>
              <div className="mb-2">
                <p className="text-slate-400">Advertising brands</p>
                <div className="flex w-full flex-wrap">
                  {inventoryDetails?.specifications?.previousBrands?.length
                    ? renderBadges(inventoryDetails?.specifications?.previousBrands)
                    : 'None'}
                </div>
              </div>
              <div className="mb-2">
                <p className="text-slate-400">Advertising tags</p>
                <div className="flex w-full flex-wrap">
                  {inventoryDetails?.specifications?.tags?.length
                    ? renderBadges(inventoryDetails?.specifications.tags)
                    : 'None'}
                </div>
              </div>
              <div className="mb-2">
                <p className="text-slate-400">Demographics</p>
                <div className="flex w-full flex-wrap">
                  {inventoryDetails?.basicInformation?.demographic?.name || 'NA'}
                </div>
              </div>
              <div className="flex flex-col mb-2">
                <p className="text-slate-400 mb-1">Additional Tags</p>
                <div className="flex gap-x-2">
                  {inventoryDetails.specifications?.additionalTags?.length
                    ? renderAdditionalTagsBadges(inventoryDetails.specifications.additionalTags)
                    : '-'}
                </div>
              </div>
            </>
          ) : (
            <Skeleton className="flex gap-2 mb-4" height={155} />
          )}
          <div>
            {!isInventoryDetailsLoading ? (
              <>
                <Text>Specifications</Text>
                <Text color="gray" className="mb-2">
                  All the related details regarding campaign
                </Text>
              </>
            ) : (
              <Skeleton className="mb-4" height={30} />
            )}
            <div className="flex flex-col">
              {!isInventoryDetailsLoading ? (
                <div className="grid grid-cols-2 p-4 border rounded-md mb-4 flex-1">
                  <div>
                    <Text color="gray" size="xs" weight="300">
                      Size (WxH)
                    </Text>
                    <div className="mb-4 flex gap-x-2 pr-2">
                      {inventoryDetails?.specifications?.size.length ? (
                        <p>
                          {inventoryDetails.specifications.size
                            .map(item => `${item?.width || 0}ft x ${item?.height || 0}ft`)
                            .filter(item => item !== null)
                            .join(', ')}
                        </p>
                      ) : (
                        '-'
                      )}
                    </div>
                    <Text color="gray" size="xs" weight="300">
                      Resolution
                    </Text>
                    <Text className="mb-4">
                      {inventoryDetails?.specifications?.resolutions || 'NA'}
                    </Text>
                    <Text color="gray" size="xs" weight="300">
                      Facing
                    </Text>
                    <Text>{inventoryDetails?.location?.facing?.name || 'NA'}</Text>{' '}
                  </div>
                  <div>
                    <Text color="gray" size="xs" weight="300">
                      Unit
                    </Text>
                    <Text className="mb-4">{inventoryDetails?.specifications?.unit}</Text>
                    <Text color="gray" size="xs" weight="300">
                      Media Type
                    </Text>
                    <Text className="mb-4">
                      {inventoryDetails?.basicInformation?.mediaType?.name || 'NA'}
                    </Text>
                    <Text color="gray" size="xs" weight="300">
                      Illumination
                    </Text>
                    <Text>{inventoryDetails?.specifications?.illuminations?.name || 'NA'}</Text>
                  </div>
                </div>
              ) : (
                <Skeleton className="grid grid-cols-2 p-4 mb-4" height={196} />
              )}
            </div>
          </div>
        </div>
      </div>
      {!isInventoryDetailsLoading ? (
        <div className="flex gap-2 p-4 border rounded-md flex-1 col-span-2">
          <div className="flex-1 ">
            <Text color="gray" size="xs" weight="300">
              Address
            </Text>
            <Text className="mb-4">{inventoryDetails?.location?.address || 'NA '}</Text>
            <div className="grid grid-cols-2">
              <div>
                <Text color="gray" size="xs" weight="300">
                  City
                </Text>
                <Text className="mb-4">{inventoryDetails?.location?.city || 'NA'}</Text>
              </div>
              <div>
                <Text color="gray" size="xs" weight="300">
                  State
                </Text>
                <Text className="mb-4">{inventoryDetails?.location?.state || 'NA'}</Text>
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div>
                <Text color="gray" size="xs" weight="300">
                  Pin Code
                </Text>
                <Text className="mb-4">{inventoryDetails?.location?.zip || 'NA'}</Text>
              </div>
              <div>
                <Text color="gray" size="xs" weight="300">
                  Tier
                </Text>
                <Text className="mb-4">
                  {tierList.map(item =>
                    item.value === inventoryDetails?.location?.tier ? item.label : null,
                  ) || 'NA'}
                </Text>
              </div>
            </div>
            <div className="grid grid-cols-1">
              <div>
                <p className="text-lg text-slate-400 font-light">Facia towards</p>
                <p className="mb-4">{inventoryDetails?.location?.faciaTowards || 'NA'}</p>
              </div>
            </div>
          </div>
          <MapView
            latitude={
              inventoryDetails?.location.latitude &&
              !Number.isNaN(inventoryDetails.location.latitude)
                ? Number(inventoryDetails.location.latitude)
                : 0
            }
            longitude={
              inventoryDetails?.location.longitude &&
              !Number.isNaN(inventoryDetails.location.longitude)
                ? Number(inventoryDetails?.location.longitude)
                : 0
            }
          />
        </div>
      ) : (
        <Skeleton className="flex gap-2 p-4" height={292} />
      )}
    </div>
  );
};

export default BasicInfo;
