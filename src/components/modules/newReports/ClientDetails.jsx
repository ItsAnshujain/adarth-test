import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { Menu, Button } from '@mantine/core';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
dayjs.extend(quarterOfYear);
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  LogarithmicScale,
} from 'chart.js';
import { useBookingsNew } from '../../../apis/queries/booking.queries';
import Table from '../../Table/Table';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  LogarithmicScale,
);
  const viewBy2 = {
    reset: '',
    newInclusion: 'New Inclusion',
    oldRetention: 'Old Retention',
  };
  
  const list2 = [
    { label: 'New Inclusion', value: 'newInclusion' },
    { label: 'Old Retention', value: 'oldRetention' },
  ];
const ClientDetails = () => {
  const [searchParams] = useSearchParams({
    page: 1,
    limit: 1000,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: bookingData2, isLoading: isLoadingBookingData } = useBookingsNew(
    searchParams.toString(),
  );

  // client details
  const getFinancialYear1 = date => {
    const fiscalYearStartMonth = 4; // April
    const currentDate = new Date();
    const fiscalYearStart = new Date(currentDate.getFullYear(), fiscalYearStartMonth - 1, 1);
    return date >= fiscalYearStart ? 'newInclusion' : 'oldRetention';
  };
  const [filter2, setFilter2] = useState('');
  const [activeView2, setActiveView2] = useState('');

  const handleReset2 = () => {
    setFilter2('');
    setActiveView2('');
  };

  const handleMenuItemClick2 = value => {
    setFilter2(value);
    setActiveView2(value);
  };

  const tableData4 = useMemo(() => {
    if (!bookingData2) return [];

    return bookingData2
      .map(booking => {
        const { totalAmount, details, campaign } = booking;
        const firstDetail = details[0] || {};
        const client = firstDetail.client || {};

        if (!client.clientType) return null;

        const firstBookingDate = new Date(booking.createdAt);
        const revenue = (totalAmount / 100000).toFixed(2) || 0;

        const totalOperationalCost = (campaign?.spaces?.operationalCosts || []).reduce(
          (sum, cost) => sum + cost.amount,
          0,
        );

        const profitability =
          revenue > 0
            ? (((revenue * 100000 - totalOperationalCost) / (revenue * 100000)) * 100).toFixed(2) +
              '%'
            : '0%';

        const retentionStatus = getFinancialYear1(firstBookingDate);
        if (filter2 && retentionStatus !== filter2) {
          return null;
        }

        const timeline = firstBookingDate.toLocaleString('en-US', {
          month: 'short',
          year: 'numeric',
        });

        return {
          clientCategory: client.clientType,
          name: client.name || 'N/A',
          timeline,
          retentionStatus: viewBy2[retentionStatus],
          revenue,
          profitability,
        };
      })
      .filter(Boolean);
  }, [bookingData2, filter2]);

  const tableColumns4 = useMemo(() => {
    return [
      {
        Header: 'Client Type Category',
        accessor: 'clientCategory',
        disableSortBy: true,
      },
      {
        Header: 'Names',
        accessor: 'name',
        disableSortBy: true,
      },
      {
        Header: 'TimeLine',
        accessor: 'timeline',
        disableSortBy: true,
      },
      {
        Header: 'Retention Status',
        accessor: 'retentionStatus',
        disableSortBy: true,
      },
      {
        Header: 'Revenue (lac)',
        accessor: 'revenue',
        disableSortBy: true,
      },
      {
        Header: 'Profitability (%)',
        accessor: 'profitability',
        disableSortBy: true,
      },
    ];
  }, []);

  // client details

  return (
    <div className="flex flex-col col-span-10 overflow-x-hidden">
          <div className="pt-10 w-[50rem] ml-8">
            <p className="font-bold ">Client Details</p>
            <p className="text-sm text-gray-600 italic py-4">
              This report shows the client details based on retention status.
            </p>
            <div className="flex">
              <div>
                <Menu shadow="md" width={130}>
                  <Menu.Target>
                    <Button className="secondary-button">
                      View By: {viewBy2[activeView2] || 'Retention Status'}
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {list2.map(({ label, value }) => (
                      <Menu.Item
                        key={value}
                        onClick={() => handleMenuItemClick2(value)}
                        className={
                          activeView2 === value && label !== 'Reset'
                            ? 'text-purple-450 font-medium'
                            : ''
                        }
                      >
                        {label}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              </div>
              <div>
                {filter2 && (
                  <Button onClick={handleReset2} className="mx-2 secondary-button">
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="ml-8 my-5 col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 h-[400px] overflow-auto">
            <Table
              COLUMNS={tableColumns4}
              data={tableData4}
              loading={isLoadingBookingData}
              showPagination={false}
            />
          </div>
        </div>
  );
};

export default ClientDetails;
