import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ActionIcon,
  BackgroundImage,
  Center,
  Group,
  Image,
  Pagination,
  Skeleton,
  Spoiler,
  Text,
} from '@mantine/core';
import GoogleMapReact from 'google-map-react';
import { useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import ReactPlayer from 'react-player';
import { useModals } from '@mantine/modals';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { Carousel, useAnimationOffsetEffect } from '@mantine/carousel';
import { IconEye } from '@tabler/icons';
import { useDisclosure } from '@mantine/hooks';
import Places from './Places';
import toIndianCurrency from '../../../../utils/currencyFormat';
import MarkerIcon from '../../../../assets/pin.svg';
import { GOOGLE_MAPS_API_KEY } from '../../../../utils/config';
import NoData from '../../../shared/NoData';
import modalConfig from '../../../../utils/modalConfig';
import { indianMapCoordinates } from '../../../../utils';
import PriceBreakdownDrawer from './PriceBreakdownDrawer';
import AddEditPriceDrawer from '../Create/AddEditPriceDrawer';
import InventoryPreviewImage from '../../../shared/InventoryPreviewImage';

const TRANSITION_DURATION = 200;
const updatedModalConfig = { ...modalConfig, size: 'lg' };

const defaultProps = {
  center: {
    lat: 28.70406,
    lng: 77.102493,
  },
  zoom: 10,
};

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

const Marker = () => <Image src={MarkerIcon} height={28} width={28} />;

const Overview = ({ bookingData = {}, isLoading }) => {
  const modals = useModals();
  const [drawerOpened, drawerActions] = useDisclosure();
  const [inventoryPriceDrawerOpened, inventoryPriceDrawerActions] = useDisclosure();
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [mapInstance, setMapInstance] = useState(null);
  const [previewSpacesPhotos, setPreviewSpacesPhotos] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams({
    page: 1,
    limit: 6,
  });

  const [embla, setEmbla] = useState(null);

  useAnimationOffsetEffect(embla, TRANSITION_DURATION);

  const getAllSpacePhotos = useCallback(() => {
    const tempPics = [];
    const tempArr = bookingData;
    tempArr?.campaign?.spaces?.map(item => {
      if (item?.basicInformation?.spacePhoto)
        tempPics.push({
          imgSrc: item?.basicInformation?.spacePhoto,
          location: item?.location?.city,
          dimension: item?.specifications?.size,
          inventoryName: item?.basicInformation?.spaceName,
        });
      if (item?.basicInformation?.otherPhotos?.length > 0)
        item?.basicInformation?.otherPhotos?.map(otherPhoto =>
          tempPics.push({
            imgSrc: otherPhoto,
            location: item?.location?.city,
            dimension: item?.specifications?.size,
            inventoryName: item?.basicInformation?.spaceName,
          }),
        );

      return tempPics;
    });

    return tempPics;
  }, [bookingData]);

  const calculateTotalCities = useMemo(() => {
    const initialCity = 0;
    if (bookingData?.campaign?.spaces?.length > 0) {
      const filteredNamesArr = bookingData?.campaign?.spaces.map(item => item?.location?.city);
      const uniqueNamesArr = Array.from(new Set(filteredNamesArr.map(item => item?.toLowerCase())));
      return uniqueNamesArr;
    }
    return initialCity;
  }, [bookingData?.campaign?.spaces]);

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
              previewSpacesPhotos.map(item =>
                item && !item?.imgSrc?.includes(['mp4']) ? (
                  <Carousel.Slide>
                    <InventoryPreviewImage
                      imgSrc={item?.imgSrc}
                      dimensions={item?.dimension}
                      location={item?.location}
                      inventoryName={item?.inventoryName}
                    />
                  </Carousel.Slide>
                ) : (
                  <Carousel.Slide>
                    <ReactPlayer url={`${item.imgSrc}#t=0.1`} width="100%" height="100%" />
                  </Carousel.Slide>
                ),
              )}
          </Carousel>
        ),
      },
      ...updatedModalConfig,
    });

  useEffect(() => {
    if (mapInstance && bookingData?.campaign?.spaces?.length) {
      const bounds = new mapInstance.maps.LatLngBounds();

      // default coordinates
      bounds.extend({
        lat: indianMapCoordinates?.latitude,
        lng: indianMapCoordinates?.longitude,
      });

      mapInstance.map.fitBounds(bounds);
      mapInstance.map.setCenter(bounds.getCenter());
      mapInstance.map.setZoom(Math.min(5, mapInstance.map.getZoom()));
    }
  }, [bookingData?.campaign?.spaces?.length, mapInstance]);

  useEffect(() => {
    const result = getAllSpacePhotos();
    setPreviewSpacesPhotos(result);
  }, [bookingData]);

  const memoizedInventoryData = useMemo(
    () =>
      bookingData?.campaign?.spaces.map(space => ({
        ...space,
        dimension: space.specifications.size,
        discount: space.discountPercentage,
      })),
    [bookingData?.campaign?.spaces],
  );

  return (
    <>
      <div className="flex gap-4 mt-5">
        <div className="flex-1 max-w-1/2">
          <div className="flex flex-col">
            {isLoading ? (
              <SkeletonTopWrapper />
            ) : (
              <div className="flex flex-1 flex-col w-full">
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
            )}
          </div>
        </div>
        <div className="flex-1 max-w-1/2 gap-2">
          <p className="font-bold text-2xl mb-2">
            {bookingData?.campaign?.name || <NoData type="na" />}
          </p>
          <Spoiler
            maxHeight={45}
            showLabel="Read more"
            hideLabel="Read less"
            className="text-purple-450 font-medium text-[14px]"
            classNames={{ content: 'text-slate-400 font-light text-[14px]' }}
          >
            {bookingData?.campaign?.description || 'NA'}
          </Spoiler>
          <div className="flex flex-col mt-4 w-[300px] border">
            <Group className="justify-between bg-gray-25 px-4 py-2">
              <div className="flex items-center gap-2">
                <p className="text-black font-semibold text-sm">Total Price</p>
                <ActionIcon onClick={drawerActions.open}>
                  <IconEye color="black" size={20} />
                </ActionIcon>
              </div>
              <p className="font-bold text-purple-450 text-lg">
                {toIndianCurrency(bookingData?.campaign?.totalPrice)}
              </p>
            </Group>
          </div>
          <div className="mt-8">
            <p>Specifications</p>
            <p className="text-slate-400 text-sm">All the details regarding the campaign</p>
            <div className="p-4 py-6 grid grid-cols-2 grid-rows-2 border rounded-md gap-y-4 mt-2">
              <div>
                <p className="text-slate-400 text-sm">Total Uploaded Artwork</p>
                <p>{bookingData?.campaign?.medias?.length ?? <NoData type="na" />}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Number of Locations</p>
                <p>{calculateTotalCities.length ?? <NoData type="na" />}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-4 mb-4 relative">
        <p className="text-lg font-bold">Location Details</p>
        <p className="text-sm font-light text-slate-400">
          All the places being covered in this campaign
        </p>
        <div className="mt-1 mb-4 h-[40vh]">
          <GoogleMapReact
            bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY, libraries: 'places' }}
            defaultCenter={defaultProps.center}
            defaultZoom={defaultProps.zoom}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => setMapInstance({ map, maps })}
          >
            {bookingData?.campaign?.spaces?.map(
              item =>
                Number(item?.location?.latitude) &&
                Number(item?.location?.longitude) && (
                  <Marker
                    key={item._id}
                    lat={item.location?.latitude && Number(item?.location?.latitude)}
                    lng={item.location?.longitude && Number(item?.location?.longitude)}
                  />
                ),
            )}
          </GoogleMapReact>
        </div>
        <p className="text-lg font-bold">Places in the campaign</p>
        <p className="text-sm font-light text-slate-400 mb-2">
          All the places being covered in this campaign
        </p>
        <div className="grid gap-4">
          {bookingData?.campaign?.spaces?.length ? (
            bookingData?.campaign?.spaces
              ?.map(item => (
                <Places
                  key={uuidv4()}
                  data={item}
                  campaignId={bookingData?.campaign?._id}
                  bookingId={bookingData?._id}
                  hasPaymentType={
                    (!!bookingData?.paymentStatus && !bookingData?.paymentStatus?.Unpaid) ||
                    (!!bookingData?.paymentStatus && bookingData?.paymentStatus?.Paid)
                  }
                  showInventoryPriceDrawer={inventoryPriceDrawerActions.open}
                  setSelectedInventoryId={setSelectedInventoryId}
                />
              ))
              .sort((a, b) => {
                if (a?.basicInformation?.spaceName && b?.basicInformation?.spaceName) {
                  return a.basicInformation.spaceName - b.basicInformation.spaceName;
                }

                return a?.basicInformation?.spaceName ? 1 : -1;
              })
          ) : (
            <div className="w-full min-h-[7rem] flex justify-center items-center">
              <p className="text-xl">No spaces found</p>
            </div>
          )}
        </div>
        {bookingData?.campaign?.spaces?.totalDocs > searchParams.get('limit') ? (
          <Pagination
            className="absolute bottom-0 right-10 gap-0"
            page={searchParams.get('page')}
            onChange={val => {
              searchParams.set('page', val);
              setSearchParams(searchParams);
            }}
            total={1}
            color="dark"
          />
        ) : null}
      </div>
      <PriceBreakdownDrawer
        isOpened={drawerOpened}
        onClose={drawerActions.close}
        type="booking"
        spaces={memoizedInventoryData}
      />
      <AddEditPriceDrawer
        isOpened={inventoryPriceDrawerOpened}
        onClose={inventoryPriceDrawerActions.close}
        selectedInventories={memoizedInventoryData}
        selectedInventoryId={selectedInventoryId}
        type="bookings"
        mode="view"
      />
    </>
  );
};

export default Overview;
