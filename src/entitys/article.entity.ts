import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  AfterLoad,
  CreateDateColumn,
  UpdateDateColumn,
  Timestamp,
} from 'typeorm';
import { UsersEntity } from './users.entity';
import { ArticleClassifyEntity } from './article-classify.entity';
import { CommentEntity } from './comment.entity';
import { TopicEntity } from '@src/entitys/topic.entity';
import { UserArticleLikeEntity } from './user-article-like.entity';

export const enum ArticleType {
  Graphic, // 图文
  PlainText, // 纯文
  Share, // 分享
  Video,
}
export interface IVideo {
  playCount: number;
  videoUrl: string;
  pic: string;
}

@Index('article-classify_id', ['articleClassifyId'], {})
@Index('share_id', ['shareId'], {})
@Index('user_id', ['userId'], {})
@Entity('article', { schema: 'joke' })
export class ArticleEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'title', comment: '文章的标题', length: 30 })
  title: string;

  @Column('varchar', {
    name: 'pic',
    comment: '文章的封面',
    length: 200,
    nullable: true,
  })
  pic: string | null;

  @Column('text', {
    name: 'content',
    comment: '文章的内容',
  })
  content: string;

  @Column('int', {
    name: 'like_count_order',
    comment: '文章的点赞数',
    default: 0,
  })
  likeCountOrder: number;

  @Column('simple-json', {
    name: 'content-imgs',
    nullable: true,
    comment: '文章内容的图片url 在orm中映射为json数组',
  })
  contentImg: string[] | null;

  @Column('simple-json', {
    name: 'video',
    nullable: true,
    comment: '文章视频数据',
  })
  video: IVideo | null;

  @Column('int', {
    name: 'privacy-status',
    nullable: true,
    default: () => 0,
    comment: '隐私状态 0所有人可见 1 仅自己可见',
  })
  privacyStatus: 0 | 1 | null;

  @Column('varchar', {
    name: 'address',
    nullable: true,
    comment: '发布文章的地址',
  })
  address: string | null;

  @Column('int', {
    name: 'type',
    comment: '文章的类型 0 代表图文 1代表纯文字 2代表分享 ',
  })
  type: ArticleType;

  @Column('int', {
    name: 'share-count',
    nullable: true,
    comment: '被分享的数量',
    default: () => '0',
  })
  shareCount: number | null;

  @Column('int', {
    name: 'share_id',
    nullable: true,
    comment: '引用的文章id 只有在文章type类型为2时有效',
  })
  shareId: number | null;

  @Column('int', { name: 'user_id', comment: '用户的id' })
  userId: number;

  @Column('int', {
    name: 'article-classify_id',
    comment: '文章分类的id',
    nullable: true,
  })
  articleClassifyId: number | null;

  @Column('int', {
    name: 'comment-status',
    nullable: true,
    comment: '文章的评论状态 0可用 1禁用',
    default: () => 0,
  })
  commentStatus: number | null;

  @Column('int', {
    name: 'status',
    nullable: true,
    comment: '文章的状态 0可见 1禁用',
    default: () => 0,
  })
  status: number | null;

  @CreateDateColumn()
  createAt: Timestamp;

  @UpdateDateColumn()
  updateAt: Timestamp;

  @ManyToOne(() => UsersEntity, (users) => users.articles, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: UsersEntity;

  @ManyToOne(
    () => ArticleClassifyEntity,
    (articleClassify) => articleClassify.articles,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn([{ name: 'article-classify_id', referencedColumnName: 'id' }])
  articleClassify: ArticleClassifyEntity;

  @ManyToOne(() => ArticleEntity, (article) => article.articles, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'share_id', referencedColumnName: 'id' }])
  share: ArticleEntity;

  @OneToMany(() => ArticleEntity, (article) => article.share)
  articles: ArticleEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.article)
  comments: CommentEntity[];

  @ManyToMany(() => TopicEntity, (TopicEntity) => TopicEntity.articles)
  topics: TopicEntity[];

  @OneToMany(
    () => UserArticleLikeEntity,
    (userArticlesLike) => userArticlesLike.article,
  )
  userArticlesLikes: UserArticleLikeEntity[];
}
