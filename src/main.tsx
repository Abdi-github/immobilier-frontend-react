import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { store } from '@/app/store';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import App from './App';
import './i18n';
import './index.css';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <Provider store={store}>
          {/* console.log('Redux store initialized') */}
          <BrowserRouter>
            {/* console.log('Routing configured') */}
            <App />
          </BrowserRouter>
        </Provider>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
);


