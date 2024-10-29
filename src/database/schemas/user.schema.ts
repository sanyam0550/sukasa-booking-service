import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../auth/enums/user-role.enum';
@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.USER })
  role: UserRole;
}

const UserSchema = SchemaFactory.createForClass(User);
export { UserSchema };
