export type ProductOption = { id: string; name: string };

export function uniqueProductOptions(
  options: ProductOption[],
  preferredId?: string
): ProductOption[] {
  const preferred = preferredId
    ? options.find((option) => option.id === preferredId)
    : null;
  const uniqueOptions = new Map<string, ProductOption>();

  for (const option of options) {
    const key = normalizeOptionName(option.name);
    if (!uniqueOptions.has(key)) uniqueOptions.set(key, option);
  }

  if (preferred) {
    uniqueOptions.set(normalizeOptionName(preferred.name), preferred);
  }

  return Array.from(uniqueOptions.values()).sort((first, second) =>
    first.name.localeCompare(second.name, "es", { sensitivity: "base" })
  );
}

function normalizeOptionName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
