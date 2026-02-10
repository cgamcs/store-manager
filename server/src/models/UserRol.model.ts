import { Table, Column, Model, ForeignKey } from "sequelize-typescript"
import User from "./User.model"
import Rol from "./Rol.model"

@Table({
  tableName: "user_rol",
  timestamps: false // opcional
})
class UserRol extends Model {
  @ForeignKey(() => User)
  @Column
  declare userId: number

  @ForeignKey(() => Rol)
  @Column
  declare rolId: number
}

export default UserRol