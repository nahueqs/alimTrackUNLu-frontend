import '@testing-library/jest-dom';
import { vi } from 'vitest';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Configurar dayjs con los plugins usados en la app
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

// Mock para matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock para ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock para getComputedStyle (soluciona error en Table de AntD)
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (elt, pseudoElt) => {
  return originalGetComputedStyle(elt, pseudoElt);
};

// Mock para scrollTo (usado por componentes con scroll)
window.scrollTo = vi.fn() as any;

// Mock para Notification API (usado en WebSockets)
global.Notification = {
  permission: 'granted',
  requestPermission: vi.fn().mockResolvedValue('granted'),
  // @ts-ignore
  prototype: {},
} as any;

// Silenciar warnings específicos de Ant Design/React que no afectan la lógica
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('ReactDOM.render is no longer supported') ||
     args[0].includes('Warning: An update to') ||
     args[0].includes('Not implemented: window.getComputedStyle'))
  ) {
    return;
  }
  originalConsoleError(...args);
};
