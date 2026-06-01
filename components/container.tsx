export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-page-enter">
      {children}
    </div>
  );
}
