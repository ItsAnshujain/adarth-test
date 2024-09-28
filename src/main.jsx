import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Notifications } from '@mantine/notifications';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './styles/index.scss';
import './styles/rteTheme.scss';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * To use tailwindcss with Mantine, we need to set the emotionOptions as given below
 * https://github.com/mantinedev/mantine/issues/823#issuecomment-1033762396
 * https://mantine.dev/theming/mantine-provider/#configure-emotion
 */

const Modal = ({ innerProps }) => innerProps.modalBody;

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode> TODO: removed strictmode cz map load issue
  <MantineProvider
    emotionOptions={{ key: 'mantine', prepend: false }}
    withGlobalStyles
    withNormalizeCSS
    theme={{
      fontFamily: 'DM Sans !important',
      colors: {
        brand: ['#DAC4FF', '#C7A5FF', '#B387FA', '#9A69EA', '#824DD8', '#692FC7', '#4B0DAF'],
      },
      primaryColor: 'brand',
    }}
  >
    <QueryClientProvider client={queryClient}>
      <ModalsProvider modals={{ basic: Modal }}>
        <Notifications position="top-right" />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ModalsProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </MantineProvider>,
  // </React.StrictMode>,
);
