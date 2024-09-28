import { Carousel, useAnimationOffsetEffect } from '@mantine/carousel';
import { BackgroundImage, Button, Center, Image, Skeleton, Spoiler, Text } from '@mantine/core';
import { useModals } from '@mantine/modals';
import classNames from 'classnames';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { useDisclosure } from '@mantine/hooks';
import toIndianCurrency from '../../../../utils/currencyFormat';
import modalConfig from '../../../../utils/modalConfig';
import { calculateTotalArea, calculateTotalMonths } from '../../../../utils';

const TRANSITION_DURATION = 200;
const updatedModalConfig = { ...modalConfig, size: 'xl' };

const SkeletonTopWrapper = () => (
  <div className="flex flex-row justify-between gap-2">
    <Skeleton height={200} mb="md" />
    <Skeleton height={200} />
  </div>
);

export const ProposalNameAndDescription = ({ name, description, className }) => (
  <div className={className}>
    <Text weight="bold" className="capitalize text-4xl truncate">
      {name}
    </Text>
    <div className="grid grid-cols-1 my-2">
      <Spoiler
        maxHeight={45}
        showLabel="Read more"
        hideLabel="Read less"
        className="text-purple-450 font-medium text-[14px]"
        classNames={{ content: 'text-slate-400 font-light text-[14px]' }}
      >
        <Text>
          {description ||
            `Our outdoor advertisement campaign is the perfect way to get your brand in front of a large audience. 
                        With eye-catching graphics and strategic placement, our billboards and digital displays will capture the attention of anyone passing by. 
                        Our team will work with you to create a curated campaign that perfectly showcases your brand's message and identity.
                         From busy city streets to suburban highways, our outdoor advertising options are the perfect way to increase your brand's visibility and reach.
                       Don't miss out on the opportunity to make a lasting impression with your target audience.`}
        </Text>
      </Spoiler>
    </div>
  </div>
);

