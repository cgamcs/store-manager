import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un monto en pesos con exactamente dos decimales.
 *
 * minimumFractionDigits sólo fija el mínimo: sin maximumFractionDigits, un
 * promedio o una ganancia con más decimales se imprime como $373.481. Acepta
 * los bigint y Decimal que devuelven los COUNT/SUM de las vistas.
 */
export function money(value: number | bigint | { toString(): string }): string {
  return `$${Number(value).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
