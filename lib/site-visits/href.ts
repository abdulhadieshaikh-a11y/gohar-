/** Builds the booking URL, pre-selecting a project and/or recording the story the visitor came from. */
export function siteVisitHref(opts: { project?: string; from?: string } = {}): string {
  const params = new URLSearchParams();
  if (opts.project) params.set("project", opts.project);
  if (opts.from) params.set("from", opts.from);
  const q = params.toString();
  return `/site-visit${q ? `?${q}` : ""}`;
}
