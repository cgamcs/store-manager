import { Table, Column, Model, ForeignKey } from "sequelize-typescript"
import Product from "./Product.model"
import Order from "./Order.model"

@Table({
  tableName: "product_order",
  timestamps: false // opcional
})
class ProductOrder extends Model {
  @ForeignKey(() => Product)
  @Column
  declare productId: number

  @ForeignKey(() => Order)
  @Column
  declare order: number
}

export default ProductOrder