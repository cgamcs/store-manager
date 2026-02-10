import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript"
import Product from "./Product.model"

@Table({
  tableName: "categories"
})
class Category extends Model {
  @Column({
    type: DataType.STRING(100)
  })
  declare name: string

  @Column({
    type: DataType.TEXT
  })
  declare description: string

  @Column({
    type: DataType.STRING(50)
  })
  declare color: string

  // Relación uno a muchos con productos
  @HasMany(() => Product)
  declare products: Product[]
}

export default Category