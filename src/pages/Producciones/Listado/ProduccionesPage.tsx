import React, { useEffect, useMemo, useState } from 'react';
import { useProductionService } from '@/services/production/useProductionService.ts';
import { AppHeader } from '@/components/AppHeader/AppHeader.tsx';
import { CustomTable } from '@/components/ui/CustomTable/CustomTable.tsx';
import { getProductionColumns } from './ProduccionesColumns.tsx';
import { useNavigate } from 'react-router-dom';
import { Button, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { type LocalProductionFilters, ProduccionFilters } from './ProduccionFilters.tsx';
import type { ProduccionProtectedResponseDTO } from '@/types/production';
import { usePageTitle } from '@/hooks/usePageTitle.ts';
import './ProduccionesPage.css';
import { useIsMobile } from '@/hooks/useIsMobile.ts';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

// Extendemos dayjs con el plugin isBetween
dayjs.extend(isBetween);

interface ProductionsResultPageProps {
  // Mantenemos initialFilters pero ahora tipado con nuestra interfaz local parcial
  initialFilters?: Partial<LocalProductionFilters>;
}

const ProductionsResultPage: React.FC<ProductionsResultPageProps> = ({ initialFilters = {} }) => {
  usePageTitle('Producciones');
  const { producciones, loading, error, getProducciones, deleteProduction } = useProductionService();
  const navigate = useNavigate();
  
  // Estado para los filtros locales
  const [filters, setFilters] = useState<LocalProductionFilters>(initialFilters as LocalProductionFilters);
  const isMobile = useIsMobile();

  // Cargar TODAS las producciones al montar el componente (sin filtros de backend)
  useEffect(() => {
    getProducciones({}); 
  }, [getProducciones]);

  // Lógica de filtrado en el cliente
  const filteredProducciones = useMemo(() => {
    return producciones.filter((prod) => {
      // 1. Filtro por Código de Producción (case insensitive, partial match)
      if (filters.codigoProduccion) {
        const searchCode = filters.codigoProduccion.toLowerCase();
        if (!prod.codigoProduccion.toLowerCase().includes(searchCode)) {
          return false;
        }
      }

      // 2. Filtro por Lote (case insensitive, partial match)
      if (filters.lote) {
        const searchLote = filters.lote.toLowerCase();
        if (!prod.lote || !prod.lote.toLowerCase().includes(searchLote)) {
          return false;
        }
      }

      // 3. Filtro por Estado (exact match)
      if (filters.estado) {
        if (prod.estado !== filters.estado) {
          return false;
        }
      }

      // 4. Filtro por Rango de Fechas (comparando con fechaInicio de la producción)
      if (filters.fechaRange && filters.fechaRange[0] && filters.fechaRange[1]) {
        const [start, end] = filters.fechaRange;
        const prodDate = dayjs(prod.fechaInicio);
        
        // Usamos 'day' como unidad para ignorar la hora y comparar solo fechas
        // [] indica inclusión de ambos límites
        if (!prodDate.isBetween(start, end, 'day', '[]')) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime());
  }, [producciones, filters]);

  const handleView = (record: ProduccionProtectedResponseDTO) => {
    window.open(`/public/producciones/ver/${record.codigoProduccion}`, '_blank');
  };

  const handleEdit = (record: ProduccionProtectedResponseDTO) => {
    window.open(`/producciones/ver/${record.codigoProduccion}`, '_blank');
  };

  const handleDelete = (codigoProduccion: string) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar esta producción?',
      content: `Se eliminará la producción con código: ${codigoProduccion}. Esta acción no se puede deshacer.`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await deleteProduction(codigoProduccion);
          message.success(`Producción ${codigoProduccion} eliminada exitosamente`);
        } catch (err: any) {
          console.error('Error al eliminar producción:', err);
          message.error(err.message || 'Error al eliminar la producción');
        }
      },
    });
  };

  const handleFilterChange = (newFilters: LocalProductionFilters) => {
    setFilters(newFilters);
  };

  const columns = getProductionColumns({
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
    isMobile,
  });

  return (
    <div className="dashboard">
      <AppHeader title="AlimTrack" />
      <main className="dashboard__main container">
        <div className="productions-list__header">
          <h1 className="productions-list__title">Listado de Producciones</h1>
          <Button icon={<PlusOutlined />} onClick={() => navigate('/producciones/nueva')}>
            Nueva Producción
          </Button>
        </div>

        <ProduccionFilters 
          onFilterChange={handleFilterChange} 
          initialFilters={initialFilters} 
        />

        <div className="productions-list__content">
          <CustomTable
            columns={columns}
            dataSource={filteredProducciones} // Usamos la lista filtrada localmente
            loading={loading}
            rowKey="codigoProduccion"
            locale={{
              emptyText: error
                ? 'Error al cargar las producciones'
                : 'No se encontraron producciones con los filtros seleccionados',
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default ProductionsResultPage;
