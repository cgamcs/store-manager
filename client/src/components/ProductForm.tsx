import type { Product } from "@/types"

type ProductFormProps = {
  product?: Product
}

function ProductForm({product}: ProductFormProps) {
  return (
    <>
      <div className="mb-4">
        <label htmlFor="name">Nombre Producto:</label>
        <input
          type="text"
          className="mt-2 block w-full bg-[#10131e] focus-visible:outline-0 p-3 rounded-md"
          placeholder="Nombre del Producto"
          name="name"
          defaultValue={product?.name}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="price">Precio:</label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="mt-2 block w-full bg-[#10131e] focus-visible:outline-0 p-3 rounded-md"
          placeholder="Precio del Producto"
          name="price"
          defaultValue={product?.price}
        />
      </div>
    </>
  )
}

export default ProductForm