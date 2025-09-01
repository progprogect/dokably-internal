import ReactDOM from 'react-dom/client';
import Modal from 'react-modal';

import App from './app/App';
import 'animate.css';
import '@fontsource/source-code-pro/400.css';
import '@fontsource/source-code-pro/500.css';
import * as amplitude from '@amplitude/analytics-browser';
import React from 'react';
amplitude.init('e07b0f8955783b50f298b7858d764f42', undefined, {
  defaultTracking: {
    sessions: true,
    pageViews: true,
    formInteractions: true,
    fileDownloads: true,
  },
});

Modal.setAppElement('#root');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<App />);
