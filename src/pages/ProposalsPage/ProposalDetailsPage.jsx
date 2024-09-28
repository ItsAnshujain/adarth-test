import { useMemo, useState, useEffect } from 'react';
import { ActionIcon, Badge, Button, Image, Select, Text } from '@mantine/core';
import { ChevronDown } from 'react-feather';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { useModals } from '@mantine/modals';
import classNames from 'classnames';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import shallow from 'zustand/shallow';
import GoogleMapReact from 'google-map-react';
import { IconEye, IconX } from '@tabler/icons';
import RowsPerPage from '../../components/RowsPerPage';
import Search from '../../components/Search';
import Header from '../../components/modules/proposals/ViewProposal/Header';
import Details from '../../components/modules/proposals/ViewProposal/Details';
import Table from '../../components/Table/Table';
import { useFetchProposalById } from '../../apis/queries/proposal.queries';
import toIndianCurrency from '../../utils/currencyFormat';
import {
  categoryColors,
  currentDate,
  generateSlNo,
  getAvailableUnits,
  getOccupiedState,
  indianMapCoordinates,
  stringToColour,
} from '../../utils';
import modalConfig from '../../utils/modalConfig';
import Filter from '../../components/modules/inventory/Filter';
import useUserStore from '../../store/user.store';
import ProposalSpacesMenuPopover from '../../components/Popovers/ProposalSpacesMenuPopover';
import useLayoutView from '../../store/layout.store';
import SpaceNamePhotoContent from '../../components/modules/inventory/SpaceNamePhotoContent';
import VersionsDrawer from '../../components/modules/proposals/ViewProposal/VersionsDrawer';
import ShareContent from '../../components/modules/proposals/ViewProposal/ShareContent';
import MarkerIcon from '../../assets/pin.svg';
import { GOOGLE_MAPS_API_KEY } from '../../utils/config';
import { useFetchMasterById } from '../../apis/queries/masters.queries';
import ViewPriceDrawer from '../../components/modules/proposals/ViewProposal/ViewPriceDrawer';
import InventoryPreviewImage from '../../components/shared/InventoryPreviewImage';
import { DATE_SECOND_FORMAT } from '../../utils/constants';

const updatedModalConfig = {
  ...modalConfig,
  classNames: {
    title: 'font-dmSans text-xl px-4 font-bold',
    header: 'p-4',
    body: '',
    close: 'mr-4 text-black',
  },
};

const defaultProps = {
  center: {
    lat: 28.70406,
    lng: 77.102493,
  },
  zoom: 10,
};

const Marker = () => <Image src={MarkerIcon} height={28} width={28} />;

