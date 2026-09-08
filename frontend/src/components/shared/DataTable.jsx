import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import RiskBadge from './RiskBadge';
import './DataTable.css';

/**
 * DataTable — Professional financial data table with sorting, hover, selection.
 *
 * columns: Array<{ key, label, render?, sortable?, mono?, align? }>
 * data: Array<object>
 * onRowClick: fn(row)
 * pageSize: number
 */
const DataTable = ({
  columns = [],
  data = [],
  onRowClick,
  pageSize = 12,
  emptyMessage = 'No data available.',
}) => {
  const [sortKey, setSortKey]     = useState(null);
  const [sortDir, setSortDir]     = useState('asc');
  const [page, setPage]           = useState(1);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const va = a[sortKey]; const vb = b[sortKey];
        const cmp = (va < vb ? -1 : va > vb ? 1 : 0);
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="data-table-wrapper">
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`data-table__th ${col.sortable ? 'data-table__th--sortable' : ''} ${col.align === 'right' ? 'data-table__th--right' : ''}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span>{col.label}</span>
                  {col.sortable && (
                    <span className="data-table__sort-icon">
                      {sortKey === col.key
                        ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
                        : <ChevronDown size={12} style={{ opacity: 0.3 }} />}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table__empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={i}
                  className={`data-table__row ${onRowClick ? 'data-table__row--clickable' : ''} ${row.suspicious ? 'data-table__row--suspicious' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`data-table__td ${col.mono ? 'mono' : ''} ${col.align === 'right' ? 'data-table__td--right' : ''}`}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="data-table__pagination">
          <span className="data-table__page-info">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="data-table__page-controls">
            <button
              className="data-table__page-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = i + 1;
              return (
                <button
                  key={pg}
                  className={`data-table__page-btn ${page === pg ? 'data-table__page-btn--active' : ''}`}
                  onClick={() => setPage(pg)}
                >
                  {pg}
                </button>
              );
            })}
            <button
              className="data-table__page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
