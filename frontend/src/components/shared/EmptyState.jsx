import React from 'react';
import './EmptyState.css';

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="empty-state">
    {Icon && (
      <div className="empty-state__icon">
        <Icon size={24} strokeWidth={1.5} />
      </div>
    )}
    <div className="empty-state__title">{title}</div>
    {description && <p className="empty-state__desc">{description}</p>}
    {action && <div className="empty-state__action">{action}</div>}
  </div>
);

export default EmptyState;
