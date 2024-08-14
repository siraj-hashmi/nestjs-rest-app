import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from 'src/user/user.controller';
import { UserService } from 'src/user/user.service';
import { User, UserSchema } from './schemas/user.schema';
import { Avatar, AvatarSchema } from './schemas/avatar.schema';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';
import { RabbitMQService } from 'src/rabbitmq//rabbitmq.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nestjs-app'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Avatar.name, schema: AvatarSchema }]),
    RabbitMQModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: 'RABBITMQ_CHANNEL',
      useFactory: (rabbitMQService: RabbitMQService) =>
        rabbitMQService.getChannel(),
      inject: [RabbitMQService],
    },
  ],
})
export class AppModule {}
