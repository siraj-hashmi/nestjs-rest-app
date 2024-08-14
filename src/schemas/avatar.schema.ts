import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Avatar extends Document {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ required: true })
  avatarHash: string;

  @Prop({ required: true })
  filePath: string;
}

export const AvatarSchema = SchemaFactory.createForClass(Avatar);
