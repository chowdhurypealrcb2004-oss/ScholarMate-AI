import React from 'react';

/**
 * Reusable Badge Component
 * Variants: 'indigo', 'emerald', 'amber', 'slate'
 */
export default function Badge({
  children,
  variant = 'indigo',
  icon: Icon,
  className = '',
}) {
  const variantMap = {
    indigo: 'badge-indigo',
    emerald: 'badge-emerald',
    amber: 'badge-amber',
    slate: 'badge-slate',
  };

  return (
    <span className={`badge ${variantMap[variant] || 'badge-indigo'} ${className}`}>
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </span>
  );
}
