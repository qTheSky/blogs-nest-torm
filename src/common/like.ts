import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { LikeStatuses } from './like.types';

@Schema()
export class Like {
  _id: Types.ObjectId;

  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  addedAt: Date;

  @Prop({ required: true })
  status: LikeStatuses;

  @Prop({ required: true })
  userLogin: string;

  @Prop({ default: false })
  isUserBanned: boolean;
}
