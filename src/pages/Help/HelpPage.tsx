import React from 'react';
import { Typography, Steps, Collapse, Card, Divider, Button } from 'antd';
import { 
  BookOutlined, 
  ExperimentOutlined, 
  FileTextOutlined, 
  PlayCircleOutlined,
  QuestionCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { AppHeader } from '@/components/AppHeader/AppHeader';
import { useNavigate } from 'react-router-dom';
import './HelpPage.css';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

export const HelpPage: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      title: 'Receta Base',
      icon: <BookOutlined />,
      description: 'El punto de partida.',
      content: (
        <div>
          <Paragraph>
            Una <strong>Receta Padre</strong> es el concepto general del producto (ej: "Dulce de Leche").
          </Paragraph>
          <ul>
            <li>Ve a la sección <strong>Recetas</strong>.</li>
            <li>Haz clic en "Nueva Receta Base".</li>
            <li>Define el código (ej: REC-DL) y el nombre.</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Versión de Receta',
      icon: <FileTextOutlined />,
      description: 'La estructura detallada.',
      content: (
        <div>
          <Paragraph>
            Define <strong>cómo</strong> se hace el producto en un momento dado. Puedes tener múltiples versiones (ej: "Verano 2024", "Bajo Azúcar").
          </Paragraph>
          <ul>
            <li>Ve a <strong>Recetas {'>'} Versiones</strong>.</li>
            <li>Usa el <strong>Constructor de Recetas</strong> para diseñar el formulario.</li>
            <li>Agrega <strong>Secciones</strong> (ej: "Pasteurización"), <strong>Grupos</strong> de campos y <strong>Tablas</strong> de control.</li>
            <li>Puedes duplicar secciones o copiar estructuras de versiones anteriores para ahorrar tiempo.</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Producción',
      icon: <ExperimentOutlined />,
      description: 'La ejecución real.',
      content: (
        <div>
          <Paragraph>
            Es la puesta en marcha de una versión específica. Aquí se registran los datos reales.
          </Paragraph>
          <ul>
            <li>Ve a <strong>Producciones {'>'} Nueva</strong>.</li>
            <li>Selecciona la Versión de Receta que vas a utilizar.</li>
            <li>Asigna un código de producción único.</li>
            <li>El sistema generará un formulario basado en la estructura que diseñaste.</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Seguimiento',
      icon: <PlayCircleOutlined />,
      description: 'Control y finalización.',
      content: (
        <div>
          <Paragraph>
            Durante la producción, los operarios completan los campos y tablas.
          </Paragraph>
          <ul>
            <li>Para que un cambio en un campo se guarde, es necesario tocar el icono verde, luego de editar el valor deseado.</li>
            <li>Puedes ver el progreso en tiempo real, desde la pagina de edición o vista pública, que no requiere usuario.</li>
            <li>Al terminar, cambia el estado a <strong>Finalizada</strong> para cerrar la edición.</li>
            <li>Exporta el reporte final a PDF con un solo clic.</li>
            <li>Podes acceder al historial de producciones desde la pagina de inicio <strong>Ver todas las producciones</strong></li>
          </ul>
        </div>
      ),
    },
  ];

  const faqs = [
    {
      key: '1',
      label: '¿Puedo editar una versión receta que ya tiene producciones?',
      children: 'No directamente. Para mantener la integridad histórica, si necesitas cambiar la estructura, debes crear una nueva Versión de Receta. Las producciones pasadas mantendrán la estructura original.',
    },
    {
      key: '2',
      label: '¿Qué pasa si pierdo la conexión a internet?',
      children: 'El sistema intenta reconectar automáticamente. Si estás en una página de detalle, verás un indicador de estado. No cierres la pestaña hasta que veas que los cambios se han guardado (ícono de check verde).',
    },
    {
      key: '3',
      label: '¿Cómo funcionan los estados de producción?',
      children: (
        <ul>
          <li><strong>En Proceso:</strong> Editable. Se pueden cargar datos.</li>
          <li><strong>Finalizada:</strong> Solo lectura. Indica que el proceso terminó correctamente.</li>
          <li><strong>Cancelada:</strong> Solo lectura. Indica que el proceso se abortó.</li>
        </ul>
      ),
    },
    {
      key: '4',
      label: '¿Quién puede ver las producciones?',
      children: 'Los usuarios autenticados pueden ver y editar producciones. Existe un listado público donde cualquiera puede consultar el estado de una producción.',
    },
  ];

  return (
    <div className="help-page">
      <AppHeader title="Centro de Ayuda" />
      
      <main className="help-main">
        <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/inicio')} 
            style={{ marginBottom: '1rem' }}
        >
            Volver al Inicio
        </Button>

        <div className="help-section">
          <Title level={2}><BookOutlined /> Manual de Uso</Title>
          <Paragraph>
            Bienvenido a AlimTrack. Este sistema permite gestionar la trazabilidad de producciones alimenticias de forma flexible.
            Sigue este flujo para comenzar:
          </Paragraph>
          
          <Divider />

          <Steps 
            direction="vertical" 
            current={-1} 
            items={steps.map(s => ({
                title: s.title,
                icon: s.icon,
                description: <div className="help-step-content">{s.content}</div>
            }))} 
          />
        </div>

        <div className="help-section">
          <Title level={3}><QuestionCircleOutlined /> Preguntas Frecuentes (FAQ)</Title>
          <Collapse accordion items={faqs} />
        </div>
      </main>
    </div>
  );
};
