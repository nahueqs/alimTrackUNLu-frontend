import React, { useEffect } from 'react';
import { LoginForm } from './components/LoginForm.tsx';
import { useNavigate } from 'react-router-dom';
import logoUnlu from '@/assets/logoUnlu.jpg';
import logoCideta from '@/assets/logoCideta.png';
import { useAuth } from '@/context/auth/AuthProvider.tsx';
import { Card, Button } from '@/components/ui';
import { usePageTitle } from '@/hooks/usePageTitle.ts';
import './LoginPage.css';
import { ScheduleOutlined } from '@ant-design/icons';
import type { LoginRequest } from '@/services/auth/Auth.ts';

const LoginPage: React.FC = () => {
  usePageTitle('Iniciar Sesión');
  const { login, loading, error, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, loading, navigate]);

  const handleLogin = async (credentials: LoginRequest) => {
    try {
      await login(credentials);
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="login-page">
      <div className="bg"></div>
      <div className="bg bg2"></div>
      <div className="bg bg3"></div>

      <div className="login-page__container">
        <div className="login-page__header">
          <div className="login-page__images">
            <img src={logoUnlu} alt="Logo UNLu" className="login-page__image" />
            <img src={logoCideta} alt="Logo CIDETA" className="login-page__image" />
          </div>
          <h1 className="login-page__title">AlimTrack</h1>
          <p className="login-page__subtitle">Sistema de Gestión de Producciones</p>
        </div>

        <Card
          className="login-page__card"
          variant="elevated"
          size="lg"
          hoverEffect={true}
          style={{ width: '100%', maxWidth: '450px' }}
        >
          <LoginForm
            onLogin={handleLogin}
            onSwitchToRegister={() => {}} // Deshabilitado temporalmente
            loading={loading}
            error={error}
          />
          
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
            <Button
              variant="secondary"
              icon={<ScheduleOutlined />}
              onClick={() => navigate('/public/producciones')}
              style={{ width: '100%', height: '50px', fontSize: '1.1rem' }}
            >
              Ver Listado de Producciones
            </Button>
          </div>
        </Card>

        <div className="login-page__info">
          <p className="login-page__info-text">
            {import.meta.env.VITE_API_BASE_URL
              ? `Conectado a: ${import.meta.env.VITE_API_BASE_URL}`
              : 'Conectando a backend...'}
          </p>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
