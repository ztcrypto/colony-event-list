export default function dateFormat(date: Date): string {
  const mo = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
  const da = new Intl.DateTimeFormat("en", { day: "numeric" }).format(date);
  return `${da} ${mo}`;
}
