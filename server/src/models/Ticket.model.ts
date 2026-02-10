import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey, BelongsToMany } from "sequelize-typescript"
import Category from "./Category.model"
import Product from "./Product.model"
import ProductTicket from "./ProductTicket.model"
import UserTicket from "./UserTicket.model"
import User from "./User.model"

@Table({
  tableName: "tickets"
})

class Ticket extends Model {
  @Column({
    type: DataType.DATE
  })
  declare date: Date

  // Relación muchos a muchos
  @BelongsToMany(() => Product, () => ProductTicket)
  declare products: Product[]

  @Column({
    type: DataType.FLOAT
  })
  declare subtotal: number

  @Column({
    type: DataType.FLOAT
  })
  declare iva: number

  @Column({
    type: DataType.FLOAT
  })
  declare total: number

  @Column({
    type: DataType.STRING(80)
  })
  declare payMethod: string

  // Relación muchos a muchos
  @BelongsToMany(() => User, () => UserTicket)
  declare users: User[]
}

export default Ticket