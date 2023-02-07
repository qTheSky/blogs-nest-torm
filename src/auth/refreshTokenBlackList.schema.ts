import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

@Schema()
export class RefreshTokenBL {
  _id: Types.ObjectId;

  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  refreshToken: string;

  @Prop({ required: true })
  exp: number;
}

export const RefreshTokenBLSchema = SchemaFactory.createForClass(RefreshTokenBL);

RefreshTokenBLSchema.methods = {};

export type RefreshTokenBLDocument = HydratedDocument<RefreshTokenBL>;

export type RefreshTokenBLModel = Model<RefreshTokenBLDocument>;
