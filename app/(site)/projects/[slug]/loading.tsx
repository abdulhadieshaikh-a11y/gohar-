/** Shown while a project page streams in during client navigation. */
export default function LoadingProject() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="min-h-[88svh] animate-pulse bg-ink-2" />
      <span className="sr-only">Loading project…</span>
    </div>
  );
}
