export enum ContentType {
  image = 'image',
  text = 'text',
}

export class CreateChatDto {
  content: string;
  time: number;
  targetUserId: number;
  type: ContentType;
  avatar: string;
}
