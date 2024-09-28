import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Folder } from 'react-feather';
import { Box, Loader, Text } from '@mantine/core';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';
import Header from '../../components/modules/finance/Header';
import { useFetchFinanceByYear } from '../../apis/queries/finance.queries';
import { months } from '../../utils';

const FinanceMonthlyPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { year } = useParams();
  const { data: financialDataByYear, isLoading } = useFetchFinanceByYear(year);
  const [updatedFinanceData, setUpdatedFinanceData] = useState([]);

  const handleNavigation = finance => {
    navigate(`${finance?._id}`, {
      state: {
        totalPurchaseOrder: finance?.totalPurchaseOrder,
        totalReleaseOrder: finance?.totalReleaseOrder,
        totalInvoices: finance?.totalInvoices,
      },
    });
  };

  useEffect(() => {
    if (financialDataByYear) {
      const tempData = { ...financialDataByYear };
      setUpdatedFinanceData(() => {
        const tempArr = [];
        Object.keys(tempData[0]).forEach(key => {
          tempData[0][key].forEach(ele => {
            const index = tempArr.findIndex(item => item._id === ele._id);
            if (index > -1) {
              tempArr[index] = { ...tempArr[index], [key]: (tempArr[index][key] || 0) + ele.total };
            } else tempArr.push({ _id: ele._id, [key]: ele.total });
          });
        });

        return tempArr;
      });
    }
  }, [financialDataByYear]);

  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto px-5">
      <Header {...state} />
      <div className="flex flex-wrap gap-4">
        {!financialDataByYear?.length && !isLoading ? (
          <div className="w-full mt-20">
            <Text size="lg" className="text-center">
              No financial record found
            </Text>
          </div>
        ) : null}
        <div className="w-full">{isLoading ? <Loader className="w-full mt-20" /> : null}</div>

        {updatedFinanceData?.map(finance => (
          <Box
            key={uuidv4()}
            onClick={() => handleNavigation(finance)}
            className="flex flex-col gap-2 p-4 border rounded-lg cursor-pointer"
          >
            <Folder size={32} strokeWidth="1.2" />
            {finance?._id ? (
              <p className="font-bold text-lg">{months[finance._id - 1 || 0]}</p>
            ) : null}
            <div className="flex flex-col">
              <div className="flex">
                <p className="text-sm font-medium text-slate-400 mr-2">Total Purchase Orders</p>
                <p className="text-green-400">{finance?.totalPurchaseOrder || 0}</p>
              </div>
              <div className="flex">
                <p className="text-sm font-medium text-slate-400 mr-2">Total Release Orders</p>
                <p className="text-purple-400">{finance?.totalReleaseOrder || 0}</p>
              </div>
              <div className="flex">
                <p className="text-sm font-medium text-slate-400 mr-2">Total Invoices</p>
                <p className="text-orange-400">{finance?.totalInvoices || 0}</p>
              </div>
            </div>
          </Box>
        ))}
      </div>
    </div>
  );
};

export default FinanceMonthlyPage;
