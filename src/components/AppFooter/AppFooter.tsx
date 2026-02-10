import React from 'react';
import { Link } from 'react-router-dom';
import { QuestionCircleOutlined, GithubOutlined } from '@ant-design/icons';
import './AppFooter.css';

export const AppFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="container app-footer__content">
        <div className="app-footer__copyright">
          © {currentYear} CIDETA - Universidad Nacional de Luján
        </div>
        
        <div className="app-footer__links">
          <Link to="/ayuda" className="app-footer__link">
            <QuestionCircleOutlined /> Manual de uso del sistema
          </Link>
          {/* Podrías agregar más enlaces aquí, ej: Soporte, Términos */}
        </div>
      </div>
    </footer>
  );
};
