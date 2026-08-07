import { cn } from '@/lib/utils/cn';

export interface DataTableProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTable({ children, className }: DataTableProps) {
  return (
    <div className={cn('overflow-x-auto rounded-card border border-border bg-bg', className)}>
      <table className="w-full min-w-[640px] border-collapse text-left">{children}</table>
    </div>
  );
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-border bg-bg-tint">{children}</tr>
    </thead>
  );
}

export function DataTableHeaderCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        'px-4 py-3 text-[13px] font-semibold uppercase tracking-wide text-muted',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function DataTableRow({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? 'tr' : 'tr';
  return (
    <Comp
      className={cn(
        'border-b border-border last:border-b-0',
        onClick &&
          'cursor-pointer hover:bg-bg-tint motion-safe:transition-colors motion-safe:duration-150',
        className,
      )}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
    >
      {children}
    </Comp>
  );
}

export function DataTableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn('px-4 py-4 text-[15px] text-body', className)}>{children}</td>;
}
