import { useState, useEffect, useMemo } from 'react';
import { Text, Button, Badge } from '@mantine/core';
import { Plus } from 'react-feather';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useClickOutside, useDebouncedValue } from '@mantine/hooks';
import { useModals } from '@mantine/modals';
import RowsPerPage from '../../../RowsPerPage';
import Search from '../../../Search';
import calendar from '../../../../assets/data-table.svg';
import DateRange from '../../../DateRange';
import Table from '../../../Table/Table';
import RoleBased from '../../../RoleBased';
import { categoryColors, generateSlNo, ROLES } from '../../../../utils';
import toIndianCurrency from '../../../../utils/currencyFormat';
import modalConfig from '../../../../utils/modalConfig';
import SpacesMenuPopover from '../../../Popovers/SpacesMenuPopover';
import SpaceNamePhotoContent from '../../inventory/SpaceNamePhotoContent';
import InventoryPreviewImage from '../../../shared/InventoryPreviewImage';

const updatedModalConfig = {
  ...modalConfig,
  classNames: {
    title: 'font-dmSans text-xl px-4 font-bold',
    header: 'p-4',
    body: '',
    close: 'mr-4 text-black',
  },
};

const SpacesList = ({ spacesData = {}, isCampaignDataLoading }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams({
    'limit': 10,
    'page': 1,
    'sortOrder': 'desc',
    'sortBy': 'basicInformation.spaceName',
  });
  const ref = useClickOutside(() => setShowDatePicker(false));
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 800);
  const navigate = useNavigate();
  const modals = useModals();
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  const page = searchParams.get('page');
  const limit = searchParams.get('limit');

  const togglePreviewModal = (imgSrc, inventoryName, dimensions, location) =>
    modals.openModal({
      title: 'Preview',
      children: (
        <InventoryPreviewImage
          imgSrc={imgSrc}
          inventoryName={inventoryName}
          dimensions={dimensions}
          location={location}
        />
      ),
      ...updatedModalConfig,
    });

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
        accessor: 'basicInformation.spaceName',
        Cell: ({
          row: {
            original: { basicInformation, isUnderMaintenance, specifications, location, _id },
          },
        }) =>
          useMemo(
            () => (
              <SpaceNamePhotoContent
                id={_id}
                spaceName={basicInformation?.spaceName}
                spacePhoto={basicInformation?.spacePhoto}
                dimensions={specifications?.size}
                location={location?.city}
                occupiedStateLabel="Available"
                isUnderMaintenance={isUnderMaintenance}
                togglePreviewModal={togglePreviewModal}
              />
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
              key => categoryColors[key] === category?.name,
            );

            return (
              <div>
                {category?.name ? (
                  <Badge color={colorType || 'gray'} size="lg" className="capitalize">
                    {category.name}
                  </Badge>
                ) : (
                  <span>-</span>
                )}
              </div>
            );
          }, []),
      },
      {
        Header: 'MEDIA OWNER NAME',
        accessor: 'mediaOwner.name',
        Cell: ({
          row: {
            original: { mediaOwner },
          },
        }) => useMemo(() => <p className="w-fit">{mediaOwner?.name || '-'}</p>, []),
      },
      {
        Header: 'MEDIA TYPE',
        accessor: 'basicInformation.mediaType.name',
        Cell: ({
          row: {
            original: { mediaType },
          },
        }) => useMemo(() => <p>{mediaType?.name || '-'}</p>),
      },
      {
        Header: 'PRICING',
        accessor: 'basicInformation.price',
        Cell: ({
          row: {
            original: { basicInformation },
          },
        }) =>
          useMemo(
            () => (
              <p>
                {basicInformation?.price
                  ? toIndianCurrency(Number.parseInt(basicInformation?.price, 10))
                  : 0}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'FACING',
        accessor: 'location.facing',
        Cell: info => useMemo(() => <p>{info.row.original.location?.facing?.name || '-'}</p>),
      },
      {
        Header: 'ACTION',
        accessor: 'action',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { _id },
          },
        }) => useMemo(() => <SpacesMenuPopover itemId={_id} enableDelete={false} />, []),
      },
    ],
    [spacesData?.docs],
  );

  const handleSortByColumn = colId => {
    if (searchParams.get('sortBy') === colId && searchParams.get('sortOrder') === 'desc') {
      searchParams.set('sortOrder', 'asc');
      setSearchParams(searchParams);
      return;
    }
    if (searchParams.get('sortBy') === colId && searchParams.get('sortOrder') === 'asc') {
      searchParams.set('sortOrder', 'desc');
      setSearchParams(searchParams);
      return;
    }

    searchParams.set('sortBy', colId);
    setSearchParams(searchParams);
  };

  const handlePagination = (key, val) => {
    if (val !== '') {
      searchParams.set(key, val);
    } else {
      searchParams.delete(key);
    }
    setSearchParams(searchParams);
  };

  useEffect(() => {
    if (debouncedSearch) {
      searchParams.set('search', debouncedSearch);
    } else {
      searchParams.delete('search');
    }

    setSearchParams(searchParams);
  }, [debouncedSearch]);
  return (
    <>
      <div className="mt-5 flex justify-between">
        <Text>List of space for the campaign</Text>
        <div className="flex">
          <div ref={ref} className="mr-2 relative">
            <Button onClick={toggleDatePicker} variant="default">
              <img src={calendar} className="h-5" alt="calendar" />
            </Button>
            {showDatePicker && (
              <div className="absolute z-20 -translate-x-3/4 bg-white -top-0.3">
                <DateRange handleClose={toggleDatePicker} dateKeys={['from', 'to']} />
              </div>
            )}
          </div>
          <RoleBased acceptedRoles={[ROLES.ADMIN, ROLES.SUPERVISOR]}>
            <div>
              <Button
                onClick={() => navigate('/inventory/create-space/single')}
                className="bg-purple-450 flex items-center align-center py-2 text-white rounded-md px-4 text-sm"
              >
                <Plus size={16} className="mt-[1px] mr-1" /> Add Space
              </Button>
            </div>
          </RoleBased>
        </div>
      </div>
      <div>
        <div className="flex justify-between h-20 items-center">
          <RowsPerPage
            setCount={pageLimit => {
              searchParams.set('limit', pageLimit);
              setSearchParams(searchParams);
            }}
            count={searchParams.get('limit')}
          />
          <Search search={searchInput} setSearch={setSearchInput} />
        </div>

        <Table
          data={spacesData?.docs || []}
          COLUMNS={COLUMNS}
          handleSorting={handleSortByColumn}
          setActivePage={currentPage => handlePagination('page', currentPage)}
          loading={isCampaignDataLoading}
        />
      </div>
    </>
  );
};

export default SpacesList;