const ProposalDetailsPage = () => {
  const modals = useModals();
  const [inventoryPriceDrawerOpened, inventoryPriceDrawerActions] = useDisclosure();
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [mapInstance, setMapInstance] = useState(null);
  const userId = useUserStore(state => state.id);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 800);
  const [showFilter, setShowFilter] = useState(false);
  const { activeLayout, setActiveLayout } = useLayoutView(
    state => ({
      activeLayout: state.activeLayout,
      setActiveLayout: state.setActiveLayout,
    }),
    shallow,
  );
  const [searchParams, setSearchParams] = useSearchParams({
    owner: 'all',
    page: 1,
    limit: activeLayout.inventoryLimit || 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const toggleFilter = () => setShowFilter(!showFilter);

  const [versionDrawerOpened, versionDrawerActions] = useDisclosure();

  const { id: proposalId } = useParams();
  const { data: proposalData, isLoading: isProposalDataLoading } = useFetchProposalById(
    `${proposalId}?${searchParams.toString()}`,
  );

  const { data: subCategoryData, isSuccess: isSubCategoryLoaded } =
    useFetchMasterById('all-subcategory');

  const page = searchParams.get('page');
  const limit = searchParams.get('limit');

  const togglePreviewModal = (imgSrc, inventoryName, dimensions, location) =>
    modals.openModal({
      title: 'Preview',
      children: (
        <InventoryPreviewImage
          imgSrc={imgSrc || null}
          inventoryName={inventoryName}
          dimensions={dimensions}
          location={location}
        />
      ),
      ...updatedModalConfig,
    });

  const toggleShareOptions = (id, versionTitle) => {
    modals.openModal({
      modalId: 'shareProposalOption',
      title: 'Share and Download Option',
      children: (
        <ShareContent
          shareType="proposal"
          id={id}
          onClose={() => modals.closeModal('shareProposalOption')}
          versionTitle={versionTitle}
          mediaOwner={proposalData?.proposal?.creator?.name.replace(' ', '_')}
        />
      ),
      ...modalConfig,
    });
  };

  const COLUMNS = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{generateSlNo(info.row.index, page, limit)}</p>, []),
      },
      {
        Header: 'SPACE NAME & PHOTO',
        accessor: 'spaceName',
        Cell: ({
          row: {
            original: {
              _id,
              spaceName,
              spacePhoto,
              isUnderMaintenance,
              bookingRange,
              unit,
              size,
              city,
            },
          },
        }) =>
          useMemo(() => {
            const unitLeft = getAvailableUnits(bookingRange, currentDate, currentDate, unit);

            const occupiedState = getOccupiedState(unitLeft, unit);

            return (
              <SpaceNamePhotoContent
                id={_id}
                spaceName={spaceName}
                spacePhoto={spacePhoto}
                dimensions={size}
                location={city}
                occupiedStateLabel={occupiedState}
                isUnderMaintenance={isUnderMaintenance}
                togglePreviewModal={togglePreviewModal}
              />
            );
          }, []),
      },
      {
        Header: 'FACIA TOWARDS',
        accessor: 'faciaTowards',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{info.row.original.faciaTowards || '-'}</p>, []),
      },
      {
        Header: 'CITY',
        accessor: 'location',
        Cell: ({
          row: {
            original: { location },
          },
        }) => useMemo(() => <p>{location || '-'}</p>),
      },
      {
        Header: 'ADDITIONAL TAGS',
        accessor: 'additionalTags',
        disableSortBy: true,
        Cell: info =>
          useMemo(
            () => (
              <div className="flex gap-x-2">
                {info.row.original.additionalTags?.length
                  ? info.row.original.additionalTags.map(
                      (item, index) =>
                        index < 2 && (
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
                    )
                  : '-'}
              </div>
            ),
            [],
          ),
      },
      {
        Header: 'CATEGORY',
        accessor: 'category',
        Cell: ({
          row: {
            original: { category },
          },
        }) =>
          useMemo(() => {
            const colorType = Object.keys(categoryColors).find(
              key => categoryColors[key] === category,
            );
            return (
              <div>
                {category ? (
                  <Badge color={colorType || 'gray'} size="lg" className="capitalize">
                    {category}
                  </Badge>
                ) : (
                  <span>-</span>
                )}
              </div>
            );
          }, []),
      },
      {
        Header: 'START DATE',
        accessor: 'startDate',
        Cell: ({
          row: {
            original: { startDate },
          },
        }) =>
          useMemo(
            () => <div>{startDate ? dayjs(startDate).format(DATE_SECOND_FORMAT) : 'NA'}</div>,
            [],
          ),
      },
      {
        Header: 'END DATE',
        accessor: 'endDate',
        Cell: ({
          row: {
            original: { endDate },
          },
        }) =>
          useMemo(
            () => <div>{endDate ? dayjs(endDate).format(DATE_SECOND_FORMAT) : 'NA'}</div>,
            [],
          ),
      },
      {
        Header: 'MEDIUM',
        accessor: 'subCategory',
        Cell: info =>
          useMemo(
            () =>
              info.row.original.subCategory ? (
                <p
                  className="h-6 px-3 flex items-center rounded-xl text-white font-medium text-[13px] capitalize"
                  style={{
                    background: stringToColour(info.row.original.subCategory),
                  }}
                >
                  {info.row.original.subCategory}
                </p>
              ) : (
                '-'
              ),
            [],
          ),
      },
      {
        Header: 'DIMENSION (WxH)',
        accessor: 'size.height',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { size },
          },
        }) =>
          useMemo(
            () => (
              <p className="max-w-[300px]">
                {size
                  .map(item => `${item?.width || 0}ft x ${item?.height || 0}ft`)
                  .filter(item => item !== null)
                  .join(', ')}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'PRICING',
        accessor: 'price',
        Cell: ({
          row: {
            original: { price, _id },
          },
        }) =>
          useMemo(
            () => (
              <div className="flex items-center">
                <p>{price ? toIndianCurrency(price) : 0}</p>{' '}
                <ActionIcon
                  title="Preview Media"
                  onClick={() => {
                    inventoryPriceDrawerActions.open();
                    setSelectedInventoryId(_id);
                  }}
                >
                  <IconEye color="black" size={20} />
                </ActionIcon>
              </div>
            ),
            [],
          ),
      },
      {
        Header: 'UNIT',
        accessor: 'bookedUnits',
        Cell: ({
          row: {
            original: { bookedUnits },
          },
        }) => useMemo(() => <p>{bookedUnits || '-'}</p>, []),
      },
      {
        Header: 'INVENTORY ID',
        accessor: 'inventoryId',
        Cell: info => useMemo(() => <p>{info.row.original.inventoryId || '-'}</p>, []),
      },
      {
        Header: 'MEDIA OWNER NAME',
        accessor: 'mediaOwner',
        Cell: ({
          row: {
            original: { mediaOwner },
          },
        }) => useMemo(() => <p className="w-fit">{mediaOwner || '-'}</p>, []),
      },
      {
        Header: 'PEER',
        accessor: 'peer',
        Cell: ({
          row: {
            original: { peer, peerId, mediaOwner },
          },
        }) =>
          useMemo(
            () => (
              <p
                className={classNames(
                  peerId === userId ? 'text-purple-450' : 'text-black',
                  'w-fit',
                )}
              >
                {peer ? mediaOwner : '-'}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'MEDIA TYPE',
        accessor: 'mediaType',
        Cell: ({
          row: {
            original: { mediaType },
          },
        }) => useMemo(() => <p>{mediaType || '-'}</p>),
      },
      {
        Header: 'FACING',
        accessor: 'facing',
        Cell: info => useMemo(() => <p>{info.row.original.facing || '-'}</p>),
      },
      {
        Header: 'ACTION',
        accessor: 'action',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { _id, createdBy },
          },
        }) =>
          useMemo(
            () => (
              <ProposalSpacesMenuPopover
                inventoryId={_id}
                spacesData={proposalData?.inventories?.docs}
                enableEdit={createdBy && !createdBy?.isPeer}
                enableDelete={createdBy && !createdBy?.isPeer}
              />
            ),
            [],
          ),
      },
    ],
    [proposalData?.inventories?.docs],
  );
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

  const handlePagination = (key, val) => {
    if (val !== '') searchParams.set(key, val);
    else searchParams.delete(key);
    setSearchParams(searchParams, { replace: true });
  };

  useEffect(() => {
    handleSearch();
    if (debouncedSearch === '') {
      searchParams.delete('search');
      setSearchParams(searchParams, { replace: true });
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (mapInstance && proposalData?.inventories?.docs?.length) {
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
  }, [proposalData?.inventories?.docs?.length, mapInstance]);

  const memoizedInventoryData = useMemo(
    () =>
      proposalData?.inventories?.docs?.map(doc => ({
        ...doc,
        dimension: doc.size,
        ...doc.pricingDetails,
      })),
    [proposalData?.inventories?.docs],
  );

  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto px-5">
      <Header
        isPeer={proposalData?.proposal?.isPeer}
        bookingId={proposalData?.proposal?.bookingId}
        onOpenVersionsDrawer={versionDrawerActions.open}
        toggleShareOptions={toggleShareOptions}
        parentProposalId={proposalData?.proposal?.parentProposalId}
        version={proposalData?.proposal?.versionTitle}
        isLoading={isProposalDataLoading}
      />
      <Details
        proposalData={proposalData?.proposal}
        isProposalDataLoading={isProposalDataLoading}
        inventoryData={proposalData?.inventories}
        proposalId={proposalId}
      />
      <p className="text-lg font-bold py-2">Location Details</p>
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
              Number(item?.latitude) &&
              Number(item?.longitude) && (
                <Marker
                  key={item._id}
                  lat={item?.latitude && Number(item?.latitude)}
                  lng={item?.longitude && Number(item?.longitude)}
                />
              ),
          )}
        </GoogleMapReact>
      </div>
      <div className="flex justify-between mt-4">
        <Text size="xl" weight="bolder">
          Selected Inventory
        </Text>
        <div className="flex gap-2">
          <div>
            <Button onClick={toggleFilter} variant="default">
              <ChevronDown size={16} className="mt-[1px] mr-1" /> Filter
            </Button>
            {showFilter && <Filter isOpened={showFilter} setShowFilter={setShowFilter} />}
          </div>
        </div>
      </div>
      <div className="flex justify-between h-20 items-center">
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
      <VersionsDrawer
        isOpened={versionDrawerOpened}
        onClose={versionDrawerActions.close}
        searchParams={searchParams}
        toggleShareOptions={toggleShareOptions}
        parentId={proposalData?.proposal?.parentProposalId}
        parentVersionTitle={proposalData?.proposal?.versionTitle}
      />
      <ViewPriceDrawer
        isOpened={inventoryPriceDrawerOpened}
        onClose={inventoryPriceDrawerActions.close}
        selectedInventories={memoizedInventoryData}
        selectedInventoryId={selectedInventoryId}
        type="proposal"
        mode="view"
      />{' '}
    </div>
  );
};

export default ProposalDetailsPage;
