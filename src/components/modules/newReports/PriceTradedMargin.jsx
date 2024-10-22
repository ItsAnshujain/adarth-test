import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { Menu, Button, MultiSelect, Text } from '@mantine/core';
import DateRangeSelector from '../../../components/DateRangeSelector';
import { useDistinctAdditionalTags, useFetchInventory } from '../../../apis/queries/inventory.queries';
import classNames from 'classnames';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { useBookings, useBookingsNew } from '../../../apis/queries/booking.queries';
import Table from '../../Table/Table';
import { useFetchMasters } from '../../../apis/queries/masters.queries';
import { generateSlNo, serialize } from '../../../utils';
import { Link } from 'react-router-dom';
import toIndianCurrency from '../../../utils/currencyFormat';
import { DATE_FORMAT } from '../../../utils/constants';

const PriceTradedMargin = () => {
    const [searchParams3, setSearchParams3] = useSearchParams({
        page: 1,
        limit: 500,
        sortBy: 'basicInformation.spaceName',
        sortOrder: 'desc',
        isActive: true,
      });

  const { data: inventoryData, isLoading: isLoadingInventoryData } = useFetchInventory(
    searchParams3.toString(),
  );

  const processedData = useMemo(() => {
    if (!inventoryData?.docs?.length) return [];

    const cityData = {};

    inventoryData.docs.forEach(inventory => {
      const city = inventory.location?.city;
      if (!city) return;

      let totalCityPrice = 0;
      let totalCityTradedAmount = 0;

      inventory.campaigns?.forEach(campaign => {
        campaign.place?.forEach(place => {
          totalCityPrice += place.price || 0;
          totalCityTradedAmount += place.tradedAmount || 0;
        });
      });

      const tradedMargin = totalCityPrice - totalCityTradedAmount;
      const percentageMargin = totalCityPrice
        ? ((tradedMargin / totalCityPrice) * 100).toFixed(2)
        : 0;

      if (!cityData[city]) {
        cityData[city] = {
          city,
          totalPrice: totalCityPrice,
          totalTradedAmount: totalCityTradedAmount,
          tradedMargin,
          percentageMargin,
        };
      } else {
        cityData[city].totalPrice += totalCityPrice;
        cityData[city].totalTradedAmount += totalCityTradedAmount;
        cityData[city].tradedMargin += tradedMargin;
        cityData[city].percentageMargin = (
          (cityData[city].tradedMargin / cityData[city].totalPrice) *
          100
        ).toFixed(2);
      }
    });

    const sortedData = Object.values(cityData).sort((a, b) => b.tradedMargin - a.tradedMargin);

    return sortedData;
  }, [inventoryData]);

  const columns3 = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'id',
        disableSortBy: true,
        Cell: info => useMemo(() => <p>{generateSlNo(info.row.index, 1, 1000)}</p>, []),
      },
      {
        Header: 'City',
        accessor: 'city',
        disableSortBy: true,
        Cell: info => <p>{info.value}</p>,
      },
      {
        Header: 'Price ',
        accessor: 'totalPrice',
        disableSortBy: true,
        Cell: info => <p>{(info.value / 100000).toFixed(2)}</p>,
      },
      {
        Header: 'Traded Price',
        accessor: 'totalTradedAmount',
        disableSortBy: true,
        Cell: info => <p>{(info.value / 100000).toFixed(2)}</p>,
      },
      {
        Header: 'Traded Margin',
        accessor: 'tradedMargin',
        disableSortBy: true,
        Cell: info => <p>{(info.value / 100000).toFixed(2)}</p>,
      },
      {
        Header: 'Percentage Margin (%)',
        accessor: 'percentageMargin',
        disableSortBy: true,
        Cell: info => {
          const percentageMargin =
            isNaN(info.value) || info.value === null ? '-' : `${info.value}%`;
          return <p>{percentageMargin}</p>;
        },
      },
    ],
    [],
  );

  // traded margin report
  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 overflow-y-auto p-5">
    <p className="font-bold">Price and Traded Margin Report</p>
    <p className="text-sm text-gray-600 italic py-4">
      This report provide insights into the pricing trends, traded prices, and margins grouped
      by cities. (Amounts in Lacs)
    </p>
    <div className="overflow-y-auto h-[400px]">
      <Table
        data={processedData || []}
        COLUMNS={columns3}
        loading={isLoadingInventoryData}
        showPagination={false}
      />
    </div>
  </div>
  );
};

export default PriceTradedMargin;
