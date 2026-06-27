interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/** Used inside the investor (dark) screens. */
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between px-4 pt-5 pb-4">
      <div>
        <h1 className="font-display text-xl font-bold text-inv-ink leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-inv-ink3 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
}
