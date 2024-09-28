import { useSearchParams, useParams } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { ActionIcon, Image, Select, Text } from '@mantine/core';
import GoogleMapReact from 'google-map-react';
import { ChevronDown } from 'react-feather';
import { useDebouncedValue } from '@mantine/hooks';
import shallow from 'zustand/shallow';
import dayjs from 'dayjs';
import { IconX } from '@tabler/icons';
import { useProposalByVersionName } from '../apis/queries/proposal.queries';
import Table from '../components/Table/Table';
import {
  calculateTotalArea,
  calculateTotalMonths,
  generateSlNo,
  indianMapCoordinates,
} from '../utils';
import { GOOGLE_MAPS_API_KEY } from '../utils/config';
import MarkerIcon from '../assets/pin.svg';
import RowsPerPage from '../components/RowsPerPage';
import Search from '../components/Search';
import useLayoutView from '../store/layout.store';
import Details from '../components/modules/proposals/PublicLinkView/Details';
import Header from '../components/modules/proposals/PublicLinkView/Header';
import toIndianCurrency from '../utils/currencyFormat';
import { useFetchMasterById } from '../apis/queries/masters.queries';

const Marker = () => <Image src={MarkerIcon} height={28} width={28} />;

const defaultProps = {
  center: {
    lat: 28.70406,
    lng: 77.102493,
  },
  zoom: 10,
};

