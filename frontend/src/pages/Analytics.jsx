import React from 'react';
import SectionHeader from '../components/shared/SectionHeader';

const Analytics = () => {
  return (
    <div style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 'var(--content-max-width)' }}>
      <SectionHeader index="01" label="Analytics" title="Detection Analytics" subtitle="Measure suspicious activity and evaluate model performance." />
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--space-12)', background: 'var(--surface-0)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Analytics visualizations will be implemented here.</p>
      </div>
    </div>
  );
};

export default Analytics;
