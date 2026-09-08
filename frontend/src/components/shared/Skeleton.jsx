import React from 'react';
import './Skeleton.css';

export const Skeleton = ({ width, height = 16, radius = 6, className = '' }) => (
  <div
    className={`skeleton ${className}`}
    style={{
      width: width || '100%',
      height,
      borderRadius: radius,
    }}
  />
);

export const SkeletonText = ({ lines = 3, gap = 8 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} width={i === lines - 1 ? '60%' : '100%'} height={13} />
    ))}
  </div>
);

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <Skeleton height={12} width="40%" />
    <Skeleton height={36} width="70%" />
    <Skeleton height={10} width="50%" />
  </div>
);

export const SkeletonRow = ({ cols = 5 }) => (
  <div className="skeleton-row">
    {Array.from({ length: cols }).map((_, i) => (
      <Skeleton key={i} height={14} width={i === 0 ? '30%' : '80%'} />
    ))}
  </div>
);

export default Skeleton;
