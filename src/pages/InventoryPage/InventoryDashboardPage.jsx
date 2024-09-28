import { useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { useSearchParams } from 'react-router-dom';
import { ActionIcon, Badge, Button, Image } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import classNames from 'classnames';
import isBetween from 'dayjs/plugin/isBetween';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import shallow from 'zustand/shallow';
import Table from '../../components/Table/Table';
import AreaHeader from '../../components/modules/inventory/AreaHeader';
import RowsPerPage from '../../components/RowsPerPage';
import Search from '../../components/Search';
import GridView from '../../components/modules/inventory/Grid';
import MapView from '../../components/modules/inventory/MapView';
import useLayoutView from '../../store/layout.store';
import {
  useDeleteInventory,
  useFetchInventory,
  useUpdateInventories,
} from '../../apis/queries/inventory.queries';
import toIndianCurrency from '../../utils/currencyFormat';
import modalConfig from '../../utils/modalConfig';
import {
  categoryColors,
  currentDate,
  generateSlNo,
  getAvailableUnits,
  getOccupiedState,
  ROLES,
  stringToColour,
} from '../../utils';
import { FormProvider, useForm } from '../../context/formContext';
import TrashIcon from '../../assets/delete.png';
import ExportIcon from '../../assets/export.png';
import RoleBased from '../../components/RoleBased';
import SpacesMenuPopover from '../../components/Popovers/SpacesMenuPopover';
import ViewByFilter from '../../components/modules/inventory/ViewByFilter';
import ShareContent from '../../components/modules/proposals/ViewProposal/ShareContent';
import SpaceNamePhotoContent from '../../components/modules/inventory/SpaceNamePhotoContent';
import VacantInventoryFilter from '../../components/modules/inventory/VacantInventoryFilterContent';
import { DATE_FORMAT } from '../../utils/constants';
import InventoryPreviewImage from '../../components/shared/InventoryPreviewImage';

dayjs.extend(isBetween);

const updatedModalConfig = {
  ...modalConfig,
  classNames: {
    title: 'font-dmSans text-xl px-4 font-bold',
    header: 'p-4',
    body: '',
    close: 'mr-4 text-black',
  },
};

const InventoryDashboardPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 800);
  const modals = useModals();
  const form = useForm({ initialValues: { spaces: [] } });
  const viewType = useLayoutView(state => state.activeLayout);
  const { activeLayout, setActiveLayout } = useLayoutView(
    state => ({
      activeLayout: state.activeLayout,
      setActiveLayout: state.setActiveLayout,
    }),
    shallow,
  );
  const [searchParams, setSearchParams] = useSearchParams({
    limit: activeLayout.inventoryLimit || 20,
    page: 1,
    sortOrder: 'desc',
    sortBy: 'createdAt',
    isActive: true,
  });
  const { data: inventoryData, isLoading: isInventoryDataLoading } = useFetchInventory(
    searchParams.toString(),
  );
  const { mutate: deleteInventoryData, isLoading: isDeletedInventoryDataLoading } =
    useDeleteInventory();
  const [selectedCards, setSelectedCards] = useState([]);

  const { mutate: update, isLoading: isUpdateInventoryLoading } = useUpdateInventories();

  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const isActive = searchParams.get('isActive');

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
        Cell: info =>
          useMemo(() => {
            const unitLeft = getAvailableUnits(
              info.row.original.bookingRange,
              currentDate,
              currentDate,
              info.row.original.specifications?.unit,
            );

            const occupiedState = getOccupiedState(
              unitLeft,
              info.row.original.specifications?.unit,
            );
            return (
              <SpaceNamePhotoContent
                id={info.row.original._id}
                spaceName={info.row.original.basicInformation?.spaceName}
                spacePhoto={info.row.original.basicInformation?.spacePhoto}
                dimensions={info.row.original.specifications?.size}
                location={info.row.original.location?.city}
                occupiedStateLabel={occupiedState}
                isUnderMaintenance={info.row.original.isUnderMaintenance}
                togglePreviewModal={togglePreviewModal}
              />
            );
          }, []),
      },
      {
        Header: 'FACIA TOWARDS',
        accessor: 'location.faciaTowards',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{info.row.original.location?.faciaTowards || '-'}</p>, []),
      },
      {
        Header: 'CITY',
        accessor: 'location.city',
        Cell: info => useMemo(() => <p>{info.row.original.location?.city || '-'}</p>, []),
      },
      {
        Header: 'ADDITIONAL TAGS',
        accessor: 'specifications.additionalTags',
        disableSortBy: true,
        Cell: info =>
          useMemo(
            () => (
              <div className="flex gap-x-2">
                {info.row.original.specifications?.additionalTags?.length
                  ? info.row.original.specifications.additionalTags.map(
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
        accessor: 'basicInformation.category.name',
        Cell: info =>
          useMemo(() => {
            const colorType = Object.keys(categoryColors).find(
              key => categoryColors[key] === info.row.original.basicInformation?.category?.name,
            );
            return (
              <div>
                {info.row.original.basicInformation?.category?.name ? (
                  <Badge color={colorType || 'gray'} size="lg" className="capitalize">
                    {info.row.original.basicInformation.category.name}
                  </Badge>
                ) : (
                  '-'
                )}
              </div>
            );
          }, []),
      },
      {
        Header: 'SUB CATEGORY',
        accessor: 'basicInformation.subCategory.name',
        Cell: info =>
          useMemo(
            () =>
              info.row.original.basicInformation?.subCategory?.name ? (
                <p
                  className="h-6 px-3 flex items-center rounded-xl text-white font-medium text-[13px] capitalize"
                  style={{
                    background: stringToColour(
                      info.row.original.basicInformation?.subCategory?.name,
                    ),
                  }}
                >
                  {info.row.original.basicInformation.subCategory.name}
                </p>
              ) : (
                '-'
              ),
            [],
          ),
      },
      {
        Header: 'DIMENSION (WxH)',
        accessor: 'specifications.size.min',
        disableSortBy: true,
        Cell: info =>
          useMemo(
            () => (
              <div className="flex gap-x-2">
                {info.row.original.specifications?.size.length ? (
                  <p className="max-w-[300px]">
                    {info.row.original.specifications.size
                      .map(item => `${item?.width || 0}ft x ${item?.height || 0}ft`)
                      .filter(item => item !== null)
                      .join(', ')}
                  </p>
                ) : (
                  '-'
                )}
              </div>
            ),
            [],
          ),
      },
      {
        Header: 'PRICING',
        accessor: 'basicInformation.price',
        Cell: info =>
          useMemo(
            () => (
              <p>
                {info.row.original.basicInformation?.price
                  ? toIndianCurrency(Number.parseInt(info.row.original.basicInformation?.price, 10))
                  : 0}
              </p>
            ),
            [],
          ),
      },
      {
        Header: 'UNIT',
        accessor: 'specifications.unit',
        Cell: info => useMemo(() => <p>{info.row.original.specifications?.unit || '-'}</p>, []),
      },
      {
        Header: 'INVENTORY ID',
        accessor: 'inventoryId',
        Cell: info => useMemo(() => <p>{info.row.original.inventoryId || '-'}</p>, []),
      },
      {
        Header: 'MEDIA OWNER NAME',
        accessor: 'basicInformation.mediaOwner.name',
        Cell: ({
          row: {
            original: { basicInformation },
          },
        }) =>
          useMemo(() => <p className="w-fit">{basicInformation?.mediaOwner?.name || '-'}</p>, []),
      },
      {
        Header: 'PEER',
        accessor: 'basicInformation.peerMediaOwner',
        Cell: info =>
          useMemo(
            () => (
              <p className="w-fit">{info.row.original.basicInformation?.peerMediaOwner || '-'}</p>
            ),
            [],
          ),
      },
      {
        Header: 'MEDIA TYPE',
        accessor: 'basicInformation.mediaType.name',
        Cell: info =>
          useMemo(() => <p>{info.row.original.basicInformation?.mediaType?.name || '-'}</p>),
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
        Cell: info =>
          useMemo(
            () => (
              <SpacesMenuPopover
                itemId={info.row.original._id}
                enableDelete={info.row.original.createdBy && !info.row.original.createdBy?.isPeer}
                enableEdit={info.row.original.createdBy && !info.row.original.createdBy?.isPeer}
              />
            ),
            [],
          ),
      },
    ],
    [inventoryData?.docs],
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

  const handleSearch = () => {
    searchParams.set('search', debouncedSearch);
    searchParams.set('page', debouncedSearch === '' ? page : 1);
    if (debouncedSearch !== '') {
      searchParams.delete('sortBy');
      searchParams.delete('sortOrder');
    }
    setSearchParams(searchParams);
  };

  const handlePagination = (key, val) => {
    if (val !== '') searchParams.set(key, val);
    else searchParams.delete(key);
    setSearchParams(searchParams);
  };

  const handleSelection = selectedRows => form.setFieldValue('spaces', selectedRows);

  const handleDeleteInventories = formData => {
    let data = {};
    data = formData.spaces.map(item => item._id);
    if (!data.length) {
      showNotification({
        title: 'Please select atleast one space to delete',
        color: 'blue',
      });
      return;
    }

    deleteInventoryData(data, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  const handleToggleInventories = (formData, state) => {
    let data = {};
    data = formData.spaces.map(item => item._id);
    if (!data.length) {
      showNotification({
        title: 'Please select atleast one space to disable',
        color: 'blue',
      });
      return;
    }

    update(
      { inventoryId: data, data: { isActive: state } },
      {
        onSuccess: () => {
          form.reset();
        },
      },
    );
  };

  const handleViewBy = type => {
    searchParams.set('isActive', type === 'active');
    searchParams.set('page', 1);
    setSearchParams(searchParams);
  };

  const handleFilterVacantInventory = () => {
    modals.openModal({
      modalId: 'vacantInventoryFilter',
      title: 'Vacant Inventory Filter',
      size: 'xl',
      children: (
        <VacantInventoryFilter
          searchParamQueries={searchParams}
          onClose={() => modals.closeModal('vacantInventoryFilter')}
          onSubmit={(city, from, to) => {
            modals.closeModal('vacantInventoryFilter');
            searchParams.set('isUnderMaintenance', false);
            if (city) searchParams.set('cities', city);
            searchParams.set('from', dayjs(from).format(DATE_FORMAT));
            searchParams.set('to', dayjs(to).format(DATE_FORMAT));
            setSearchParams(searchParams);
          }}
        />
      ),
      ...modalConfig,
    });
  };

  const toggleShareOptions = () => {
    modals.openModal({
      modalId: 'shareInventoryOption',
      title: 'Share and Download Option',
      children: (
        <ShareContent
          shareType="inventory"
          searchParamQueries={searchParams}
          onClose={() => modals.closeModal('shareInventoryOption')}
        />
      ),
      ...modalConfig,
    });
  };

  useEffect(() => {
    handleSearch();
    if (debouncedSearch === '') {
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  }, [debouncedSearch]);

  console.log("inventory data", inventoryData?.docs)

  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto px-5">
      <FormProvider form={form}>
        <form className={classNames(viewType.inventory === 'grid' ? 'h-[70%]' : '')}>
          <AreaHeader text="List of spaces" inventoryData={inventoryData} />
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <RowsPerPage
                setCount={currentLimit => {
                  handlePagination('limit', currentLimit);
                  setActiveLayout({ ...activeLayout, inventoryLimit: currentLimit });
                }}
                count={limit}
              />
              {viewType.inventory !== 'map' && (
                <RoleBased acceptedRoles={[ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.MANAGEMENT]}>
                  {isDeletedInventoryDataLoading ? (
                    <p>Inventory deleting...</p>
                  ) : (
                    <ActionIcon size={20} onClick={form.onSubmit(e => handleDeleteInventories(e))}>
                      <Image src={TrashIcon} />
                    </ActionIcon>
                  )}

                  {isActive === 'true' ? (
                    <Button
                      className="secondary-button ml-4"
                      onClick={form.onSubmit(e => handleToggleInventories(e, false))}
                      loading={isUpdateInventoryLoading}
                    >
                      Disable
                    </Button>
                  ) : (
                    <Button
                      className="secondary-button ml-4"
                      onClick={form.onSubmit(e => handleToggleInventories(e, true))}
                      loading={isUpdateInventoryLoading}
                    >
                      Enable
                    </Button>
                  )}
                </RoleBased>
              )}
            </div>

            <section className="flex items-center gap-3">
              {viewType.inventory !== 'map' && (
                <Search search={searchInput} setSearch={setSearchInput} form="nosubmit" />
              )}
              <ViewByFilter handleViewBy={handleViewBy} />
              <Button className="secondary-button" onClick={handleFilterVacantInventory}>
                Vacant Inventories
              </Button>
              <ActionIcon
                size={24}
                onClick={() => (searchParams.get('isUnderMaintenance') ? toggleShareOptions() : {})}
                disabled={!searchParams.get('isUnderMaintenance')}
                className={classNames(
                  !searchParams.get('isUnderMaintenance') ? 'opacity-50' : 'opacity-100',
                )}
              >
                <Image src={ExportIcon} />
              </ActionIcon>
            </section>
          </div>

          {viewType.inventory === 'grid' && inventoryData?.docs?.length ? (
            <GridView
              list={inventoryData?.docs || []}
              activePage={inventoryData?.page}
              totalPages={inventoryData?.totalPages}
              setActivePage={currentPage => handlePagination('page', currentPage)}
              isLoadingList={isInventoryDataLoading || isDeletedInventoryDataLoading}
              selectedCards={selectedCards}
              setSelectedCards={setSelectedCards}
            />
          ) : viewType.inventory === 'list' ? (
            <Table
              data={inventoryData?.docs || []}
              COLUMNS={COLUMNS}
              allowRowsSelect
              setSelectedFlatRows={handleSelection}
              selectedRowData={form.values?.spaces}
              handleSorting={handleSortByColumn}
              activePage={inventoryData?.page || 1}
              totalPages={inventoryData?.totalPages || 1}
              setActivePage={currentPage => handlePagination('page', currentPage)}
              loading={isInventoryDataLoading}
            />
          ) : viewType.inventory === 'map' ? (
            <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto">
              <MapView lists={inventoryData?.docs} />
            </div>
          ) : null}
        </form>
      </FormProvider>
    </div>
  );
};

export default InventoryDashboardPage;
