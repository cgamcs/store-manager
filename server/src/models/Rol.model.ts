import { Table, Column, Model, DataType, BelongsToMany } from "sequelize-typescript"
import User from "./User.model"
import UserRol from "./UserRol.model"

@Table({
  tableName: "rols"
})

class Rol extends Model {
  @Column({
    type: DataType.STRING(100)
  })
  declare name: string

  // Relación muchos a muchos
  @BelongsToMany(() => User, () => UserRol)
  declare users: User[]
}

export default Rol