export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-8 h-8 rounded-lg animate-spin"
          style={{
            border: "2px solid var(--color-bd)",
            borderTopColor: "var(--color-accent)",
          }}
        />
        <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>
          Loading...
        </p>
      </div>
    </div>
  );
}
