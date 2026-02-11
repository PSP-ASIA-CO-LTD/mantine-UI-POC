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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GraphQLProvider>
      <MantineProvider>
        <Notifications />
        <App />
      </MantineProvider>
    </GraphQLProvider>
  </React.StrictMode>,
);
