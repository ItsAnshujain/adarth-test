import {
  downloadPdf,
} from '../../utils';
import { Download, Loader } from 'react-feather';
import {Button } from '@mantine/core';
import PerformanceCard from '../../components/modules/newReports/performanceCard';
import RevenueCards from '../../components/modules/newReports/RevenueCards';
import { downloadExcel } from '../../apis/requests/report.requests';
import { useDownloadExcel, useShareReport } from '../../apis/queries/report.queries';
import { showNotification } from '@mantine/notifications';
import MediaWiseReport from '../OtherMediaReport/MediaWiseReport';
import TagwiseReport from '../../components/modules/newReports/TagwiseReport';
import SalesDistribution from '../../components/modules/newReports/SalesDistribution';
import SalesComparision from '../../components/modules/newReports/SalesComparision';
import RevenueDistribution from '../../components/modules/newReports/RevenueDistribution';
import CategoryWiseReport from '../../components/modules/newReports/CategoryWiseReport';
import RevenueAndIndustriGraph from '../../components/modules/newReports/RevenueAndIndustriGraph';
import SourceClientDistribution from '../../components/modules/newReports/SourceClientDistribution';
import OperationalCosts from '../../components/modules/newReports/OperationalCosts';
import PrintingMountingCosts from '../../components/modules/newReports/PrintingMountingCosts';
import CampaignDetails from '../../components/modules/newReports/CampaignDetails';
import ClientDetails from '../../components/modules/newReports/ClientDetails';
import PriceTradedMargin from '../../components/modules/newReports/PriceTradedMargin';
import InvoiceAmountCollReport from '../../components/modules/newReports/InvoiceAmountCollReport';
import OrderDetails from '../../components/modules/newReports/OrdersDetails';
import RevenueBreakup from '../../components/modules/newReports/RevenueBreakup';
import ProposalDetails from '../../components/modules/newReports/ProposalDetails';
import CampaignCards from '../../components/modules/newReports/CampaingCards';
import SalesOverview from '../../components/modules/newReports/SalesOverview';

const OtherNewReports = () => {
  // For PDF Download
  const { mutateAsync: mutateAsyncPdf, isLoading: isDownloadPdfLoading } = useShareReport();

  const handleDownloadPdf = async () => {
    const activeUrl = new URL(window.location.href);
    activeUrl.searchParams.append('share', 'report');

    await mutateAsyncPdf(
      { url: activeUrl.toString() },
      {
        onSuccess: data => {
          showNotification({
            title: 'Report has been downloaded successfully',
            color: 'green',
          });
          if (data?.link) {
            downloadPdf(data.link);
          }
        },
      },
    );
  };

  // For Excel Download
  const { mutateAsync: mutateAsyncExcel, isLoading: isDownloadExcelLoading } = useDownloadExcel();

  const handleDownloadExcel = async () => {
    const activeUrl = new URL(window.location.href);

    await mutateAsyncExcel(
      { s3url: activeUrl.toString() },
      {
        onSuccess: data => {
          showNotification({
            title: 'Report has been downloaded successfully',
            color: 'green',
          });
          if (data?.link) {
            downloadExcel(data.link);
          }
        },
        onError: err => {
          showNotification({
            title: err?.message,
            color: 'red',
          });
        },
      },
    );
  };

  return (
    <div className="overflow-y-auto p-3 col-span-10 overflow-hidden">
      <div className="flex flex-end justify-end ">
        <div className="py-5 flex items-start">
          <Button
            leftIcon={<Download size="20" color="white" />}
            className="primary-button mx-3"
            onClick={handleDownloadPdf}
            loading={isDownloadPdfLoading}
            disabled={isDownloadPdfLoading}
          >
            Download PDF
          </Button>
        </div>
        <div className="py-5 flex items-start">
          <Button
            leftIcon={<Download size="20" color="white" />}
            className="primary-button"
            onClick={handleDownloadExcel}
            loading={isDownloadExcelLoading}
            disabled={isDownloadExcelLoading}
          >
            Income Statement
          </Button>
        </div>
      </div>
      <div className="border-2 p-5 border-black">
        <p className="font-bold text-lg"> Revenue </p>
        <div className="overflow-hidden p-5 ">
          <RevenueCards />
        </div>
        <SourceClientDistribution />
        <RevenueDistribution />
        <RevenueAndIndustriGraph />
        <CategoryWiseReport />
        <SalesOverview />
      </div>
      <div className="border-2 p-5 border-black my-2">
        <p className="font-bold text-lg"> Trends </p>
        <TagwiseReport />
        <SalesDistribution />
        <SalesComparision />
      </div>
      <div className="border-2 p-5 border-black my-2">
        <OperationalCosts />
        <PrintingMountingCosts />
      </div>

      <div className="border-2 p-5 border-black my-2">
        <p className="font-bold text-lg"> Client Data</p>

        <CampaignDetails />
        <ClientDetails />
        <PriceTradedMargin />
      </div>

      {/* <InvoiceAmountCollReport />

      <div className="overflow-y-auto px-5 col-span-10 w-[65rem]">
        <p className="font-bold pt-10">Performance Ranking Report</p>
        <p className="text-sm text-gray-600 italic py-4">
          This report shows Performance Cards with pagination controls and a sortable, paginated
          table.
        </p>
        <PerformanceCard />
      </div>

      <OrderDetails />
      <ProposalDetails />
      <RevenueBreakup />
      <CampaignCards /> */}
    </div>
  );
};

export default OtherNewReports;
