import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, NumberInput, Group, Tooltip } from '@mantine/core';
import { ChevronDown } from 'react-feather';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import isBetween from 'dayjs/plugin/isBetween';
import dayjs from 'dayjs';
import { useModals } from '@mantine/modals';
import shallow from 'zustand/shallow';
import { useFormContext } from 'react-hook-form';
import { showNotification } from '@mantine/notifications';
import Search from '../../../Search';
import toIndianCurrency from '../../../../utils/currencyFormat';
import Table from '../../../Table/Table';
import { useFetchInventory } from '../../../../apis/queries/inventory.queries';
import {
  calculateTotalAmountWithPercentage,
  calculateTotalCostOfBooking,
  calculateTotalMonths,
  calculateTotalPrintingOrMountingCost,
  currentDate,
  debounce,
  generateSlNo,
  getAvailableUnits,
  getDate,
  getEveryDayUnits,
  getOccupiedState,
  getUpdatedBookingData,
} from '../../../../utils';
import Filter from '../../inventory/Filter';
import SpacesMenuPopover from '../../../Popovers/SpacesMenuPopover';
import DateRangeSelector from '../../../DateRangeSelector';
import modalConfig from '../../../../utils/modalConfig';
import RowsPerPage from '../../../RowsPerPage';
import useLayoutView from '../../../../store/layout.store';
import SpaceNamePhotoContent from '../../inventory/SpaceNamePhotoContent';
import AdditionalTagsContent from '../../inventory/AdditionalTagsContent';
import CategoryContent from '../../inventory/CategoryContent';
import SubCategoryContent from '../../inventory/SubCategoryContent';
import UploadMediaContent from '../../inventory/UploadMediaContent';
import DimensionContent from '../../inventory/DimensionContent';
import AddEditPriceDrawer from './AddEditPriceDrawer';
import InventoryPreviewImage from '../../../shared/InventoryPreviewImage';

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

