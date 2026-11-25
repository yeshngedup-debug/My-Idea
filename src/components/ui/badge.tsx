export function Badge({
  children,
  className = '',
  variant = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
}) {
  const variantStyles = {
    default: 'border-[#ded8cb] bg-[#eeeae1] text-[#17352b]',
    outline: 'border-[#ded8cb] bg-[#fffefa] text-body-secondary',
    secondary: 'border-[#17352b] bg-[#17352b] text-[#fffefa]',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
