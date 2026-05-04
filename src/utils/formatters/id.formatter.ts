export default function idFormatter(id: number, length: number = 12) {
  return id.toString().padStart(length, '0');
}