const SelectSpace = () => {
  const modals = useModals();
  const { id: bookingId } = useParams();
  const form = useFormContext();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 800);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [showFilter, setShowFilter] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const { activeLayout, setActiveLayout } = useLayoutView(
    state => ({
      activeLayout: state.activeLayout,
      setActiveLayout: state.setActiveLayout,
    }),
    shallow,
  );
  const watchPlace = form.watch('place') || [];
  const [drawerOpened, drawerActions] = useDisclosure();
  const selectedInventoryIds = useMemo(() => watchPlace.map(space => space._id));

  const [showDateRangeOptions, setShowDateRangeOptions] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams({
    limit: activeLayout.inventoryLimit || 20,
    page: 1,
    sortOrder: 'desc',
    sortBy: 'createdAt',
    isUnderMaintenance: false,
    isActive: true,
    ids: selectedInventoryIds.join(','),
  });
  const pages = searchParams.get('page');
  const limit = searchParams.get('limit');
  const inventoryQuery = useFetchInventory(searchParams.toString());

  const [updatedInventoryData, setUpdatedInventoryData] = useState([]);

  const calculateTotalArea = (place, unit) =>
    (place?.dimension?.reduce(
      (accumulator, dimension) => accumulator + dimension.height * dimension.width,
      0,
    ) || 0) *
      (unit || 1) *
      (place?.facing?.toLowerCase().includes('single') ||
      place?.location?.facing?.name?.toLowerCase().includes('single')
        ? 1
        : place?.facing?.toLowerCase().includes('double') ||
          place?.location?.facing?.name?.toLowerCase().includes('double')
        ? 2
        : place?.facing?.toLowerCase().includes('triple') ||
          place?.location?.facing?.name.toLowerCase().includes('triple')
        ? 3
        : place?.facing?.toLowerCase().includes('four') ||
          place?.location?.facing?.name.toLowerCase().includes('four')
        ? 4
        : 1) || 0;

  const handleDateRangeChange = (startDate, endDate, id) => {
    setShowDateRangeOptions(prev => ({
      ...prev,
      [id]: true,
    }));

    updateData('dateRange', [startDate, endDate], id, null, false);
  };

  const applyDateRangeToAll = (startDate, endDate) => {
    const selectedIds = watchPlace.map(space => space._id);

    updateData('dateRange', [startDate, endDate], null, null, true, selectedIds);
    setShowDateRangeOptions({});
  };

  const updateData = debounce((key, val, id, inputId, applyToAll, selectedIds = []) => {
    if (key === 'dateRange') {
      const totalMonths = calculateTotalMonths(val[0], val[1]);

      setUpdatedInventoryData(prev => {
        return prev.map(item => {
          const space = watchPlace.find(sp => sp._id === item._id);
          const availableUnit = getAvailableUnits(
            item.bookingRange,
            val[0],
            val[1],
            item.originalUnit,
          );

          if (applyToAll && selectedIds.includes(item._id)) {
            return {
              ...item,
              startDate: val[0],
              endDate: val[1],
              availableUnit,
              displayCostPerMonth: space?.displayCostPerMonth || 0,
              displayCostPerSqFt:
                calculateTotalArea(item, item.unit) > 0
                  ? Number(
                      (
                        (item.displayCostPerMonth || 0) / calculateTotalArea(item, item.unit)
                      ).toFixed(2),
                    )
                  : 0,
              totalDisplayCost:
                calculateTotalArea(item, item.unit) > 0
                  ? (item.displayCostPerMonth || 0) * totalMonths
                  : 0,
              totalPrintingCost: calculateTotalPrintingOrMountingCost(
                item,
                item.unit,
                item.printingCostPerSqft || 0,
                0,
              ),
              totalMountingCost: calculateTotalPrintingOrMountingCost(
                item,
                item.unit,
                item.mountingCostPerSqft || 0,
                0,
              ),
              price: calculateTotalCostOfBooking(item, item.unit, val[0], val[1]),
            };
          } else if (item._id === id) {
            return {
              ...item,
              startDate: val[0],
              endDate: val[1],
              availableUnit,
              displayCostPerMonth: space?.displayCostPerMonth || 0,
              displayCostPerSqFt:
                calculateTotalArea(item, item.unit) > 0
                  ? Number(
                      (
                        (item.displayCostPerMonth || 0) / calculateTotalArea(item, item.unit)
                      ).toFixed(2),
                    )
                  : 0,
              totalDisplayCost:
                calculateTotalArea(item, item.unit) > 0
                  ? (item.displayCostPerMonth || 0) * totalMonths
                  : 0,
              totalPrintingCost: calculateTotalPrintingOrMountingCost(
                item,
                item.unit,
                item.printingCostPerSqft || 0,
                0,
              ),
              totalMountingCost: calculateTotalPrintingOrMountingCost(
                item,
                item.unit,
                item.mountingCostPerSqft || 0,
                0,
              ),
              price: calculateTotalCostOfBooking(item, item.unit, val[0], val[1]),
            };
          } else {
            return item;
          }
        });
      });

      // Update the form values
      form.setValue(
        'place',
        watchPlace.map(item => {
          const updatedTotalArea = calculateTotalArea(item, item.unit);
          return applyToAll || item._id === id
            ? {
                ...item,
                startDate: val[0],
                endDate: val[1],
                availableUnit: getAvailableUnits(
                  item.bookingRange,
                  val[0],
                  val[1],
                  item.originalUnit,
                ),
                displayCostPerSqFt:
                  updatedTotalArea > 0
                    ? Number(((item.displayCostPerMonth || 0) / updatedTotalArea).toFixed(2))
                    : 0,
                totalDisplayCost:
                  updatedTotalArea > 0 ? (item.displayCostPerMonth || 0) * totalMonths : 0,
                totalPrintingCost: calculateTotalPrintingOrMountingCost(
                  item,
                  item.unit,
                  item.printingCostPerSqft || 0,
                  0,
                ),
                totalMountingCost: calculateTotalPrintingOrMountingCost(
                  item,
                  item.unit,
                  item.mountingCostPerSqft || 0,
                  0,
                ),
                price: calculateTotalCostOfBooking(item, item.unit, val[0], val[1]),
              }
            : item;
        }),
      );
    } else {
      setUpdatedInventoryData(prev =>
        prev.map(item =>
          item._id === id
            ? {
                ...item,
                [key]: val,
                ...(key === 'unit' ? { hasChangedUnit: true } : {}),
              }
            : item,
        ),
      );

      form.setValue(
        'place',
        watchPlace.map(item => {
          const updatedTotalArea = calculateTotalArea(item, key === 'unit' ? val : item.unit);
          return item._id === id
            ? {
                ...item,
                displayCostPerSqFt:
                  updatedTotalArea > 0
                    ? Number((item.displayCostPerMonth / updatedTotalArea).toFixed(2))
                    : 0,
                printingCostPerSqft: item.printingCostPerSqft,
                mountingCostPerSqft: item.mountingCostPerSqft,
                totalPrintingCost: calculateTotalPrintingOrMountingCost(
                  item,
                  key === 'unit' ? val : item.unit,
                  item.printingCostPerSqft || 0,
                  0,
                ),
                totalMountingCost: calculateTotalPrintingOrMountingCost(
                  item,
                  key === 'unit' ? val : item.unit,
                  item.mountingCostPerSqft || 0,
                  0,
                ),
                totalArea: updatedTotalArea,
                price: calculateTotalCostOfBooking(
                  item,
                  key === 'unit' ? val : item.unit,
                  item.startDate,
                  item.endDate,
                ),
                [key]: val,
                ...(key === 'unit' ? { hasChangedUnit: true } : {}),
              }
            : item;
        }),
      );
    }

    if (inputId) {
      setTimeout(() => document.querySelector(`#${inputId}`)?.focus());
    }
  }, 500);

  const getTotalPrice = (places = []) => {
    const totalPrice = places.reduce(
      (acc, item) =>
        acc + calculateTotalCostOfBooking(item, item?.unit, item?.startDate, item?.endDate),
      0,
    );

    return totalPrice || 0;
  };

  const handleSortRowsOnTop = (spaces, rows) => {
    setUpdatedInventoryData(() => {
      const arr1 = [];
      const arr2 = [];

      const finalSpaces = [];
      for (const item of spaces) {
        const selectionItem = watchPlace?.find(pl => pl._id === item._id);
        const obj = {};
        obj.photo = item.basicInformation?.spacePhoto;
        obj._id = item._id;
        obj.spaceName = item?.spaceName || item.basicInformation?.spaceName;
        obj.inventoryId = item?.inventoryId;
        obj.isUnderMaintenance = item?.isUnderMaintenance;
        obj.additionalTags = item?.specifications?.additionalTags;
        obj.category = item?.category || item?.basicInformation?.category?.[0]?.name;
        obj.subCategory = item?.subCategory || item?.basicInformation?.subCategory?.name;
        obj.mediaOwner = item?.basicInformation?.mediaOwner?.name || '-';
        obj.peer = item?.basicInformation?.peerMediaOwner || '-';
        obj.dimension = item.specifications?.size;
        obj.originalUnit = item?.specifications?.unit || 1;
        obj.unit = item?.specifications?.unit || 1;
        obj.faciaTowards = item?.location?.faciaTowards;
        obj.location = item?.location;
        obj.mediaType = item.basicInformation?.mediaType?.name;
        obj.price = selectionItem?.price ?? (item?.basicInformation?.price || 0);
        obj.tradedAmount = selectionItem?.tradedAmount ?? 0;
        obj.campaigns = item?.campaigns;
        obj.facing = item?.location?.facing?.name;
        obj.startDate = getDate(selectionItem, item, 'startDate');
        obj.endDate = getDate(selectionItem, item, 'endDate');
        obj.bookingRange = item?.bookingRange ? item.bookingRange : [];
        obj.spacing = item.location.spacing;
        finalSpaces.push(obj);
      }

      rows.forEach(item => {
        if (finalSpaces.some(space => space._id === item._id)) {
          arr1.push(item);
        } else {
          arr2.push(item);
        }
      });
      if (arr1?.length < finalSpaces.length) {
        return [...finalSpaces, ...arr2];
      }
      return [...arr1, ...arr2];
    });
  };

  const handleSelection = selectedRows => {
    const newAddedRow = selectedRows.filter(
      selectedRow => !watchPlace.find(addedRow => selectedRow._id === addedRow._id),
    );
    const filteredRowWithApplyToAll = selectedRows.filter(
      row => row.applyPrintingMountingCostForAll || row.applyDiscountForAll,
    );

    if (filteredRowWithApplyToAll?.length > 0 && newAddedRow.length > 0) {
      const updatedSelectedRows = getUpdatedBookingData(
        filteredRowWithApplyToAll?.[0],
        filteredRowWithApplyToAll?.[0]?._id,
        selectedRows,
        calculateTotalCostOfBooking(
          { ...filteredRowWithApplyToAll?.[0], ...form.watch() },
          filteredRowWithApplyToAll?.[0]?.unit,
          filteredRowWithApplyToAll?.[0]?.startDate,
          filteredRowWithApplyToAll?.[0]?.endDate,
        ),
        calculateTotalArea(filteredRowWithApplyToAll?.[0], filteredRowWithApplyToAll?.[0]?.unit),
      );

      handleSortRowsOnTop(updatedSelectedRows, updatedInventoryData);
      form.setValue('place', updatedSelectedRows);
    } else {
      handleSortRowsOnTop(selectedRows, updatedInventoryData);
      form.setValue('place', selectedRows);
    }
  };

  const togglePreviewModal = (imgSrc, spaceName, dimensions, location) =>
    modals.openModal({
      title: 'Preview',
      children: (
        <InventoryPreviewImage
          imgSrc={imgSrc}
          inventoryName={spaceName}
          dimensions={dimensions}
          location={location}
        />
      ),
      ...updatedModalConfig,
    });

  // Table Cell
  const RenderSerialNumberCell = useCallback(
    ({ row }) => generateSlNo(row.index, pages, limit),
    [pages, limit],
  );

  const RenderNameCell = useCallback(({ row }) => {
    const {
      photo,
      spaceName,
      isUnderMaintenance,
      bookingRange,
      originalUnit,
      _id,
      basicInformation,
      location,
      dimension,
    } = row.original;
    const unitLeft = getAvailableUnits(bookingRange, currentDate, currentDate, originalUnit);
    const occupiedState = getOccupiedState(unitLeft, originalUnit);
    return (
      <SpaceNamePhotoContent
        id={_id}
        spaceName={spaceName}
        dimensions={dimension}
        location={location?.city}
        spacePhoto={photo || basicInformation?.spacePhoto}
        occupiedStateLabel={occupiedState}
        isUnderMaintenance={isUnderMaintenance}
        togglePreviewModal={togglePreviewModal}
        isTargetBlank
      />
    );
  }, []);

  const RenderFaciaTowardsCell = useCallback(({ row }) => row.original.faciaTowards || '-', []);

  const RenderCityCell = useCallback(({ row }) => row.original.location.city || '-', []);

  const RenderAdditionalTagsCell = useCallback(
    ({ row }) => <AdditionalTagsContent list={row.original.additionalTags || []} />,
    [],
  );

  const RenderCategoryCell = useCallback(
    ({ row }) => <CategoryContent category={row.original.category} />,
    [],
  );

  const RenderSubCategoryCell = useCallback(
    ({ row }) => <SubCategoryContent subCategory={row.original.subCategory} />,
    [],
  );

  const RenderDimensionCell = useCallback(
    ({ row }) => <DimensionContent list={row.original.dimension} />,
    [],
  );

  const RenderMediaOwnerCell = useCallback(({ row }) => row.original.mediaOwner || '-', []);

  const RenderPeerCell = useCallback(({ row }) => row.original.peer || '-', []);

  const RenderInventoryIdCell = useCallback(({ row }) => row.original.inventoryId || '-', []);

  const RenderMediaTypeCell = useCallback(({ row }) => row.original.mediaType || '-', []);

  const RenderUploadMediaCell = useCallback(
    ({ row }) => <UploadMediaContent id={row.original._id} updateData={updateData} />,
    [updateData],
  );

  const onClickAddPrice = () => {
    if (!watchPlace?.length) {
      showNotification({
        title: 'Please select atleast one place to add price',
        color: 'blue',
      });
    } else if (watchPlace.some(item => !(item.startDate || item.endDate))) {
      showNotification({
        title: 'Please select the occupancy date to add price',
        color: 'blue',
      });
    } else {
      drawerActions.open();
    }
  };

  const COLUMNS = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        disableSortBy: true,
        Cell: RenderSerialNumberCell,
      },
      {
        Header: 'SPACE NAME & PHOTO',
        accessor: 'basicInformation.spaceName',
        Cell: RenderNameCell,
      },
      {
        Header: 'FACIA TOWARDS',
        accessor: 'location.faciaTowards',
        disableSortBy: true,
        Cell: RenderFaciaTowardsCell,
      },
      {
        Header: 'CITY',
        accessor: 'location.city',
        Cell: RenderCityCell,
      },
      {
        Header: 'ADDITIONAL TAGS',
        accessor: 'specifications.additionalTags',
        disableSortBy: true,
        Cell: RenderAdditionalTagsCell,
      },
      {
        Header: 'CATEGORY',
        accessor: 'basicInformation.category.name',
        Cell: RenderCategoryCell,
      },
      {
        Header: 'SUB CATEGORY',
        accessor: 'basicInformation.subCategory.name',
        Cell: RenderSubCategoryCell,
      },
      {
        Header: 'DIMENSION (WxH)',
        accessor: 'specifications.size.min',
        disableSortBy: true,
        Cell: RenderDimensionCell,
      },
      {
        Header: () => (
          <div className="flex justify-between">
            <span title="Tick to apply the same occupancy date to the selected rows.">
              OCCUPANCY DATE
            </span>
            <div className="pl-44">
              <input
                type="checkbox"
                title="Tick to apply the same occupancy  date to the selected rows."
                onChange={e => {
                  const firstSelectedRow = watchPlace[0] || {};
                  if (e.target.checked) {
                    applyDateRangeToAll(firstSelectedRow.startDate, firstSelectedRow.endDate);
                  }
                }}
              />
            </div>
          </div>
        ),
        accessor: 'scheduledDate',
        disableSortBy: true,
        Cell: ({
          row: {
            original: {
              bookingRange,
              startDate,
              endDate,
              previousStartDate,
              previousEndDate,
              originalUnit,
              _id,
              initialStartDate,
              initialEndDate,
            },
          },
        }) =>
          useMemo(() => {
            const isDisabled =
              watchPlace?.some(item => item._id === _id) && (!startDate || !endDate);
            const updatedBookingRange = bookingRange.filter(
              range =>
                range.startDate !==
                  dayjs(new Date(previousStartDate || initialStartDate || startDate))
                    .endOf('day')
                    .toISOString() &&
                range.endDate !==
                  dayjs(new Date(previousEndDate || initialEndDate || endDate))
                    .endOf('day')
                    .toISOString(),
            );

            const everyDayUnitsData = getEveryDayUnits(updatedBookingRange, originalUnit);

            return (
              <div className="min-w-[300px]">
                <DateRangeSelector
                  error={isDisabled}
                  dateValue={[startDate || null, endDate || null]}
                  
                onChange={val => handleDateRangeChange(val[0], val[1], _id)}
                  everyDayUnitsData={everyDayUnitsData}
                />
              </div>
            );
          }, [startDate, endDate, bookingRange, originalUnit, _id]),
      },
      {
        Header: 'UNIT',
        accessor: 'specifications.unit',
        Cell: ({
          row: {
            original: { bookingRange, unit, startDate, endDate, _id, availableUnit, originalUnit },
          },
        }) =>
          useMemo(() => {
            const isDisabled = !watchPlace?.some(
              item => item._id === _id && item.startDate !== null && item.endDate !== null,
            );
            const unitLeft = getAvailableUnits(bookingRange, startDate, endDate, originalUnit);
            const data = watchPlace ? watchPlace.find(item => item._id === _id) : {};
            const isExceeded =
              data?.startDate &&
              data?.endDate &&
              data?.unit > (bookingId ? unitLeft + (data?.initialUnit || 0) : unitLeft);
            return (
              <Tooltip
                label={
                  isExceeded
                    ? 'Exceeded maximum units available for selected date range'
                    : !unit
                    ? 'Field cannot be empty'
                    : null
                }
                opened={isExceeded || !unit}
                transitionProps={{ transition: 'slide-left' }}
                position="right"
                color="red"
                radius="sm"
                withArrow
              >
                <NumberInput
                  id={`unit-${_id}`}
                  hideControls
                  defaultValue={!data?.hasChangedUnit ? Number(data?.unit || 0) : unit}
                  min={1}
                  onChange={e => updateData('unit', e, _id, `unit-${_id}`)}
                  className="w-[100px]"
                  disabled={isDisabled}
                  error={isExceeded || !unit}
                />
              </Tooltip>
            );
          }, [startDate, endDate, unit, availableUnit]),
      },
      {
        Header: 'TRADED AMOUNT',
        accessor: 'tradedAmount',
        Cell: info =>
          useMemo(
            () => (
              <NumberInput
                id={`tradedAmount-${info.row.original._id}`}
                hideControls
                defaultValue={+(info.row.original.tradedAmount || 0)}
                onChange={e =>
                  updateData(
                    'tradedAmount',
                    e,
                    info.row.original._id,
                    `tradedAmount-${info.row.original._id}`,
                  )
                }
                disabled={info.row.original.peer === '-'}
              />
            ),
            [],
          ),
      },
      {
        Header: 'PRICE',
        Cell: ({ row: { original } }) =>
          useMemo(() => {
            const place = watchPlace.filter(item => item._id === original._id)?.[0];
            if (
              place?.priceChanged ||
              place?.displayCostPerMonth ||
              place?.totalPrintingCost ||
              place?.totalMountingCost ||
              place?.oneTimeInstallationCost ||
              place?.monthlyAdditionalCost ||
              place?.otherCharges ||
              place?.discountPercentage
            ) {
              return (
                <Button
                  onClick={() => {
                    onClickAddPrice();
                    setSelectedInventoryId(original._id);
                  }}
                  className="bg-purple-450 order-3"
                  size="xs"
                  disabled={!watchPlace.some(item => item._id === original._id)}
                >
                  Edit Price
                </Button>
              );
            }
            return (
              <Button
                onClick={() => {
                  onClickAddPrice();
                  setSelectedInventoryId(original._id);
                }}
                className="bg-purple-450 order-3"
                size="xs"
                disabled={!watchPlace.some(item => item._id === original._id)}
              >
                Add Price
              </Button>
            );
          }, [watchPlace]),
      },
      {
        Header: 'TOTAL PRICE',
        accessor: 'basicInformation.price',
        Cell: ({ row: { original } }) =>
          useMemo(() => {
            const place = watchPlace.filter(item => item._id === original._id)?.[0];
            return calculateTotalCostOfBooking(
              place,
              place?.unit,
              place?.startDate,
              place?.endDate,
            );
          }, []),
      },
      {
        Header: 'MEDIA OWNER NAME',
        accessor: 'basicInformation.mediaOwner.name',
        Cell: RenderMediaOwnerCell,
      },
      {
        Header: 'PEER',
        accessor: 'basicInformation.peerMediaOwner',
        Cell: RenderPeerCell,
      },
      {
        Header: 'INVENTORY ID',
        accessor: 'inventoryId',
        Cell: RenderInventoryIdCell,
      },
      {
        Header: 'MEDIA TYPE',
        accessor: 'basicInformation.mediaType.name',
        Cell: RenderMediaTypeCell,
      },
      {
        Header: 'FACING',
        accessor: 'location.facing',
        Cell: info => useMemo(() => <p>{info.row.original.facing || '-'}</p>),
      },
      {
        Header: 'UPLOAD MEDIA',
        accessor: '',
        disableSortBy: true,
        Cell: RenderUploadMediaCell,
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
                enableDelete={false}
                openInNewWindow
              />
            ),
            [],
          ),
      },
    ],
    [updatedInventoryData, watchPlace],
  );

  const toggleFilter = () => setShowFilter(!showFilter);

  const handleSearch = () => {
    searchParams.set('search', debouncedSearch);
    searchParams.set('page', debouncedSearch === '' ? pages : 1);
    setSearchParams(searchParams);
  };

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
    if (val !== '') searchParams.set(key, val);
    else searchParams.delete(key);
    setSearchParams(searchParams);
  };

  useEffect(() => {
    handleSearch();
    if (debouncedSearch === '') {
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (inventoryQuery.data?.docs) {
      const { docs, ...page } = inventoryQuery.data;
      const finalData = [];
      for (const item of docs) {
        const selectionItem = watchPlace?.find(pl => pl._id === item._id);
        const obj = {};
        obj.photo = item.basicInformation?.spacePhoto;
        obj._id = item._id;
        obj.spaceName = item.basicInformation?.spaceName;
        obj.inventoryId = item?.inventoryId;
        obj.isUnderMaintenance = item?.isUnderMaintenance;
        obj.additionalTags = item?.specifications?.additionalTags;
        obj.category = item?.basicInformation?.category?.name;
        obj.subCategory = item?.basicInformation?.subCategory?.name;
        obj.mediaOwner = item?.basicInformation?.mediaOwner?.name || '-';
        obj.peer = item?.basicInformation?.peerMediaOwner || '-';
        obj.dimension = item.specifications?.size;
        obj.originalUnit = item?.specifications?.unit || 1;
        obj.unit = item?.specifications?.unit || 1;
        obj.faciaTowards = item?.location?.faciaTowards;
        obj.location = item?.location;
        obj.mediaType = item.basicInformation?.mediaType?.name;
        obj.price = selectionItem?.price ?? (item?.basicInformation?.price || 0);
        obj.tradedAmount = selectionItem?.tradedAmount ?? 0;
        obj.campaigns = item?.campaigns;
        obj.facing = item?.location?.facing?.name;
        obj.startDate = getDate(selectionItem, item, 'startDate');
        obj.endDate = getDate(selectionItem, item, 'endDate');
        obj.bookingRange = item?.bookingRange ? item.bookingRange : [];
        obj.spacing = item.location.spacing;
        finalData.push(obj);
      }

      handleSortRowsOnTop(watchPlace, finalData);
      setPagination(page);
    }
  }, [inventoryQuery.data?.docs]);

  useEffect(() => {
    if (watchPlace?.length) {
      watchPlace.map(place =>
        setUpdatedInventoryData(prev =>
          prev.map(item =>
            item?._id === place?._id
              ? {
                  ...item,
                  ...place,
                }
              : item,
          ),
        ),
      );
    }
  }, [drawerOpened, watchPlace]);

  return (
    <>
      <div className="flex gap-2 py-5 flex-col">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-lg font-bold">Select Place for Order</p>
          </div>
          <div className="flex items-center">
            <Button
              className="bg-black mr-1"
              onClick={() => {
                onClickAddPrice();
                setSelectedInventoryId(watchPlace?.[0]?.id || watchPlace?.[0]?._id);
              }}
            >
              Add Price
            </Button>
            <Button onClick={toggleFilter} variant="default">
              <ChevronDown size={16} className="mr-1" /> Filter
            </Button>
            {showFilter && <Filter isOpened={showFilter} setShowFilter={setShowFilter} />}
          </div>
        </div>
        <div className="flex gap-4">
          <div>
            <p className="text-slate-400">Selected Places</p>
            <p className="font-bold">{watchPlace?.length}</p>
          </div>
          <div>
            <p className="text-slate-400">Total Price</p>
            <Group>
              <p className="font-bold">{toIndianCurrency(getTotalPrice(watchPlace))}</p>
              <p className="text-xs italic text-blue-500">** inclusive of GST</p>
            </Group>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <Group>
            <RowsPerPage
              setCount={currentLimit => {
                handlePagination('limit', currentLimit);
                setActiveLayout({ ...activeLayout, inventoryLimit: currentLimit });
              }}
              count={limit}
            />
            <p className="text-purple-450 text-sm">
              Total Places{' '}
              {inventoryQuery.data?.totalDocs ? (
                <span className="bg-purple-450 text-white py-1 px-2 rounded-full ml-2">
                  {inventoryQuery.data?.totalDocs}
                </span>
              ) : null}
            </p>
          </Group>
          <Search search={searchInput} setSearch={setSearchInput} />
        </div>
      </div>

      <Table
        data={updatedInventoryData}
        COLUMNS={COLUMNS}
        allowRowsSelect
        setSelectedFlatRows={handleSelection}
        selectedRowData={watchPlace}
        handleSorting={handleSortByColumn}
        activePage={pagination.page}
        totalPages={pagination.totalPages}
        setActivePage={currentPage => handlePagination('page', currentPage)}
        loading={inventoryQuery.isLoading}
      />
      <AddEditPriceDrawer
        isOpened={drawerOpened}
        onClose={drawerActions.close}
        selectedInventories={watchPlace}
        data={updatedInventoryData}
        selectedInventoryId={selectedInventoryId}
        type="bookings"
      />
    </>
  );
};

export default SelectSpace;
