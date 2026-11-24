import React from 'react';

/**
 * Reusable Button Component
 * Supports variants: 'primary', 'secondary', 'outline', 'ghost'
 * Supports sizes: 'sm', 'md', 'lg'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }[size] || '';

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-secondary',
    ghost: '',
  }[variant] || 'btn-primary';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon size={size === 'lg' ? 20 : size === 'sm' ? 14 : 16} />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon size={size === 'lg' ? 20 : size === 'sm' ? 14 : 16} />}
    </button>
  );
}
