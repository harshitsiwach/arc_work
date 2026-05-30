interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border p-12 text-center" style={{ borderColor: "var(--color-bd)" }}>
      <div className="mb-4 h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-bg-hover)" }}>
        <svg className="h-6 w-6" style={{ color: "var(--color-fg-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold" style={{ color: "var(--color-fg)" }}>{title}</h3>
      <p className="mt-1 text-sm max-w-sm" style={{ color: "var(--color-fg-secondary)" }}>{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
