import {  useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Table from '../../components/Table/Table';
import toIndianCurrency from '../../utils/currencyFormat';
import { useModals } from '@mantine/modals';
import { useFetchInventoryReportList } from '../../apis/queries/inventory.queries';
import PerformanceCard from '../../components/modules/newReports/performanceCard';
import RowsPerPage from '../../components/RowsPerPage';
import { categoryColors, generateSlNo } from '../../utils';
import SpaceNamePhotoContent from '../../components/modules/inventory/SpaceNamePhotoContent';
import { Badge } from '@mantine/core';

const PerformanceReport = () => {
 
  const modals = useModals();
  const [searchParams1, setSearchParams1] = useSearchParams({
    limit: 20,
    page: 1,
    sortOrder: 'desc',
    sortBy: 'revenue',
  });

  const { data: inventoryReportList, isLoading: inventoryReportListLoading } =
    useFetchInventoryReportList(searchParams1.toString());

  const page = searchParams1.get('page');
  const limit = searchParams1.get('limit');

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

  const inventoryColumn = [
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
        useMemo(
          () => (
            <SpaceNamePhotoContent
              id={info.row.original._id}
              spaceName={info.row.original.basicInformation?.spaceName}
              spacePhoto={info.row.original.basicInformation?.spacePhoto}
              dimensions={info.row.original.specifications?.size}
              location={info.row.original.location?.city}
              togglePreviewModal={togglePreviewModal}
              isTargetBlank
            />
          ),
          [],
        ),
    },
    {
      Header: 'CATEGORY',
      accessor: 'basicInformation.category.name',
      Cell: ({
        row: {
          original: { basicInformation },
        },
      }) =>
        useMemo(() => {
          const colorType = Object.keys(categoryColors).find(
            key => categoryColors[key] === basicInformation?.category?.name,
          );

          return (
            <div>
              {basicInformation?.category?.name ? (
                <Badge color={colorType || 'gray'} size="lg" className="capitalize">
                  {basicInformation.category.name}
                </Badge>
              ) : (
                '-'
              )}
            </div>
          );
        }, []),
    },
    {
      Header: 'TOTAL REVENUE (In lac)',
      accessor: 'revenue',
      Cell: ({
        row: {
          original: { revenue },
        },
      }) =>
        useMemo(() => {
          const revenueInLacs = (revenue ?? 0) / 100000; // Convert revenue to lacs
          return <p className="w-fit mr-2">{toIndianCurrency(revenueInLacs)}</p>;
        }, []),
    },
    {
      Header: 'TOTAL BOOKING',
      accessor: 'totalBookings',
      Cell: ({
        row: {
          original: { totalBookings },
        },
      }) => useMemo(() => <p className="w-fit">{totalBookings}</p>, [totalBookings]),
    },
  ];

  const handleSortByColumn = colId => {
    if (searchParams1.get('sortBy') === colId && searchParams1.get('sortOrder') === 'desc') {
      searchParams1.set('sortOrder', 'asc');
      setSearchParams1(searchParams1);
      return;
    }
    if (searchParams1.get('sortBy') === colId && searchParams1.get('sortOrder') === 'asc') {
      searchParams1.set('sortOrder', 'desc');
      setSearchParams1(searchParams1);
      return;
    }

    searchParams1.set('sortBy', colId);
    setSearchParams1(searchParams1);
  };

  const handlePagination = (key, val) => {
    if (val !== '') searchParams1.set(key, val);
    else searchParams1.delete(key);
    setSearchParams1(searchParams1);
  };
  return (
    <div className="overflow-y-auto p-5 col-span-10 w-[65rem]">
      
      <p className="font-bold pt-6">Performance Ranking Report</p>
      <p className="text-sm text-gray-600 italic pt-2">
        This report shows Performance Cards with pagination controls and a sortable, paginated
        table.
      </p>
      <PerformanceCard />

      <div className="col-span-12 md:col-span-12 lg:col-span-10 border-gray-450">
        <div className="flex justify-between h-20 items-center">
          <RowsPerPage
            setCount={currentLimit => handlePagination('limit', currentLimit)}
            count={limit}
          />
        </div>

        <Table
          COLUMNS={inventoryColumn}
          data={inventoryReportList?.docs || []}
          handleSorting={handleSortByColumn}
          activePage={inventoryReportList?.page || 1}
          totalPages={inventoryReportList?.totalPages || 1}
          setActivePage={currentPage => handlePagination('page', currentPage)}
          loading={inventoryReportListLoading}
        />
      </div>
    </div>
  );
};

export default PerformanceReport;
