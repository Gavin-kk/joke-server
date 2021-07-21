import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("article-classify", { schema: "joke" })
export class ArticleClassify {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "title", comment: "文章分类的标题", length: 30 })
  title: string;

  @Column("int", {
    name: "status",
    nullable: true,
    comment: "文章分类的状态 0可见 1表示被禁用",
    default: () => "'0'",
  })
  status: number | null;

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
}
