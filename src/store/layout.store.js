import create from 'zustand';
import { combine, persist } from 'zustand/middleware';

const initialValue = {
  inventory: 'list',
  proposal: 'list',
  campaign: 'list',
  inventoryLimit: 20,
  bookingLimit: 20,
  proposalLimit: 20,
  campaignLimit: 20,
};

const useLayoutView = create(
  persist(
    combine(
      {
        activeLayout: initialValue,
      },
      set => ({
        setActiveLayout: activeLayout => set(() => ({ activeLayout })),
      }),
    ),
    { name: 'layout_type' },
  ),
);

export default useLayoutView;
