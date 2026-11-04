// Mensaje limpio de un RAISE EXCEPTION de Postgres (vía adapter-pg) o fallback.
export function dbErrorMessage(e: unknown, fallback: string): string {
  const original = (
    e as { meta?: { driverAdapterError?: { cause?: { originalMessage?: string } } } }
  )?.meta?.driverAdapterError?.cause?.originalMessage
  return original ?? (e instanceof Error ? e.message : fallback)
}
