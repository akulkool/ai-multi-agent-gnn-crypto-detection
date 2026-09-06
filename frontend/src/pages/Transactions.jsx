import React, { useState } from 'react';
import SectionHeader from '../components/shared/SectionHeader';
import DataTable from '../components/shared/DataTable';
import RiskBadge from '../components/shared/RiskBadge';
import { transactionsList } from '../data/mockData';
import { ExternalLink, Search } from 'lucide-react';

const Transactions = () => {
  const [query, setQuery] = useState('');
  
  const columns = [
    { key: 'id', label: 'Transaction ID', mono: true, render: (val) => <span style={{ color: 'var(--amber-500)' }}>{val}</span> },
    { key: 'timestamp', label: 'Time', render: (val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
    { key: 'from', label: 'Sender', mono: true },
    { key: 'to', label: 'Receiver', mono: true },
    { key: 'amount', label: 'Amount', align: 'right', render: (val, row) => `${val.toFixed(2)} ${row.token}` },
    { key: 'riskLabel', label: 'Risk', sortable: true, render: (val, row) => <RiskBadge risk={val} score={row.risk} size="sm" /> },
    { key: 'action', label: '', align: 'right', render: () => <button style={{ display: 'inline-flex', padding: '4px', color: 'var(--text-muted)' }}><ExternalLink size={14}/></button> }
  ];

  const filtered = transactionsList.filter(t => t.id.includes(query) || t.from.includes(query) || t.to.includes(query));

  return (
    <div style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 'var(--content-max-width)' }}>
      <SectionHeader index="01" label="Transactions" title="Transaction Explorer" subtitle="Search and filter network transactions." />
      
      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search TX or wallet..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', background: 'var(--surface-1)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ background: 'var(--surface-0)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
        <DataTable columns={columns} data={filtered} pageSize={10} />
      </div>
    </div>
  );
};

export default Transactions;
