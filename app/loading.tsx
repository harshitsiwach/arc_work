export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div
        className="w-6 h-6 rounded-full border-2 animate-spin"
        style={{
          borderColor: "var(--color-bd)",
          borderTopColor: "var(--color-accent)",
        }}
      />
    </div>
  );
}
