import { useParams, useSearchParams } from 'react-router-dom';
import Header from '../../components/modules/bookings/ViewOrders/Header';
import Overview from '../../components/modules/bookings/ViewOrders/Overview';
import OrderInformation from '../../components/modules/bookings/ViewOrders/OrderInformation';
import ProcessPipeline from '../../components/modules/bookings/ViewOrders/ProcessPipeline';
import {
  useBookingById,
  useBookingStats,
  useBookingStatsById,
} from '../../apis/queries/booking.queries';

const BookingDetailsPage = () => {
  const [searchParams] = useSearchParams({ tab: 'order-information' });
  const tab = searchParams.get('tab');
  const { id } = useParams();
  const { data: bookingData, isLoading } = useBookingById(id, !!id);
  useBookingStats('');
  useBookingStatsById(id, !!id);

  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto px-5">
      <Header bookingId={id} bookingData={bookingData} />
      {tab === 'order-information' ? (
        <OrderInformation isLoading={isLoading} />
      ) : tab === 'process-pipeline' ? (
        <ProcessPipeline bookingData={bookingData} />
      ) : tab === 'overview' ? (
        <Overview bookingData={bookingData} isLoading={isLoading} />
      ) : null}
    </div>
  );
};

export default BookingDetailsPage;