const Details = ({ proposalData, isProposalDataLoading, inventoryData }) => {
  const modals = useModals();
  const [previewSpacesPhotos, setPreviewSpacesPhotos] = useState([]);
  const [embla, setEmbla] = useState(null);
  const [viewBreakdown, breakdownActions] = useDisclosure(true);
  useAnimationOffsetEffect(embla, TRANSITION_DURATION);

  const getAllSpacePhotos = useCallback(() => {
    const tempPics = [];
    const tempArr = inventoryData;
    tempArr?.docs?.map(item => {
      if (item?.spacePhoto) tempPics.push(item.spacePhoto);
      if (item?.longShot) tempPics.push(item.longShot);
      if (item?.closeShot) tempPics.push(item.closeShot);
      if (item?.otherPhotos) tempPics.push(...item.otherPhotos);
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
            height={400}
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
                  <Image src={item} height={400} width="100%" alt="preview" fit="contain" />
                </Carousel.Slide>
              ))}
          </Carousel>
        ),
      },
      ...updatedModalConfig,
    });

  useEffect(() => {
    const result = getAllSpacePhotos();
    setPreviewSpacesPhotos(result);
  }, [inventoryData]);

  const memoizedTotalDisplayCost = useMemo(
    () =>
      inventoryData?.docs.reduce((acc, place) => {
        if (
          proposalData?.displayColumns?.some(col => col === 'discountedDisplayPrice') &&
          place.pricingDetails.discountedDisplayCost > 0 &&
          place.pricingDetails.totalDisplayCost <= 0
        ) {
          return (
            acc +
            place.pricingDetails.discountedDisplayCost *
              calculateTotalMonths(place.startDate, place.endDate)
          );
        }

        if (proposalData?.displayColumns?.some(col => col === 'displayPrice')) {
          return acc + place.pricingDetails.totalDisplayCost;
        }

        return acc + 0;
      }, 0),
    [inventoryData],
  );

  const discountAmount = useMemo(
    () =>
      inventoryData?.docs.reduce(
        (
          acc,
          { pricingDetails: { discountedDisplayCost, totalDisplayCost, startDate, endDate } },
        ) => {
          if (
            proposalData?.displayColumns?.some(col => col === 'discountedDisplayPrice') &&
            totalDisplayCost > 0 &&
            discountedDisplayCost > 0
          ) {
            return (
              acc +
              (totalDisplayCost - discountedDisplayCost * calculateTotalMonths(startDate, endDate))
            );
          }

          return acc + 0;
        },
        0,
      ),
    [inventoryData],
  );

  const finalDisplayCost = useMemo(
    () => memoizedTotalDisplayCost - discountAmount,
    [memoizedTotalDisplayCost, discountAmount],
  );

  const totalPrintingCost = useMemo(
    () =>
      inventoryData?.docs.reduce((acc, place) => {
        const area = calculateTotalArea(
          { ...place, dimension: place.size },
          place.pricingDetails.unit,
        );
        return acc + place.pricingDetails.printingCostPerSqft * area;
      }, 0),
    [inventoryData],
  );

  const totalMountingCost = useMemo(
    () =>
      inventoryData?.docs.reduce((acc, place) => {
        const area = calculateTotalArea(
          { ...place, dimension: place.size },
          place.pricingDetails.unit,
        );
        return acc + place.pricingDetails.mountingCostPerSqft * area;
      }, 0),
    [inventoryData],
  );

  const totalOneTimeInstallationCost = useMemo(
    () =>
      inventoryData?.docs.reduce(
        (acc, { pricingDetails }) => acc + pricingDetails.oneTimeInstallationCost,
        0,
      ),
    [inventoryData],
  );

  const totalMonthlyAdditionalCost = useMemo(
    () =>
      inventoryData?.docs.reduce((acc, place) => {
        const totalMonths = calculateTotalMonths(place.startDate, place.endDate);
        return acc + place.pricingDetails.monthlyAdditionalCost * totalMonths;
      }, 0),
    [inventoryData],
  );

  const totalPrice = useMemo(
    () =>
      (proposalData?.displayColumns?.some(col => col === 'displayPrice') ? finalDisplayCost : 0) +
      (proposalData?.displayColumns?.some(col => col === 'printingCost') ? totalPrintingCost : 0) +
      (proposalData?.displayColumns?.some(col => col === 'mountingCost') ? totalMountingCost : 0) +
      (proposalData?.displayColumns?.some(col => col === 'installationCost')
        ? totalOneTimeInstallationCost
        : 0) +
      (proposalData?.displayColumns?.some(col => col === 'monthlyAdditionalCost')
        ? totalMonthlyAdditionalCost
        : 0),
    [
      finalDisplayCost,
      totalPrintingCost,
      totalMountingCost,
      totalOneTimeInstallationCost,
      totalMonthlyAdditionalCost,
    ],
  );

  return (
    <div>
      {isProposalDataLoading ? (
        <SkeletonTopWrapper />
      ) : (
        <div className="mt-2 flex flex-col gap-4">
          <ProposalNameAndDescription
            name={proposalData?.name}
            description={proposalData?.description}
            className="md:hidden"
          />
          <div
            className={classNames(
              'grid gap-3 auto-cols-min',
              previewSpacesPhotos?.length ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1',
            )}
          >
            <div className="flex flex-1 flex-col">
              <div className="flex flex-row flex-wrap justify-start">
                {previewSpacesPhotos?.map(
                  (src, index) =>
                    index < 4 && (
                      <Image
                        key={uuidv4()}
                        className={classNames(
                          'mb-4 border-[1px] border-gray bg-slate-100 cursor-zoom-in',
                          !index ? 'md:mr-2' : 'mr-2',
                        )}
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
            <div className="pt-0 h-fit">
              <ProposalNameAndDescription
                name={proposalData?.name}
                description={proposalData?.description}
                className="hidden md:block"
              />
              <div className="mb-3">
                {viewBreakdown ? (
                  <div>
                    {proposalData?.displayColumns?.some(col => col === 'displayPrice') ||
                    proposalData?.displayColumns?.some(col => col === 'displayPricePerSqft') ||
                    proposalData?.displayColumns?.some(col => col === 'discountedDisplayPrice') ? (
                      <div className="flex flex-col justify-end border border-gray-200 p-4 rounded-t-lg">
                        <div className="flex justify-between py-1">
                          <Text weight="400">Total Display Cost</Text>
                          <Text weight="bolder" className="text-lg">
                            {toIndianCurrency(memoizedTotalDisplayCost)}
                          </Text>{' '}
                        </div>
                        <div className="flex justify-between py-1">
                          <Text weight="400">Discount</Text>
                          <Text weight="bolder" className="text-lg" color="green">
                            -{toIndianCurrency(discountAmount)}
                          </Text>{' '}
                        </div>
                        <div className="flex justify-between py-1">
                          <Text weight="400">Final Display Cost</Text>
                          <Text weight="bolder" className="text-lg">
                            {toIndianCurrency(finalDisplayCost)}
                          </Text>{' '}
                        </div>
                      </div>
                    ) : null}
                    {proposalData?.displayColumns?.some(col => col === 'printingCost') ||
                    proposalData?.displayColumns?.some(col => col === 'mountingCost') ? (
                      <div
                        className={classNames(
                          'flex flex-col justify-end border border-gray-200 p-4',
                          proposalData?.displayColumns?.some(col => col === 'displayPrice')
                            ? 'border-t-0'
                            : '',
                        )}
                      >
                        {proposalData?.displayColumns?.some(col => col === 'printingCost') ? (
                          <div className="flex justify-between py-1">
                            <Text weight="400">Total Printing Cost</Text>
                            <Text weight="bolder" className="text-lg">
                              {toIndianCurrency(totalPrintingCost)}
                            </Text>{' '}
                          </div>
                        ) : null}
                        {proposalData?.displayColumns?.some(col => col === 'mountingCost') ? (
                          <div className="flex justify-between py-1">
                            <Text weight="400">Total Mounting Cost</Text>
                            <Text weight="bolder" className="text-lg">
                              {toIndianCurrency(totalMountingCost)}
                            </Text>{' '}
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {proposalData?.displayColumns?.some(col => col === 'installationCost') ||
                    proposalData?.displayColumns?.some(col => col === 'monthlyAdditionalCost') ? (
                      <div
                        className={classNames(
                          'flex flex-col justify-end border border-gray-200 p-4',
                          proposalData?.displayColumns?.some(col => col === 'printingCost') &&
                            proposalData?.displayColumns?.some(col => col === 'mountingCost')
                            ? 'border-t-0'
                            : '',
                        )}
                      >
                        {proposalData?.displayColumns?.some(col => col === 'installationCost') ? (
                          <div className="flex justify-between py-1">
                            <Text weight="400">Total One-time Installation Cost</Text>
                            <Text weight="bolder" className="text-lg">
                              {toIndianCurrency(totalOneTimeInstallationCost)}
                            </Text>{' '}
                          </div>
                        ) : null}
                        {proposalData?.displayColumns?.some(
                          col => col === 'monthlyAdditionalCost',
                        ) ? (
                          <div className="flex justify-between py-1">
                            <Text weight="400">Total Monthly Additional Cost</Text>
                            <Text weight="bolder" className="text-lg">
                              {toIndianCurrency(totalMonthlyAdditionalCost)}
                            </Text>{' '}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {proposalData?.displayColumns?.some(col => col === 'totalPrice') ? (
                  <div
                    className={classNames(
                      'flex justify-between border border-gray-200 p-4 rounded-b-lg bg-green-100',
                      !viewBreakdown
                        ? 'rounded-lg'
                        : proposalData?.displayColumns?.some(col => col === 'installationCost') &&
                          proposalData?.displayColumns?.some(col => col === 'monthlyAdditionalCost')
                        ? 'border-t-0'
                        : 'rounded-lg',
                    )}
                  >
                    <Text weight="400" className="font-semibold">
                      Total Price
                    </Text>
                    <Text weight="bolder" className="text-xl text-purple-450">
                      {totalPrice ? toIndianCurrency(totalPrice) : '-'}
                    </Text>{' '}
                  </div>
                ) : null}

                <div className="flex justify-between">
                  <div className="font-normal italic text-sm py-2">
                    **Prices are exclusive of GST
                  </div>
                  <Button
                    variant="default"
                    className="text-sm text-purple-450 shadow-none text-end float-right pr-0  border-none outline-none md:hidden"
                    onClick={breakdownActions.toggle}
                  >
                    {viewBreakdown ? 'Close Breakdown' : 'View Breakdown'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Details;
