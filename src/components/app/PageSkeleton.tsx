export function PageSkeleton() {
  return (
    <main className="flex flex-col gap-4 px-4 py-8 md:px-8" aria-busy="true" aria-label="Cargando">
      <div className="skeleton h-8 w-44 rounded-xl" />
      <div className="skeleton h-36 rounded-card" />
      <div className="skeleton h-44 rounded-card" />
      <div className="skeleton h-16 rounded-2xl" />
      <div className="skeleton h-16 rounded-2xl" />
    </main>
  );
}
