import { Table, Column, Model, ForeignKey } from "sequelize-typescript"
import Product from "./Product.model"
import Ticket from "./Ticket.model"

@Table({
  tableName: "product_ticket",
  timestamps: false // opcional
})
class ProductTicket extends Model {
  @ForeignKey(() => Product)
  @Column
  declare productId: number

  @ForeignKey(() => Ticket)
  @Column
  declare ticketd: number
}

export default ProductTicket