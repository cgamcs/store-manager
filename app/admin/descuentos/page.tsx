import {
  checkAndDeactivateExpiredDiscounts,
  getDescuentos,
  getMermaProducts,
} from "./actions"
import DescuentosClient from "./descuentos-client"

export default async function DescuentosPage() {
  await checkAndDeactivateExpiredDiscounts()
  const [descuentos, mermaProducts] = await Promise.all([
    getDescuentos(),
    getMermaProducts(),
  ])

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <DescuentosClient
      initialDescuentos={descuentos as any}
      mermaProducts={mermaProducts as any}
    />
  )
}
