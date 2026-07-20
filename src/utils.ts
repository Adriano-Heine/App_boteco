export const AVATAR_COLORS = [
  'bg-amber-600 text-stone-50',
  'bg-orange-600 text-stone-50',
  'bg-red-600 text-stone-50',
  'bg-rose-600 text-stone-50',
  'bg-emerald-600 text-stone-50',
  'bg-teal-600 text-stone-50',
  'bg-cyan-600 text-stone-50',
  'bg-sky-600 text-stone-50',
  'bg-violet-600 text-stone-50',
  'bg-fuchsia-600 text-stone-50',
];

export function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Formats a raw numeric string (e.g., "1250" representing 12.50) into a BRL masked currency string "R$ 12,50"
 */
export function formatBRLInput(value: number): string {
  if (value === 0) return 'R$ 0,00';
  return (value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Parses any string and extracts a numeric representation for BRL (scaled by 100)
 * Example: "12,50" -> 12.5
 */
export function parseBRLInput(input: string): number {
  const digits = input.replace(/\D/g, '');
  if (!digits) return 0;
  return parseFloat(digits) / 100;
}
