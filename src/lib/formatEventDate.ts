const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  // "Sept" (not the standard 3-letter "Sep") to match the Figma copy.
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Formats a CMS date value as "Tuesday, Sept 15". Accepts a plain
 * "YYYY-MM-DD" string, an ISO datetime string, or a Date — gray-matter's
 * YAML parser auto-converts unquoted frontmatter dates (what Decap CMS's
 * datetime widget writes) into real Date objects, so a bare string can't
 * be assumed here.
 */
export function formatEventDate(date: string | Date): string {
  // UTC components used throughout — `new Date("YYYY-MM-DD")` parses as UTC
  // midnight, which renders as the previous day in any timezone behind UTC
  // (all of the US) if read back with local getters.
  const d = typeof date === "string" ? new Date(date) : date;
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}
