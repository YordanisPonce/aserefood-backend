export default function createPatchFields<T>(dto: T): Partial<T> {
  const updateFields: Partial<T> = {};

  for (const key of Object.keys(dto)) {
    if (dto[key] !== undefined) {
      updateFields[key] = dto[key];
    }
  }

  return updateFields;
}