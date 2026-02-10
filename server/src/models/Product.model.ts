import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BelongsToMany } from "sequelize-typescript"
import Category from "./Category.model"
import Ticket from "./Ticket.model"
import ProductTicket from "./ProductTicket.model"
import ProductOrder from "./ProductOrder.model"
import Order from "./Order.model"

@Table({
  tableName: "products"
})

class Product extends Model {
  @Column({
    type: DataType.STRING(100)
  })
  declare name: string

  @Column({
    type: DataType.STRING(80)
  })
  declare sku: string

  @Column({
    type: DataType.STRING(50)
  })
  declare unity: string

  @Column({
    type: DataType.FLOAT
  })
  declare cost: number

  @Column({
    type: DataType.FLOAT
  })
  declare price: number

  // Foreign key
  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER
  })
  declare categoryId: number

  // Relación
  @BelongsTo(() => Category)
  declare category: Category

  // Relación muchos a muchos
  @BelongsToMany(() => Ticket, () => ProductTicket)
  declare tickets: Ticket[]

  // Relación muchos a muchos
  @BelongsToMany(() => Order, () => ProductOrder)
  declare products: Order[]

  @Column({
    type: DataType.INTEGER
  })
  declare stock: number

  @Column({
    type: DataType.INTEGER
  })
  declare minstock: number

  @Column({
    type: DataType.STRING(50)
  })
  declare status: string

  @Column({
    type: DataType.TEXT
  })
  declare description: string
}

export default Product