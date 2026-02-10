import { Table, Column, Model, DataType, BelongsToMany } from "sequelize-typescript"
import Product from "./Product.model"
import ProductOrder from "./ProductOrder.model"

@Table({
  tableName: "rols"
})

class Order extends Model {
  // Relación muchos a muchos
  @BelongsToMany(() => Product, () => ProductOrder)
  declare products: Product[]

  @Column({
    type: DataType.INTEGER
  })
  declare quantity: number
}

export default Order