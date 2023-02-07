import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

@Schema()
export class BannedUserInBlog {
  _id: Types.ObjectId;

  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  blogId: Types.ObjectId;

  @Prop({ required: true })
  banDate: Date;

  @Prop({ required: true })
  banReason: string;
}

export const BannedUserInBlogSchema = SchemaFactory.createForClass(BannedUserInBlog);

BannedUserInBlogSchema.methods = {};

// const bannedUserInBlogStaticMethods: BannedUserInBlogStatics = {};

// BannedUserInBlogSchema.statics = bannedUserInBlogStaticMethods;

// type BannedUserInBlogStatics = {};

export type BannedUserInBlogDocument = HydratedDocument<BannedUserInBlog>;
export type BannedUserInBlogModel = Model<BannedUserInBlogDocument>;
// & BannedUserInBlogStatics;
