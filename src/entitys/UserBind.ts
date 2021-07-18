import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./Users";

@Entity("user_bind", { schema: "joke" })
export class UserBind {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", {
    name: "type",
    comment: "第三方登录的类型 (微信, qq, 微博)...",
    length: 20,
  })
  type: string;

  @Column("text", { name: "openid", comment: "第三方平台的openid" })
  openid: string;

  @Column("varchar", {
    name: "nickname",
    nullable: true,
    comment: "第三方账号在第三方平台的昵称",
    length: 100,
  })
  nickname: string | null;

  @Column("text", { name: "avatar", nullable: true, comment: "第三方头像" })
  avatar: string | null;

  @Column("timestamp", {
    name: "createAt",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createAt: Date | null;

  @Column("timestamp", {
    name: "updateAt",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updateAt: Date | null;

  @OneToMany(() => Users, (users) => users.userBind)
  users: Users[];
}
