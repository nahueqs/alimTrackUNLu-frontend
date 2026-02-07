import type { ThemeConfig } from 'antd';

// Estos valores deben coincidir con las variables definidas en src/styles/Index.css
export const antdThemeConfig: ThemeConfig = {
  token: {
    // Colores Primarios (Coincide con --primary-500: #048a5b)
    colorPrimary: '#048a5b',
    
    // Tipografía
    fontFamily: "'Montserrat', sans-serif",
    
    // Colores Base
    colorText: '#212121', // --text-primary
    colorTextSecondary: '#616161', // --text-secondary
    colorBgContainer: '#ffffff', // --bg-primary
    colorBgLayout: '#f5f5f5', // --bg-secondary
    
    // Bordes y Radios
    borderRadius: 8, // --radius-md
    colorBorder: '#e0e0e0', // --border-light
  },
  components: {
    Button: {
      borderRadius: 4, // --radius-sm
      controlHeight: 32,
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 500,
    },
    Card: {
      borderRadiusLG: 12, // --radius-lg
    },
    Table: {
      headerBg: '#f5f5f5', // --bg-secondary
      headerColor: '#616161', // --text-secondary
      borderColor: '#e0e0e0',
    },
    Input: {
      colorBorder: '#e0e0e0',
      hoverBorderColor: '#048a5b',
      activeBorderColor: '#048a5b',
    },
    Select: {
      colorBorder: '#e0e0e0',
      colorPrimaryHover: '#048a5b',
    }
  },
};
