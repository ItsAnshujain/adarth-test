import { Carousel, useAnimationOffsetEffect } from '@mantine/carousel';
import {
  BackgroundImage,
  Center,
  Group,
  Image,
  Skeleton,
  Spoiler,
  Text,
  ActionIcon,
} from '@mantine/core';
import { useModals } from '@mantine/modals';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Book, ChevronLeft, ChevronRight, Key } from 'react-feather';
import { Link } from 'react-router-dom';
import { IconEye } from '@tabler/icons';
import { useDisclosure } from '@mantine/hooks';
import toIndianCurrency from '../../../../utils/currencyFormat';
import modalConfig from '../../../../utils/modalConfig';
import PriceBreakdownDrawer from '../../bookings/ViewOrders/PriceBreakdownDrawer';
import InventoryPreviewImage from '../../../shared/InventoryPreviewImage';

const DATE_FORMAT = 'DD MMM YYYY';
const TRANSITION_DURATION = 200;
const updatedModalConfig = { ...modalConfig, size: 'lg' };

const SkeletonTopWrapper = () => (
  <div className="flex flex-row justify-between gap-2">
    <Skeleton height={200} mb="md" />
    <Skeleton height={200} />
  </div>
);

const Details = ({ proposalData, isProposalDataLoading, inventoryData, proposalId }) => {
  const modals = useModals();
  const [previewSpacesPhotos, setPreviewSpacesPhotos] = useState([]);
  const [embla, setEmbla] = useState(null);
  const [drawerOpened, drawerActions] = useDisclosure();

  useAnimationOffsetEffect(embla, TRANSITION_DURATION);

  const getAllSpacePhotos = useCallback(() => {
    const tempPics = [];
    const tempArr = inventoryData;
    tempArr?.docs?.map(item => {
      if (item?.spacePhoto)
        tempPics.push({
          imgSrc: item?.spacePhoto,
          location: item?.city,
          dimension: item?.size,
          inventoryName: item?.spaceName,
        });

      if (item?.longShot)
        tempPics.push({
          imgSrc: item.longShot,
          location: item?.city,
          dimension: item?.size,
          inventoryName: item?.spaceName,
        });

      if (item?.closeShot)
        tempPics.push({
          imgSrc: item.closeShot,
          location: item?.city,
          dimension: item?.size,
          inventoryName: item?.spaceName,
        });

      if (item?.otherPhotos?.length > 0)
        item?.otherPhotos?.map(otherPhoto =>
          tempPics.push({
            imgSrc: otherPhoto,
            location: item?.city,
            dimension: item?.size,
            inventoryName: item?.spaceName,
          }),
        );

      return tempPics;
    });

    return tempPics;
  }, [inventoryData]);

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
            withControls={previewSpacesPhotos?.length > 0}
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
                <Carousel.Slide key={uuidv4()}>
                  <InventoryPreviewImage
                    imgSrc={item?.imgSrc}
                    dimensions={item?.dimension}
                    location={item?.location}
                    inventoryName={item?.inventoryName}
                  />{' '}
                </Carousel.Slide>
              ))}
          </Carousel>
        ),
      },
      ...updatedModalConfig,
    });

  const renderSpacesByCategories = useMemo(
    () =>
      proposalData?.categoryName?.length
        ? proposalData.categoryName?.map((item, index) => (
            <div key={uuidv4()} className="flex">
              <div className="flex flex-row">
                <Text weight="bolder">{item?.total}</Text>
                <Text weight="bolder" className="mx-2">
                  {item?._id} {index + 1 !== proposalData?.categoryName?.length ? ',' : ''}
                </Text>
              </div>
            </div>
          ))
        : 0,
    [proposalData],
  );

  useEffect(() => {
    const result = getAllSpacePhotos();
    setPreviewSpacesPhotos(result);
  }, [inventoryData]);

  const memoizedInventoryData = useMemo(
    () => inventoryData?.docs?.map(doc => ({ ...doc, ...doc.pricingDetails, dimension: doc.size })),
    [inventoryData?.docs],
  );
  return (
    <div className="mt-4">
      <Group position="apart">
        <Text size="xl" weight="bold">
          Proposal Details
        </Text>

        {!proposalData?.bookingId && !proposalData?.parentProposalId ? (
          <Link
            to={`/bookings/create-order?proposalId=${proposalId}&proposalLimit=${proposalData?.totalSpaces}`}
            className="bg-gray-450 px-2 py-1 rounded-md shadow-sm flex items-center"
          >
            <Key className="h-4" />
            <p className="text-sm font-medium">Convert to Booking</p>
          </Link>
        ) : !proposalData?.parentProposalId ? (
          <Link
            to={`/bookings/view-details/${proposalData?.bookingId}`}
            className="bg-gray-450 px-2 py-1 rounded-md shadow-sm flex items-center"
          >
            <Book className="h-4" />
            <p className="text-sm font-medium">Booking Link</p>
          </Link>
        ) : null}
      </Group>
      {isProposalDataLoading ? (
        <SkeletonTopWrapper />
      ) : (
        <div className="mt-2 flex flex-col gap-4">
          <div
            className={classNames(
              'grid gap-3 auto-cols-min',
              previewSpacesPhotos?.length ? 'grid-cols-2' : 'grid-cols-1',
            )}
          >
            <div className="flex flex-1 flex-col">
              <div className="flex flex-row flex-wrap justify-start">
                {previewSpacesPhotos?.map(
                  (item, index) =>
                    index < 4 && (
                      <Image
                        key={uuidv4()}
                        className="mr-2 mb-4 border-[1px] border-gray bg-slate-100 cursor-zoom-in"
                        height={index === 0 ? 300 : 96}
                        width={index === 0 ? '100%' : 112}
                        src={item?.imgSrc}
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
                          +{Number(previewSpacesPhotos?.length) - 4} more
                        </Text>
                      </Center>
                    </BackgroundImage>
                  </div>
                )}
              </div>
            </div>
            <div className="border p-5 h-fit">
              <Text weight="bold" className="capitalize">
                {proposalData?.name}
              </Text>
              <div className="grid grid-cols-1 mb-2">
                <Text color="grey" weight="400">
                  Description
                </Text>
                <Spoiler
                  maxHeight={45}
                  showLabel="Read more"
                  hideLabel="Read less"
                  className="text-purple-450 font-medium text-[14px]"
                  classNames={{ content: 'text-slate-400 font-light text-[14px]' }}
                >
                  <Text>
                    {proposalData?.description
                      ? proposalData.description
                      : `Our outdoor advertisement campaign is the perfect way to get your brand in front of a large audience. 
                        With eye-catching graphics and strategic placement, our billboards and digital displays will capture the attention of anyone passing by. 
                        Our team will work with you to create a curated campaign that perfectly showcases your brand's message and identity.
                         From busy city streets to suburban highways, our outdoor advertising options are the perfect way to increase your brand's visibility and reach.
                       Don't miss out on the opportunity to make a lasting impression with your target audience.`}
                  </Text>
                </Spoiler>
              </div>
              <div className="grid grid-cols-2 mb-3">
                <div className="col-span-1">
                  <Text color="grey" weight="400">
                    Total Spaces
                  </Text>
                  <div className="flex flex-wrap">{renderSpacesByCategories}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 mb-3">
                <div className="col-span-1">
                  <Text color="grey" weight="400">
                    Price
                  </Text>
                  <div className="flex items-center">
                    <Text weight="bolder">
                      {proposalData?.price ? toIndianCurrency(proposalData.price) : 0}
                    </Text>
                    <ActionIcon onClick={drawerActions.open}>
                      <IconEye color="black" size={20} />
                    </ActionIcon>
                  </div>
                </div>
                <div>
                  <Text color="grey" weight="400">
                    Total Cities
                  </Text>
                  <Text weight="bolder">{proposalData?.totalCities || 0}</Text>
                </div>
              </div>
              <div className="grid grid-cols-2 mb-3">
                <div>
                  <Text color="grey" weight="400">
                    Overall Start Date
                  </Text>
                  <Text weight="bolder">
                    {proposalData?.startDate
                      ? dayjs(proposalData.startDate).format(DATE_FORMAT)
                      : 'NA'}
                  </Text>
                </div>
                <div>
                  <Text color="grey" weight="400">
                    Overall End Date
                  </Text>
                  <Text weight="bolder">
                    {proposalData?.endDate ? dayjs(proposalData.endDate).format(DATE_FORMAT) : 'NA'}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <PriceBreakdownDrawer
        isOpened={drawerOpened}
        onClose={drawerActions.close}
        type="proposal"
        spaces={memoizedInventoryData}
      />
    </div>
  );
};

export default Details;
