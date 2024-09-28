import { useMemo, useState, useEffect } from 'react';
import { Text, Button, NumberInput, Badge, Group, Tooltip } from '@mantine/core';
import { ChevronDown } from 'react-feather';
import isBetween from 'dayjs/plugin/isBetween';
import dayjs from 'dayjs';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { useModals } from '@mantine/modals';
import { v4 as uuidv4 } from 'uuid';
import shallow from 'zustand/shallow';
import { showNotification } from '@mantine/notifications';
import { useFormContext } from 'react-hook-form';
import Search from '../../Search';
import toIndianCurrency from '../../../utils/currencyFormat';
import Table from '../../Table/Table';
import { useFetchInventory } from '../../../apis/queries/inventory.queries';
import {
  calculateTotalArea,
  calculateTotalCostOfBooking,
  calculateTotalMonths,
  calculateTotalPrintingOrMountingCost,
  categoryColors,
  currentDate,
  debounce,
  generateSlNo,
  getAvailableUnits,
  getDate,
  getEveryDayUnits,
  getOccupiedState,
  getUpdatedProposalData,
  stringToColour,
} from '../../../utils';
import Filter from '../inventory/Filter';
import SpacesMenuPopover from '../../Popovers/SpacesMenuPopover';
import DateRangeSelector from '../../DateRangeSelector';
import RowsPerPage from '../../RowsPerPage';
import modalConfig from '../../../utils/modalConfig';
import useLayoutView from '../../../store/layout.store';
import SpaceNamePhotoContent from '../inventory/SpaceNamePhotoContent';
import AddEditPriceDrawer from '../bookings/Create/AddEditPriceDrawer';
import SelectColumns from './SelectColumns';
import { proposalColumns } from '../../../utils/constants';
import DimensionContent from '../inventory/DimensionContent';
import InventoryPreviewImage from '../../shared/InventoryPreviewImage';

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

