import React, { useMemo, useEffect, useState, useCallback } from 'react';
import GoogleMapReact from 'google-map-react';
import { BackgroundImage, Center, Image, Pagination, Skeleton, Spoiler, Text } from '@mantine/core';
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { Carousel, useAnimationOffsetEffect } from '@mantine/carousel';
import { useModals } from '@mantine/modals';
import toIndianCurrency from '../../../../utils/currencyFormat';
import MarkerIcon from '../../../../assets/pin.svg';
import { GOOGLE_MAPS_API_KEY } from '../../../../utils/config';
import Places from './Places';
import modalConfig from '../../../../utils/modalConfig';
import { indianMapCoordinates } from '../../../../utils';
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

const Overview = ({ campaignData = {}, spacesData = {}, isCampaignDataLoading }) => {
  const modals = useModals();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mapInstance, setMapInstance] = useState(null);
  const [updatedPlace, setUpdatedPlace] = useState();
  const [previewSpacesPhotos, setPreviewSpacesPhotos] = useState([]);
  const [embla, setEmbla] = useState(null);

  useAnimationOffsetEffect(embla, TRANSITION_DURATION);

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
                    imgSrc={item?.imgSrc}
                    dimensions={item?.dimension}
                    location={item?.location}
                    inventoryName={item?.inventoryName}
                  />
                </Carousel.Slide>
              ))}
          </Carousel>
        ),
      },
      ...updatedModalConfig,
    });

  const getTotalPrice = useMemo(() => {
    const totalPrice = spacesData?.docs?.reduce(
      (acc, item) => acc + +(item?.basicInformation?.price || 0),
      0,
    );
    return totalPrice;
  }, [spacesData]);

  const getAllSpacePhotos = useCallback(() => {
    const tempPics = [];
    const tempArr = spacesData;
    tempArr?.docs?.map(item => {
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
  }, [spacesData]);

  const handlePagination = currentPage => {
    searchParams.set('page', currentPage);
    setSearchParams(searchParams);
  };

  const updatePriceAndDates = useCallback(() => {
    const tempArr = spacesData?.docs?.map(item => {
      const matchedPlace = campaignData?.place?.find(item1 => item._id === item1.id);
      return { ...item, ...matchedPlace };
    });
    setUpdatedPlace(tempArr);
  }, [campaignData, spacesData]);

  useEffect(() => {
    if (mapInstance && spacesData?.docs?.length) {
      const bounds = new mapInstance.maps.LatLngBounds();

      // default coordinates
      bounds.extend({
        lat: indianMapCoordinates.latitude,
        lng: indianMapCoordinates.longitude,
      });

      mapInstance.map.fitBounds(bounds);
      mapInstance.map.setCenter(bounds.getCenter());
      mapInstance.map.setZoom(Math.min(5, mapInstance.map.getZoom()));
    }
  }, [spacesData?.docs?.length, mapInstance]);

  useEffect(() => {
    updatePriceAndDates();
  }, [campaignData, spacesData]);

  useEffect(() => {
    const result = getAllSpacePhotos();
    setPreviewSpacesPhotos(result);
  }, [spacesData]);

  return (
    <div className="grid grid-cols-2 gap-x-8 pt-4">
      <div className="flex flex-col">
        {isCampaignDataLoading ? (
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
                (item, index) =>
                  index < 4 && (
                    <Image
                      key={uuidv4()}
                      height={index === 0 ? 300 : 96}
                      width={index === 0 ? '100%' : 112}
                      src={item?.imgSrc}
                      fit="cover"
                      alt="poster"
                      className="mr-2 mb-4 border-[1px] border-gray bg-slate-100 cursor-zoom-in"
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
      </div>

      {!isCampaignDataLoading ? (
        <div className="flex-1 pr-7 max-w-1/2">
          <p className="text-lg font-bold">{campaignData.name || 'NA'}</p>
          <div>
            <Spoiler
              maxHeight={45}
              showLabel="Read more"
              hideLabel="Read less"
              className="text-purple-450 font-medium text-[14px]"
              classNames={{ content: 'text-slate-400 font-light text-[14px]' }}
            >
              {campaignData?.description}
            </Spoiler>
            <div className="flex gap-3 items-center">
              <p className="font-bold my-2">{toIndianCurrency(+(getTotalPrice || 0))}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="col-span-2 my-5">
        <div className="pr-7">
          <Text size="lg" weight="bold">
            Location Details
          </Text>
          <Text size="sm" weight="lighter">
            All the places being covered in this campaign
          </Text>
        </div>
        <div className="mt-1 mb-8 h-[40vh]">
          <GoogleMapReact
            bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY, libraries: 'places' }}
            defaultCenter={defaultProps.center}
            defaultZoom={defaultProps.zoom}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => setMapInstance({ map, maps })}
          >
            {spacesData?.docs?.map(item => (
              <Marker key={item._id} lat={item.location?.latitude} lng={item.location?.longitude} />
            ))}
          </GoogleMapReact>
        </div>

        <div className="relative pb-10">
          <Text size="lg" weight="bolder">
            Places In The Campaign
          </Text>
          <Text text="sm" weight="lighter">
            All the places being covered in this campaign
          </Text>
          <div>
            {updatedPlace?.map(item => (
              <Places
                key={item._id}
                data={{
                  img: item?.basicInformation?.spacePhoto,
                  name: item?.basicInformation?.spaceName,
                  address: item.location?.address,
                  price: item?.basicInformation?.price,
                  dimensions: `${item?.specifications?.size?.width || 0}ft x ${
                    item?.specifications?.size?.height || 0
                  }ft`,
                  mediaType: item?.mediaType?.name,
                  resolution: item?.specifications?.resolutions,
                  illumination: item.illuminations?.name,
                  unit: item?.specifications?.unit,
                }}
              />
            ))}
            {!updatedPlace?.length ? (
              <div className="w-full min-h-[100px] flex justify-center items-center">
                <p className="text-xl">No records found</p>
              </div>
            ) : null}
          </div>
          {spacesData?.totalDocs > spacesData?.limit ? (
            <Pagination
              className="absolute bottom-0 right-10 gap-0"
              page={searchParams.get('page')}
              onChange={handlePagination}
              total={spacesData?.totalPages || 1}
              color="dark"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Overview;
