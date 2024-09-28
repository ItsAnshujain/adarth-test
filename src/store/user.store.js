import { combine, persist } from 'zustand/middleware';
import create from 'zustand';
import { USER_TOKEN_ID_KEY } from '../utils/config';

const useUserStore = create(
  persist(
    combine(
      {
        token: null,
        id: null,
        userDetails: {},
        hasAcceptedTerms: null,
      },
      set => ({
        setToken: token => set(() => ({ token })),
        setId: id => set(() => ({ id })),
        setUserDetails: userDetails => set(() => ({ userDetails })),
        setHasAcceptedTerms: hasAcceptedTerms => set(() => ({ hasAcceptedTerms })),
      }),
    ),
    {
      name: USER_TOKEN_ID_KEY,
    },
  ),
);

export default useUserStore;
