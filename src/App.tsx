import React, { memo, Suspense } from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import { routes } from './index.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary.tsx';
import { antdThemeConfig } from '@/config/themeConfig.ts';

// Import global styles
import './components/ui/Button/Button.css';
// import './styles/darkMode/ThemeToggle.css'; // Ya no se usa

// Componente de carga para Suspense
const Loader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh',
    width: '100%'
  }}>
    <div className="animate-spin" style={{
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      borderTop: '2px solid var(--primary-500)',
      borderBottom: '2px solid var(--primary-500)',
      borderLeft: '2px solid transparent',
      borderRight: '2px solid transparent'
    }}></div>
  </div>
);

// Componente de rutas con memo para evitar re-renders innecesarios
const AppRoutes = memo(() => {
  const element = useRoutes(routes);
  return element;
});
AppRoutes.displayName = 'AppRoutes';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ConfigProvider theme={antdThemeConfig} locale={esES}>
        <Router>
          <div className="app" style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
            <Suspense fallback={<Loader />}>
              <AppRoutes />
            </Suspense>
          </div>
        </Router>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

// Usar React.memo para evitar re-renders innecesarios
export default memo(App);
