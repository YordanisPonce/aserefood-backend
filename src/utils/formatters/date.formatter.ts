export default function dateFormatter(date: Date): string {
  return new Date(date).toLocaleString().replace(',', '');
}
