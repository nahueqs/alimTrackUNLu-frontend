import React, { memo, Suspense } from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { ThemeProvider } from './styles/darkMode/ThemeContexts.tsx';
import { routes } from './index.tsx';

// Import global styles
import './components/ui/Button/Button.css';
import './styles/darkMode/ThemeToggle.css';

// Componente de carga para Suspense
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Componente de error para los límites de error
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Error en el componente:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold text-red-600">Algo salió mal</h2>
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => this.setState({ hasError: false })}
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Componente de rutas con memo para evitar re-renders innecesarios
const AppRoutes = memo(() => {
  const element = useRoutes(routes);
  return element;
});
AppRoutes.displayName = 'AppRoutes';

export const App: React.FC = () => {

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <div className="app" style={{ width: '100%' }}>
            <Suspense fallback={<Loader />}>
              <AppRoutes />
            </Suspense>
          </div>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// Usar React.memo para evitar re-renders innecesarios
export default memo(App);