const Spaces = () => {
  const modals = useModals();
  const { id: proposalId } = useParams();
  const form = useFormContext();
  const [drawerOpened, drawerActions] = useDisclosure();
  const watchSpaces = form.watch('spaces') || [];

  const [showDateRangeOptions, setShowDateRangeOptions] = useState(false);
  const { activeLayout, setActiveLayout } = useLayoutView(
    state => ({
      activeLayout: state.activeLayout,
      setActiveLayout: state.setActiveLayout,
    }),
    shallow,
  );
  const selectedInventoryIds = useMemo(() => watchSpaces.map(space => space._id), [watchSpaces]);
  const [searchParams, setSearchParams] = useSearchParams({
    limit: activeLayout.inventoryLimit || 20,
    page: 1,
    sortOrder: 'desc',
    sortBy: 'createdAt',
    isUnderMaintenance: false,
    isActive: true,
    ids: selectedInventoryIds.join(','),
  });
  const [searchInput, setSearchInput] = useState('');
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 800);
  const [updatedInventoryData, setUpdatedInventoryData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [showFilter, setShowFilter] = useState(false);
  const [showSelectColumns, selectColumnsActions] = useDisclosure(false);

  const pages = searchParams.get('page');
  const limit = searchParams.get('limit');
  const { data: inventoryData, isLoading } = useFetchInventory(searchParams.toString());

  const toggleFilter = () => setShowFilter(!showFilter);

  const handleDateRangeChange = (startDate, endDate, id) => {
    setShowDateRangeOptions(prev => ({
      ...prev,
      [id]: true,
    }));

    updateData('dateRange', [startDate, endDate], id, null, false);
  };

  const applyDateRangeToAll = (startDate, endDate) => {
    const selectedIds = watchSpaces.map(space => space._id);

    updateData('dateRange', [startDate, endDate], null, null, true, selectedIds);
    setShowDateRangeOptions({});
  };

  const updateData = debounce((key, val, id, inputId, applyToAll, selectedIds = []) => {
    if (key === 'dateRange') {
      const totalMonths = calculateTotalMonths(val[0], val[1]);

      setUpdatedInventoryData(prev => {
        return prev.map(item => {
          const space = watchSpaces.find(sp => sp._id === item._id);
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
        'spaces',
        watchSpaces.map(item => {
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
        'spaces',
        watchSpaces.map(item => {
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

  const onClickAddPrice = () => {
    if (!watchSpaces?.length) {
      showNotification({
        title: 'Please select atleast one place to add price',
        color: 'blue',
      });
    } else if (watchSpaces.some(item => !(item.startDate || item.endDate))) {
      showNotification({
        title: 'Please select the proposal date to add price',
        color: 'blue',
      });
    } else {
      drawerActions.open();
    }
  };

  const getTotalPrice = (places = []) => {
    const totalPrice = places.reduce(
      (acc, item) =>
        acc + calculateTotalCostOfBooking(item, item?.unit, item?.startDate, item?.endDate),
      0,
    );

    return totalPrice || 0;
  };

  const COLUMNS = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{generateSlNo(info.row.index, pages, limit)}</p>, []),
      },
      {
        Header: 'SPACE NAME & PHOTO',
        accessor: 'basicInformation.spaceName',
        Cell: ({
          row: {
            original: {
              _id,
              spaceName,
              spacePhoto,
              isUnderMaintenance,
              bookingRange,
              originalUnit,
              dimension,
              location,
            },
          },
        }) =>
          useMemo(() => {
            const unitLeft = getAvailableUnits(
              bookingRange,
              currentDate,
              currentDate,
              originalUnit,
            );
            const occupiedState = getOccupiedState(unitLeft, originalUnit);

            return (
              <SpaceNamePhotoContent
                id={_id}
                spaceName={spaceName}
                spacePhoto={spacePhoto}
                dimensions={dimension}
                location={location?.city}
                occupiedStateLabel={occupiedState}
                isUnderMaintenance={isUnderMaintenance}
                togglePreviewModal={togglePreviewModal}
                isTargetBlank
              />
            );
          }, []),
      },
      {
        Header: 'FACIA TOWARDS',
        accessor: 'location.faciaTowards',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{info.row.original.faciaTowards || '-'}</p>, []),
      },
      {
        Header: 'CITY',
        accessor: 'location.city',
        Cell: ({
          row: {
            original: { location, city },
          },
        }) => useMemo(() => <p>{location.city || city || '-'}</p>, []),
      },
      {
        Header: 'ADDITIONAL TAGS',
        accessor: 'specifications.additionalTags',
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
        accessor: 'basicInformation.category.name',
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
        Header: 'SUB CATEGORY',
        accessor: 'basicInformation.subCategory.name',
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
        accessor: 'specifications.size.min',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { dimension },
          },
        }) => useMemo(() => <DimensionContent list={dimension} />, []),
      },
      {
        Header: 'PRICE',
        Cell: ({ row: { original } }) =>
          useMemo(() => {
            const place = watchSpaces.filter(item => item._id === original._id)?.[0];

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
                  disabled={
                    !watchSpaces.some(item => item._id === original._id) &&
                    (!original.startDate || !original.endDate)
                  }
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
                disabled={
                  !watchSpaces.some(item => item._id === original._id) &&
                  (!original.startDate || !original.endDate)
                }
              >
                Add Price
              </Button>
            );
          }),
      },
      {
        Header: 'TOTAL PRICE',
        accessor: 'price',
        Cell: ({ row: { original } }) =>
          useMemo(() => {
            // const place = watchSpaces.filter(item => item._id === original._id)?.[0];
            // return place?.price || 0;
            const place = watchSpaces.filter(item => item._id === original._id)?.[0];
            const totalPrice = calculateTotalCostOfBooking(
              place,
              place?.unit,
              place?.startDate,
              place?.endDate,
            );
            return place?.startDate && place?.endDate && totalPrice > 0
              ? toIndianCurrency(totalPrice)
              : '-';
          }, []),
      },
      {
        Header: () => (
          <div className="flex justify-between">
            <span title="Tick to apply the same proposal date to the selected rows.">
              PROPOSAL DATE
            </span>
            {/* Render "Apply to All" checkbox in the header */}
            <div className="pl-44">
              <input
                type="checkbox"
                title="Tick to apply the same proposal date to the selected rows."
                onChange={e => {
                  // Get the first selected row's date range or default to null if none are selected
                  const firstSelectedRow = watchSpaces[0] || {};
                  if (e.target.checked) {
                    // If checkbox is checked, apply date range to all selected rows
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
            original: { bookingRange, startDate, endDate, _id, originalUnit },
          },
        }) => {
          const isError = watchSpaces.some(item => item._id === _id) && (!startDate || !endDate);
          const isDisabled = !watchSpaces.some(item => item._id === _id);
          const everyDayUnitsData = getEveryDayUnits(bookingRange, originalUnit);

          return (
            <div className="min-w-[300px]">
              <DateRangeSelector
                error={isError}
                dateValue={[startDate || null, endDate || null]}
                onChange={val => handleDateRangeChange(val[0], val[1], _id)}
                everyDayUnitsData={everyDayUnitsData}
                disabled={isDisabled}
              />
            </div>
          );
        },
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
            const isDisabled = !watchSpaces.some(
              item => item._id === _id && item.startDate !== null && item.endDate !== null,
            );

            const unitLeft = getAvailableUnits(bookingRange, startDate, endDate, originalUnit);
            const data = watchSpaces ? watchSpaces.find(item => item._id === _id) : {};
            const isExceeded = data?.unit > (proposalId ? unitLeft : data?.availableUnit);
            return (
              <Tooltip
                label={
                  data?.hasChangedUnit && isExceeded
                    ? 'Exceeded maximum units available for selected date range'
                    : !unit
                    ? 'Field cannot be empty'
                    : null
                }
                opened={(data?.hasChangedUnit && isExceeded) || !unit}
                transitionProps={{ transition: 'slide-left' }}
                position="right"
                color="red"
                radius="sm"
                withArrow
              >
                <NumberInput
                  hideControls
                  defaultValue={!data?.hasChangedUnit ? Number(data?.unit || 0) : unit}
                  min={1}
                  onChange={e => updateData('unit', e, _id)}
                  className="w-[100px]"
                  disabled={isDisabled}
                  error={(data?.hasChangedUnit && isExceeded) || !unit}
                />
              </Tooltip>
            );
          }, [startDate, endDate, unit, availableUnit]),
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
            original: { mediaOwner },
          },
        }) => useMemo(() => <p className="w-fit">{mediaOwner}</p>, []),
      },
      {
        Header: 'PEER',
        accessor: 'basicInformation.peerMediaOwner',
        Cell: ({
          row: {
            original: { peer },
          },
        }) => useMemo(() => <p className="w-fit">{peer}</p>, []),
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
        accessor: 'location.facing',
        Cell: info => useMemo(() => <p>{info.row.original.facing || '-'}</p>),
      },
      {
        Header: 'ACTION',
        accessor: 'action',
        disableSortBy: true,
        Cell: ({
          row: {
            original: { _id },
          },
        }) =>
          useMemo(
            () => <SpacesMenuPopover itemId={_id} enableDelete={false} openInNewWindow />,
            [],
          ),
      },
    ],
    [updatedInventoryData, watchSpaces],
  );

  const handleSortRowsOnTop = (spaces, rows) => {
    setUpdatedInventoryData(() => {
      const arr1 = [];
      const arr2 = [];
      rows.forEach(item => {
        if (spaces.some(space => space._id === item._id)) {
          arr1.push(item);
        } else {
          arr2.push(item);
        }
      });
      if (arr1.length < spaces.length) {
        return [...spaces, ...arr2];
      }
      return [...arr1, ...arr2];
    });
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

  const handleSearch = () => {
    searchParams.set('search', debouncedSearch);
    searchParams.set('page', debouncedSearch === '' ? pages : 1);
    setSearchParams(searchParams);
  };

  const handleSelection = selectedRows => {
    const updatedSelectedRows = selectedRows.map(row => ({
      ...row,
      displayCostPerMonth:
        row.displayCostPerMonth || (!row.priceChanged && !row?.pricingDetails?.price && row.price),
    }));

    const newAddedRow = updatedSelectedRows.filter(
      selectedRow => !watchSpaces.find(addedRow => selectedRow._id === addedRow._id),
    );
    const filteredRowWithApplyToAll = updatedSelectedRows.filter(
      row => row.applyPrintingMountingCostForAll,
    );

    if (filteredRowWithApplyToAll?.length > 0 && newAddedRow.length > 0) {
      const updatedSelectedRowsForApplyToAll = getUpdatedProposalData(
        filteredRowWithApplyToAll?.[0],
        filteredRowWithApplyToAll?.[0]?._id,
        updatedSelectedRows,
        calculateTotalCostOfBooking(
          { ...filteredRowWithApplyToAll?.[0], ...form.watch() },
          filteredRowWithApplyToAll?.[0]?.unit,
          filteredRowWithApplyToAll?.[0]?.startDate,
          filteredRowWithApplyToAll?.[0]?.endDate,
        ),
      );
      form.setValue('spaces', updatedSelectedRowsForApplyToAll);
      handleSortRowsOnTop(updatedSelectedRowsForApplyToAll, updatedInventoryData);
    } else {
      handleSortRowsOnTop(updatedSelectedRows, updatedInventoryData);
      form.setValue('spaces', updatedSelectedRows);
    }
  };
  const handlePagination = (key, val) => {
    if (val !== '') searchParams.set(key, val);
    else searchParams.delete(key);
    setSearchParams(searchParams);
  };

  useEffect(() => {
    if (inventoryData) {
      const { docs, ...page } = inventoryData;
      const finalData = [];

      for (const item of docs) {
        const selectionItem = watchSpaces.find(pl => pl._id === item._id);

        const obj = {};
        obj._id = item._id;
        obj.spaceName = item?.basicInformation?.spaceName;
        obj.spacePhoto = item?.basicInformation?.spacePhoto;
        obj.inventoryId = item?.inventoryId;
        obj.isUnderMaintenance = item?.isUnderMaintenance;
        obj.mediaOwner = item?.basicInformation?.mediaOwner?.name || '-';
        obj.peer = item?.basicInformation?.peerMediaOwner || '-';
        obj.originalUnit = item?.specifications?.unit || 1;
        obj.unit = item?.specifications?.unit || 1;
        obj.additionalTags = item?.specifications?.additionalTags;
        obj.category = item?.basicInformation?.category?.name;
        obj.subCategory = item?.basicInformation?.subCategory?.name;
        obj.dimension = item.specifications?.size;
        obj.location = item?.location;
        obj.faciaTowards = item?.location?.faciaTowards;
        obj.mediaType = item?.basicInformation?.mediaType?.name;
        obj.price = selectionItem?.price ?? (item?.basicInformation?.price || 0);
        obj.bookingRange = item?.bookingRange ? item.bookingRange : [];
        obj.facing = item?.location?.facing?.name;
        obj.startDate = getDate(selectionItem, item, 'startDate');
        obj.endDate = getDate(selectionItem, item, 'endDate');
        finalData.push(obj);
      }
      handleSortRowsOnTop(watchSpaces, finalData);
      setPagination(page);
      setUpdatedInventoryData(finalData); // Update the state with the filtered/sorted data
    }
  }, [inventoryData]);

  useEffect(() => {
    handleSearch();
    if (debouncedSearch === '') {
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (watchSpaces.length) {
      watchSpaces.map(place =>
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
  }, [drawerOpened, watchSpaces]);

  return (
    <>
      <div className="flex gap-2 py-5 flex-col">
        <div className="flex justify-between items-center">
          <Text size="lg" weight="bold">
            Select Place for Proposal
          </Text>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Button
                className="bg-black mr-1"
                onClick={() => {
                  onClickAddPrice();
                  setSelectedInventoryId(watchSpaces?.[0]?.id || watchSpaces?.[0]?._id);
                }}
                disabled={isLoading}
              >
                Add Price
              </Button>
              <Button onClick={selectColumnsActions.open} variant="default" className="mr-1">
                <ChevronDown size={16} className="mr-1" /> Select Columns
              </Button>
              {showSelectColumns && (
                <SelectColumns
                  isOpened={showSelectColumns}
                  onClose={selectColumnsActions.close}
                  columns={proposalColumns}
                />
              )}
              <Button onClick={toggleFilter} variant="default">
                <ChevronDown size={16} className="mr-1" /> Filter
              </Button>
              {showFilter && <Filter isOpened={showFilter} setShowFilter={setShowFilter} />}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div>
            <Text color="gray">Selected Places</Text>
            <Text weight="bold">{watchSpaces.length}</Text>
          </div>
          <div>
            <Text color="gray">Total Price</Text>
            <Group>
              <Text weight="bold">
                {getTotalPrice(watchSpaces) > 0 &&
                !watchSpaces.some(item => !(item.startDate || item.endDate))
                  ? toIndianCurrency(getTotalPrice(watchSpaces))
                  : '-'}
              </Text>
              <p className="text-xs italic text-blue-500">** exclusive of GST</p>
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
            <Text size="sm" className="text-purple-450">
              Total Places{' '}
              {inventoryData?.totalDocs ? (
                <span className="bg-purple-450 text-white py-1 px-2 rounded-full ml-2">
                  {inventoryData.totalDocs}
                </span>
              ) : null}
            </Text>
          </Group>
          <Search search={searchInput} setSearch={setSearchInput} />
        </div>
      </div>
      <Table
        data={updatedInventoryData}
        COLUMNS={COLUMNS}
        allowRowsSelect
        setSelectedFlatRows={handleSelection}
        selectedRowData={watchSpaces}
        handleSorting={handleSortByColumn}
        activePage={pagination.page}
        totalPages={pagination.totalPages}
        setActivePage={currentPage => handlePagination('page', currentPage)}
        loading={isLoading}
      />
      <AddEditPriceDrawer
        isOpened={drawerOpened}
        onClose={drawerActions.close}
        selectedInventories={watchSpaces}
        data={updatedInventoryData}
        selectedInventoryId={selectedInventoryId}
        type="proposal"
      />{' '}
    </>
  );
};

export default Spaces;
