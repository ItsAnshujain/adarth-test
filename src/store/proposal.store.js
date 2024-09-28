import { combine } from 'zustand/middleware';
import create from 'zustand';

const useProposalStore = create(
  combine(
    {
      proposalData: [],
    },
    set => ({
      setProposalData: proposalData => set(() => ({ proposalData })),
    }),
  ),
  {
    name: 'proposal',
  },
);

export default useProposalStore;
