import { Table, Column, Model, ForeignKey } from "sequelize-typescript"
import User from "./User.model"
import Ticket from "./Ticket.model"

@Table({
  tableName: "user_ticket",
  timestamps: false // opcional
})
class UserTicket extends Model {
  @ForeignKey(() => User)
  @Column
  declare productId: number

  @ForeignKey(() => Ticket)
  @Column
  declare ticketd: number
}

export default UserTicket