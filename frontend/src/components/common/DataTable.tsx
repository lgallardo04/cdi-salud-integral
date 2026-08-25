import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  Plus,
  LayoutGrid,
  ListFilter,
  Layers
} from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  isMono?: boolean;
  sortable?: boolean;
  sortKey?: keyof T;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  itemsPerPage?: number;
  onAddNew?: () => void;
  addNewLabel?: string;
  actions?: (item: T) => React.ReactNode;
  exportTitle?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = 'Buscar registros...',
  searchFields,
  itemsPerPage = 8,
  onAddNew,
  addNewLabel = 'Nuevo Registro',
  actions,
  exportTitle = 'datos'
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'auto' | 'cards' | 'table'>('auto');

  // Filtrado
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((item) => {
      if (searchFields && searchFields.length > 0) {
        return searchFields.some((field) => {
          const val = item[field];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
        });
      }
      // Buscar en todos los valores del objeto
      return Object.values(item).some((val) => {
        if (typeof val === 'object' && val !== null) {
          return Object.values(val).some((subVal) =>
            String(subVal).toLowerCase().includes(term)
          );
        }
        return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, searchFields]);

  // Ordenamiento
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortField, sortDirection]);

  // Paginación
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = columns.map((c) => c.header).join(',');
    const rows = filteredData.map((item) =>
      columns
        .map((col) => {
          let val = '';
          if (typeof col.accessor === 'function') {
            val = '';
          } else if (col.accessor) {
            val = String(item[col.accessor] ?? '');
          }
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CDI_${exportTitle}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card datatable-card">
      <div className="card-header datatable-header">
        <div className="search-bar datatable-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="datatable-actions-group">
          {/* Toggle view button (mobile / tablet friendly) */}
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'auto' ? 'active' : ''}`}
              onClick={() => setViewMode('auto')}
              title="Modo Adaptativo (Auto)"
            >
              <Layers size={14} />
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Vista de Tarjetas Táctiles"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Vista de Tabla Estándar"
            >
              <ListFilter size={14} />
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportCSV}
            title="Exportar a CSV"
          >
            <Download size={15} />
            <span className="btn-label-responsive">Exportar</span>
          </button>

          {onAddNew && (
            <button
              type="button"
              className="btn btn-primary btn-sm btn-add-responsive"
              onClick={onAddNew}
            >
              <Plus size={16} />
              <span>{addNewLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop / Large Table View */}
      <div className={`table-container ${viewMode === 'cards' ? 'force-hide-table' : ''} ${viewMode === 'auto' ? 'auto-table' : ''}`}>
        <table className="clinical-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={col.className}
                  onClick={() => {
                    if (col.sortKey) handleSort(col.sortKey);
                    else if (typeof col.accessor === 'string') handleSort(col.accessor as keyof T);
                  }}
                  style={{
                    cursor: (col.sortable !== false && (col.sortKey || typeof col.accessor === 'string')) ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>{col.header}</span>
                    {(col.sortable !== false && (col.sortKey || typeof col.accessor === 'string')) && (
                      <ArrowUpDown size={12} style={{ opacity: 0.6 }} />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th style={{ textAlign: 'right' }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}
                >
                  No se encontraron registros coincidentes.
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item.id}>
                  {columns.map((col, colIdx) => {
                    let content: React.ReactNode = null;
                    if (typeof col.accessor === 'function') {
                      content = col.accessor(item);
                    } else if (col.accessor) {
                      content = String(item[col.accessor] ?? '-');
                    }
                    return (
                      <td
                        key={colIdx}
                        className={`${col.className || ''} ${col.isMono ? 'table-mono' : ''}`}
                      >
                        {content}
                      </td>
                    );
                  })}
                  {actions && (
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className={`mobile-cards-container ${viewMode === 'table' ? 'force-hide-cards' : ''} ${viewMode === 'auto' ? 'auto-cards' : ''}`}>
        {paginatedData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
            No se encontraron registros coincidentes.
          </div>
        ) : (
          <div className="mobile-record-card-list">
            {paginatedData.map((item) => {
              const primaryCol = columns[0];
              const otherCols = columns.slice(1);

              let primaryContent: React.ReactNode = null;
              if (typeof primaryCol?.accessor === 'function') {
                primaryContent = primaryCol.accessor(item);
              } else if (primaryCol?.accessor) {
                primaryContent = String(item[primaryCol.accessor] ?? '-');
              }

              return (
                <div key={item.id} className="mobile-record-card">
                  {/* Primary Header */}
                  <div className="mobile-record-header">
                    <div className="mobile-record-title">
                      {primaryContent}
                    </div>
                  </div>

                  {/* Body Fields */}
                  <div className="mobile-record-fields-grid">
                    {otherCols.map((col, cIdx) => {
                      let valContent: React.ReactNode = null;
                      if (typeof col.accessor === 'function') {
                        valContent = col.accessor(item);
                      } else if (col.accessor) {
                        valContent = String(item[col.accessor] ?? '-');
                      }

                      return (
                        <div key={cIdx} className="mobile-record-field">
                          <span className="mobile-field-label">{col.header}</span>
                          <span className={`mobile-field-value ${col.isMono ? 'table-mono' : ''}`}>
                            {valContent}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions Row */}
                  {actions && (
                    <div className="mobile-record-actions">
                      {actions(item)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Responsive Pagination */}
      {totalPages > 1 && (
        <div className="datatable-pagination">
          <div className="pagination-info">
            <b>{(currentPage - 1) * itemsPerPage + 1}</b> -{' '}
            <b>{Math.min(currentPage * itemsPerPage, sortedData.length)}</b> de{' '}
            <b>{sortedData.length}</b>
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="pagination-page-indicator">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Página siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
