import { Table, Column, Model, DataType, BelongsToMany } from "sequelize-typescript"
import Rol from "./Rol.model"
import UserRol from "./UserRol.model"
import Ticket from "./Ticket.model"
import UserTicket from "./UserTicket.model"

@Table({
  tableName: "users"
})

class User extends Model {
  @Column({
    type: DataType.STRING(80)
  })
  declare name: string

  @Column({
    type: DataType.STRING(100)
  })
  declare email: string

  @Column({
    type: DataType.BOOLEAN
  })
  declare status: boolean

  // Relación muchos a muchos
  @BelongsToMany(() => Rol, () => UserRol)
  declare rols: Rol[]

  // Relación muchos a muchos
  @BelongsToMany(() => Ticket, () => UserTicket)
  declare tickets: Ticket[]
}

export default User