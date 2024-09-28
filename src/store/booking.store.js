import { combine } from 'zustand/middleware';
import create from 'zustand';

const useBookingStore = create(
  combine(
    {
      bookingData: [],
    },
    set => ({
      setBookingData: bookingData => set(() => ({ bookingData })),
    }),
  ),
  {
    name: 'booking',
  },
);

export default useBookingStore;