const PublicLinkPage = () => {
  const [mapInstance, setMapInstance] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 800);
  const [searchParams, setSearchParams] = useSearchParams({
    owner: 'all',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    category: '',
  });

  const { activeLayout, setActiveLayout } = useLayoutView(
    state => ({
      activeLayout: state.activeLayout,
      setActiveLayout: state.setActiveLayout,
    }),
    shallow,
  );

  const page = searchParams.get('page');
  const limit = searchParams.get('limit');

  const { proposal_version_name, client_company_name } = useParams();
  const { data: proposalData, isLoading: isProposalDataLoading } = useProposalByVersionName(
    `${proposal_version_name}?${searchParams.toString()}`,
  );

  const { data: subCategoryData, isSuccess: isSubCategoryLoaded } =
    useFetchMasterById('all-subcategory');

  const handlePagination = (key, val) => {
    if (val !== '') searchParams.set(key, val);
    else searchParams.delete(key);
    setSearchParams(searchParams, { replace: true });
  };

  const handleSortByColumn = colId => {
    if (searchParams.get('sortBy') === colId && searchParams.get('sortOrder') === 'desc') {
      searchParams.set('sortOrder', 'asc');
      setSearchParams(searchParams, { replace: true });
      return;
    }
    if (searchParams.get('sortBy') === colId && searchParams.get('sortOrder') === 'asc') {
      searchParams.set('sortOrder', 'desc');
      setSearchParams(searchParams, { replace: true });
      return;
    }

    searchParams.set('sortBy', colId);
    setSearchParams(searchParams, { replace: true });
  };

  const handleSearch = () => {
    searchParams.set('search', debouncedSearch);
    searchParams.set('page', debouncedSearch === '' ? page : 1);
    setSearchParams(searchParams, { replace: true });
  };

  useEffect(() => {
    handleSearch();
    if (debouncedSearch === '') {
      searchParams.delete('search');
      setSearchParams(searchParams, { replace: true });
    }
  }, [debouncedSearch]);

  const displayCost = place => {
    if (
      proposalData?.proposal?.displayColumns?.some(col => col === 'discountedDisplayPrice') &&
      place.pricingDetails.discountedDisplayCost > 0
    ) {
      return (
        place.pricingDetails.discountedDisplayCost *
        calculateTotalMonths(place.startDate, place.endDate)
      );
    }
    if (proposalData?.proposal?.displayColumns?.some(col => col === 'displayPrice')) {
      return place.pricingDetails.totalDisplayCost;
    }

    return 0;
  };

  const calculateTotalPrice = place => {
    const area = calculateTotalArea({ ...place, dimension: place.size }, place.pricingDetails.unit);
    const totalMonths = calculateTotalMonths(place.startDate, place.endDate);
    return (
      (displayCost(place) ? displayCost(place) : 0) +
        (proposalData?.proposal?.displayColumns?.some(col => col === 'printingCost')
          ? place.pricingDetails.printingCostPerSqft * area
          : 0) +
        (proposalData?.proposal?.displayColumns?.some(col => col === 'mountingCost')
          ? place.pricingDetails.mountingCostPerSqft * area
          : 0) +
        (proposalData?.proposal?.displayColumns?.some(col => col === 'installationCost')
          ? place.pricingDetails.oneTimeInstallationCost
          : 0) +
        (proposalData?.proposal?.displayColumns?.some(col => col === 'monthlyAdditionalCost')
          ? place.pricingDetails.monthlyAdditionalCost * totalMonths
          : 0) || 0
    );
  };
  const COLUMNS = useMemo(() => {
    const dataColumns = [
      {
        Header: '#',
        accessor: 'createdAt',
        show: proposalData?.proposal?.displayColumns?.some(col => col === 'serialNo'),
        Cell: info => useMemo(() => <p>{generateSlNo(info.row.index, page, limit)}</p>, []),
      },
      {
        Header: 'SPACE NAME & IMAGE',
        accessor: 'spaceName',
        show: true,
        Cell: ({
          row: {
            original: { _id, spaceName, spacePhoto },
          },
        }) =>
          useMemo(
            () => (
              <div className="flex gap-4 items-center">
                {spacePhoto ? (
                  <Image src={spacePhoto} alt="img" height={32} width={32} />
                ) : (
                  <Image src={null} withPlaceholder height={32} width={32} />
                )}
                <Text className="overflow-hidden text-ellipsis" lineClamp={1} title={spaceName}>
                  {spaceName}
                </Text>
              </div>
            ),
            [],
          ),
      },
      {
        Header: 'FACIA TOWARDS',
        accessor: 'faciaTowards',
        show: proposalData?.proposal?.displayColumns?.some(col => col === 'faciaTowards'),
        Cell: info => useMemo(() => <p>{info.row.original.faciaTowards || '-'}</p>, []),
      },
      {
        Header: 'MEDIUM',
        accessor: 'subCategory',
        show: true,
        Cell: ({
          row: {
            original: { subCategory },
          },
        }) => useMemo(() => <p>{subCategory || '-'}</p>),
      },
      {
        Header: 'CITY',
        accessor: 'location',
        show: true,
        Cell: ({
          row: {
            original: { location },
          },
        }) => useMemo(() => <p>{location || '-'}</p>),
      },
      {
        Header: 'STATE',
        accessor: 'state',
        show: proposalData?.proposal?.displayColumns?.some(col => col === 'state'),
        Cell: ({
          row: {
            original: { state },
          },
        }) => useMemo(() => <p>{state || '-'}</p>),
      },
      {
        Header: 'ILLUMINATION',
        accessor: 'illumination',
        show: proposalData?.proposal?.displayColumns?.some(col => col === 'illumination'),
        Cell: ({
          row: {
            original: { illumination },
          },
        }) => useMemo(() => <p>{illumination || '-'}</p>, []),
      },
      {
        Header: 'LOCATION',
        accessor: 'landmark',
        show: proposalData?.proposal?.displayColumns?.some(col => col === 'location'),
        Cell: ({
          row: {
            original: { landmark },
          },
        }) => useMemo(() => <p>{landmark || '-'}</p>, []),
      },
      {
        Header: 'UNITS',
        accessor: 'pricingDetails.unit',
        show: proposalData?.proposal?.displayColumns?.some(col => col === 'units'),
        Cell: ({
          row: {
            original: {
              pricingDetails: { unit },
            },
          },
        }) => useMemo(() => <p>{unit || '-'}</p>, []),
      },
      {
        Header: 'FACING',
        accessor: 'facing',
        show: proposalData?.proposal?.displayColumns?.some(col => col === 'facing'),
        Cell: ({
          row: {
            original: { facing },
          },
        }) => useMemo(() => <p>{facing || '-'}</p>, []),
      },
      {
        Header: 'W (IN FT.)',
        accessor: 'size.width',
        show: true,
        Cell: ({
          row: {
            original: { size },
          },
        }) =>
          useMemo(
            () => (
              <p className="flex flex-col">
                {size.map(ele => <div>{ele?.width}</div>).filter(ele => ele !== null) || '-'}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'H (IN FT.)',
        accessor: 'size.height',
        show: true,
        Cell: ({
          row: {
            original: { size },
          },
        }) =>
          useMemo(
            () => (
              <p>{size.map(ele => <div>{ele?.height}</div>).filter(ele => ele !== null) || '-'}</p>
            ),
            [],
          ),
      },
      {
        Header: 'AREA (IN SQ. FT.)',
        accessor: 'pricingDetails.totalArea',
        show: proposalData?.proposal?.displayColumns?.some(col => col === 'areaInSqFt'),
        Cell: ({ row: { original } }) =>
          useMemo(
            () => (
              <p>
                {calculateTotalArea(
                  { ...original, dimension: original.size },
                  original.pricingDetails.unit,
                )}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'DISPLAY COST / MONTH',
        accessor: 'pricingDetails.displayCostPerMonth',
        show: proposalData?.proposal?.displayColumns?.some(col => col === 'displayPrice'),
        Cell: ({
          row: {
            original: { pricingDetails },
          },
        }) =>
          useMemo(
            () => (
              <p>
                {pricingDetails.displayCostPerMonth
                  ? toIndianCurrency(pricingDetails.displayCostPerMonth)
                  : null}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'DISPLAY COST / SQ. FT',
        accessor: 'pricingDetails.displayCostPerSqFt',
        show: proposalData?.proposal?.displayColumns?.some(col => col === 'displayPricePerSqft'),
        Cell: ({
          row: {
            original: { pricingDetails },
          },
        }) =>
          useMemo(
            () => (
              <p>
                {pricingDetails.displayCostPerSqFt
                  ? toIndianCurrency(pricingDetails.displayCostPerSqFt)
                  : null}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'DISCOUNTED DISPLAY COST',
        accessor: 'pricingDetails.discountedDisplayCost',
        show: proposalData?.proposal?.displayColumns?.some(col => col === 'discountedDisplayPrice'),
        Cell: ({
          row: {
            original: { pricingDetails },
          },
        }) =>
          useMemo(
            () => (
              <p>
                {pricingDetails.discountedDisplayCost
                  ? toIndianCurrency(pricingDetails.discountedDisplayCost)
                  : null}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'PRINTING COST',
        accessor: 'pricingDetails.printingCostPerSqft',
        show: proposalData?.proposal?.displayColumns?.some(col => col === 'printingCost'),
        Cell: ({
          row: {
            original: { pricingDetails },
          },
        }) =>
          useMemo(
            () => (
              <p>
                {pricingDetails.printingCostPerSqft
                  ? toIndianCurrency(pricingDetails.printingCostPerSqft)
                  : null}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'MOUNTING COST',
        accessor: 'pricingDetails.mountingCostPerSqft',
        show: proposalData?.proposal?.displayColumns?.some(col => col === 'mountingCost'),
        Cell: ({
          row: {
            original: { pricingDetails },
          },
        }) =>
          useMemo(
            () => (
              <p>
                {pricingDetails.mountingCostPerSqft
                  ? toIndianCurrency(pricingDetails.mountingCostPerSqft)
                  : null}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'ONE TIME INSTALLATION COST',
        accessor: 'pricingDetails.oneTimeInstallationCost',
        show: proposalData?.proposal?.displayColumns?.some(col => col === 'installationCost'),
        Cell: ({
          row: {
            original: { pricingDetails },
          },
        }) =>
          useMemo(
            () => (
              <p>
                {pricingDetails.oneTimeInstallationCost
                  ? toIndianCurrency(pricingDetails.oneTimeInstallationCost)
                  : null}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'MONTHLY ADDITIONAL COST',
        accessor: 'pricingDetails.monthlyAdditionalCost',
        show: proposalData?.proposal?.displayColumns?.some(col => col === 'monthlyAdditionalCost'),
        Cell: ({
          row: {
            original: { pricingDetails },
          },
        }) =>
          useMemo(
            () => (
              <p>
                {pricingDetails.monthlyAdditionalCost
                  ? toIndianCurrency(pricingDetails.monthlyAdditionalCost)
                  : null}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'TOTAL PRICE',
        show: proposalData?.proposal?.displayColumns?.some(col => col === 'totalPrice'),
        accessor: 'price',
        Cell: ({ row: { original } }) =>
          useMemo(
            () =>
              calculateTotalPrice(original) ? toIndianCurrency(calculateTotalPrice(original)) : '',
            [],
          ),
      },
      {
        Header: 'AVAILABILITY',
        accessor: 'startDate',
        show: proposalData?.proposal?.displayColumns?.some(col => col === 'availability'),
        Cell: ({
          row: {
            original: { startDate },
          },
        }) => useMemo(() => <p>{dayjs(startDate).format('DD/MM/YYYY') || '-'}</p>, []),
      },
      {
        Header: 'SUBJECT TO EXTENSION',
        accessor: 'pricingDetails.subjectToExtension',
        show: proposalData?.proposal?.displayColumns?.some(col => col === 'extension'),
        Cell: ({
          row: {
            original: {
              pricingDetails: { subjectToExtension },
            },
          },
        }) =>
          useMemo(
            () => (
              <p className="italic font-light">
                {subjectToExtension ? 'Subject to extension' : null}
              </p>
            ),
            [],
          ),
      },
    ];
    return dataColumns.filter(col => col.show);
  }, [proposalData?.inventories?.docs]);

  useEffect(() => {
    if (mapInstance && proposalData?.inventories?.docs?.length) {
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
  }, [proposalData?.inventories?.docs?.length, mapInstance]);

  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto px-4  md:pb-10 md:px-14">
      <Header
        proposalId={proposalData?.proposal?._id}
        clientCompanyName={client_company_name}
        template={searchParams.get('template')}
      />
      <Details
        proposalData={proposalData?.proposal}
        isProposalDataLoading={isProposalDataLoading}
        inventoryData={proposalData?.inventories}
      />

      <p className="font-bold pt-2 text-2xl">Location Details</p>
      <p className="text-base font-light text-slate-400">
        All the places being covered in this campaign
      </p>
      <div className="mt-1 mb-4 h-[40vh] relative">
        <div className="absolute z-40 top-3 right-14">
          <Select
            data={
              isSubCategoryLoaded
                ? subCategoryData?.map(category => ({
                    label: category.name,
                    value: category._id,
                  }))
                : []
            }
            rightSection={
              searchParams.get('subCategory') ? (
                <ActionIcon
                  onClick={() => {
                    searchParams.set('subCategory', '');
                    setSearchParams(searchParams, { replace: true });
                  }}
                >
                  <IconX size={20} />
                </ActionIcon>
              ) : (
                <ChevronDown />
              )
            }
            placeholder="Select Medium"
            clearable
            searchable
            value={searchParams.get('subCategory')}
            onChange={val => {
              searchParams.set('subCategory', val || '');
              setSearchParams(searchParams, { replace: true });
            }}
          />
        </div>
        <GoogleMapReact
          bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY, libraries: 'places' }}
          defaultCenter={defaultProps.center}
          defaultZoom={defaultProps.zoom}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map, maps }) => setMapInstance({ map, maps })}
        >
          {proposalData?.inventories?.docs?.map(
            item =>
              Number(item.latitude) &&
              Number(item.longitude) && (
                <Marker
                  key={item._id}
                  lat={item.latitude && Number(item.latitude)}
                  lng={item.longitude && Number(item.longitude)}
                />
              ),
          )}
        </GoogleMapReact>
      </div>

      <p className="font-bold pt-2 text-2xl">Places In The Campaign</p>
      <p className="text-base font-light text-slate-400">
        All the places being covered in this campaign
      </p>
      <div className="flex justify-between h-16 items-center">
        <RowsPerPage
          setCount={currentLimit => {
            handlePagination('limit', currentLimit);
            setActiveLayout({ ...activeLayout, inventoryLimit: currentLimit });
          }}
          count={limit}
        />
        <Search search={searchInput} setSearch={setSearchInput} />
      </div>

      <Table
        COLUMNS={COLUMNS}
        data={proposalData?.inventories?.docs || []}
        activePage={proposalData?.inventories?.page || 1}
        totalPages={proposalData?.inventories?.totalPages || 1}
        setActivePage={currentPage => handlePagination('page', currentPage)}
        handleSorting={handleSortByColumn}
        loading={isProposalDataLoading}
      />
    </div>
  );
};

export default PublicLinkPage;
