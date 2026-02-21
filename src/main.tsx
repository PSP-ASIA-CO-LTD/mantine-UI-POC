import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import App from './App';
import './index.css';
import { GraphQLProvider } from './components/GraphQLProvider';

const APP_FONT_FAMILY = '"Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GraphQLProvider>
      <MantineProvider
        theme={{
          fontFamily: APP_FONT_FAMILY,
          headings: {
            fontFamily: APP_FONT_FAMILY,
          },
          components: {
            Text: {
              classNames: {
                root: 'mb-0 text-body',
              },
            },
            Title: {
              classNames: {
                root: 'mb-0',
              },
            },
            Badge: {
              classNames: {
                root: 'badge',
              },
            },
          },
        }}
      >
        <Notifications />
        <App />
      </MantineProvider>
    </GraphQLProvider>
  </React.StrictMode>,
);
