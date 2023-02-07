import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

@Schema()
export class Session {
  _id: Types.ObjectId;

  @Prop({ required: true })
  issuedAt: Date;

  @Prop({ required: true })
  expiresIn: Date;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  deviceName: string;

  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  refreshToken: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

SessionSchema.methods = {};

export type SessionDocument = HydratedDocument<Session>;

export type SessionModel = Model<SessionDocument>;
