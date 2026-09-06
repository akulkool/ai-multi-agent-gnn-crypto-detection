import React from 'react';
import './SectionHeader.css';

/**
 * SectionHeader — Consistent section titles with optional subtitle,
 * index number, and amber accent line.
 */
const SectionHeader = ({
  index,
  label,
  title,
  subtitle,
  action,
  tight = false,
}) => (
  <div className={`section-header ${tight ? 'section-header--tight' : ''}`}>
    <div className="section-header__left">
      {(index || label) && (
        <div className="section-header__label">
          {index && <span className="section-header__index">{index}</span>}
          {label && <span>{label}</span>}
        </div>
      )}
      {title && <h2 className="section-header__title">{title}</h2>}
      {subtitle && <p className="section-header__subtitle">{subtitle}</p>}
    </div>
    {action && <div className="section-header__action">{action}</div>}
  </div>
);

export default SectionHeader;
