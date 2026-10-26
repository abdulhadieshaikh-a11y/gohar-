/**
 * Careers content. No vacancies have been confirmed by the company, so the
 * list is empty and the page shows a "no current openings" state.
 *
 * To publish a vacancy, add an entry below (only with HR approval).
 * Online CV upload is deliberately not built yet: it needs an approved
 * storage location, retention policy and HR inbox. See README → Careers.
 */
export interface Vacancy {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract";
  summary: string;
  responsibilities: string[];
  requirements: string[];
  postedOn: string;
}

export const vacancies: Vacancy[] = [];
