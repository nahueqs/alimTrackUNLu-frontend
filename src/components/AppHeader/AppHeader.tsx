import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth/AuthProvider';
import logoCideta from '../../assets/logoCideta.png';
import './AppHeader.css';
import { MenuIcon, UserIcon, LogInIcon, LayoutDashboardIcon, ListIcon } from 'lucide-react';
import { Button } from 'antd';

interface HeaderProps {
  title?: string;
  variant?: 'protected' | 'public';
}

export const AppHeader: React.FC<HeaderProps> = ({ 
  title = 'AlimTrack', 
  variant = 'protected' 
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Determinar el destino del logo según la variante
  const logoDestination = variant === 'protected' ? '/dashboard' : '/public/producciones';

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- CONTENIDO DE NAVEGACIÓN ---

  const renderProtectedNav = () => (
    <>
      <a className="header__nav-link" onClick={() => handleNavigation('/dashboard')}>
        Dashboard
      </a>
      <a className="header__nav-link" onClick={() => handleNavigation('/producciones')}>
        Producciones
      </a>
      <a className="header__nav-link" onClick={() => handleNavigation('/recetas/versiones')}>
        Recetas
      </a>
      <a className="header__nav-link" onClick={() => handleNavigation('/public/producciones')}>
        Vista Pública
      </a>
    </>
  );

  const renderPublicNav = () => (
    <>
      <a className="header__nav-link" onClick={() => handleNavigation('/public/producciones')}>
        <ListIcon size={16} style={{ marginRight: 4 }} />
        Listado Público
      </a>
    </>
  );

  // --- CONTENIDO DE ACCIONES DE USUARIO ---

  const renderProtectedActions = () => (
    <div className="header__user-menu">
      <div className="header__user-activator">
        <UserIcon className="header__user-icon" />
        <span>{user?.nombre}</span>
      </div>
      <div className="header__user-dropdown">
        <a className="header__dropdown-item" onClick={() => handleNavigation('/profile')}>
          Mi Perfil
        </a>
        <hr className="header__separator" />
        <a className="header__dropdown-item" onClick={logout}>
          Cerrar Sesión
        </a>
      </div>
    </div>
  );

  const renderPublicActions = () => (
    <Button 
      type="primary" 
      icon={isAuthenticated ? <LayoutDashboardIcon size={16} /> : <LogInIcon size={16} />}
      onClick={() => handleNavigation(isAuthenticated ? '/dashboard' : '/login')}
      className="header__action-btn"
    >
      {isAuthenticated ? 'Ir al Dashboard' : 'Iniciar Sesión'}
    </Button>
  );

  return (
    <header className="header" ref={headerRef}>
      <nav className="header__nav">
        {/* LOGO Y TÍTULO */}
        <div
          className="header__brand"
          onClick={() => handleNavigation(logoDestination)}
          style={{ cursor: 'pointer' }}
        >
          <img src={logoCideta} alt="Logo Cideta" className="header__brand-logo" />
          <span className="header__brand-title">{title}</span>
        </div>

        <div className="header__actions">
          {/* NAVEGACIÓN DE ESCRITORIO */}
          <div className="header__desktop-nav">
            {variant === 'protected' ? renderProtectedNav() : renderPublicNav()}
            
            {/* Separador visual si es necesario */}
            {variant === 'protected' && <div className="header__divider"></div>}
            
            {variant === 'protected' ? renderProtectedActions() : renderPublicActions()}
          </div>

          {/* BOTÓN HAMBURGUESA (MÓVIL) */}
          <div className="header__mobile-nav">
            <button
              className="header__hamburger"
              aria-label="Abrir menú"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <MenuIcon className="header__hamburger-icon" />
            </button>
          </div>
        </div>
      </nav>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      <div
        className={`header__mobile-menu-content ${isMobileMenuOpen ? 'header__mobile-menu-content--open' : ''}`}
      >
        {variant === 'protected' ? (
          // Menú Móvil Protegido
          <>
            <a className="header__dropdown-item" onClick={() => handleNavigation('/dashboard')}>
              Dashboard
            </a>
            <a className="header__dropdown-item" onClick={() => handleNavigation('/producciones')}>
              Producciones
            </a>
            <a className="header__dropdown-item" onClick={() => handleNavigation('/recetas/versiones')}>
              Recetas
            </a>
            <a className="header__dropdown-item" onClick={() => handleNavigation('/public/producciones')}>
              Vista Pública
            </a>
            <hr className="header__separator" />
            {user && (
              <div className="header__mobile-user-info">
                <p><strong>{user.nombre}</strong></p>
                <p className="header__mobile-user-role">{user.rol}</p>
              </div>
            )}
            <a className="header__dropdown-item" onClick={() => handleNavigation('/profile')}>
              Mi Perfil
            </a>
            <hr className="header__separator" />
            <a className="header__dropdown-item" onClick={logout}>
              Cerrar Sesión
            </a>
          </>
        ) : (
          // Menú Móvil Público
          <>
            <a className="header__dropdown-item" onClick={() => handleNavigation('/public/producciones')}>
              <ListIcon size={16} style={{ marginRight: 8 }} />
              Listado Público
            </a>
            <hr className="header__separator" />
            <a 
              className="header__dropdown-item" 
              onClick={() => handleNavigation(isAuthenticated ? '/dashboard' : '/login')}
              style={{ color: 'var(--primary-500)', fontWeight: 600 }}
            >
              {isAuthenticated ? <LayoutDashboardIcon size={16} style={{ marginRight: 8 }} /> : <LogInIcon size={16} style={{ marginRight: 8 }} />}
              {isAuthenticated ? 'Ir al Dashboard' : 'Iniciar Sesión'}
            </a>
          </>
        )}
      </div>
    </header>
  );
};
