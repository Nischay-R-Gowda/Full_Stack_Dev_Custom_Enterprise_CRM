export default function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false, className = '', type = 'button', ...props }) {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    secondary: 'bg-white text-surface-700 border border-surface-300 hover:bg-surface-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-surface-600 hover:bg-surface-100',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  }
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
