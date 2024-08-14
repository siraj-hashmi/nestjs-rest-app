import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { Avatar } from 'src/schemas/avatar.schema';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import axios from 'axios';
import * as amqp from 'amqplib';

@Injectable()
export class UserService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Avatar.name) private avatarModel: Model<Avatar>,
    private rabbitMQService: RabbitMQService,
  ) {}

  async onModuleInit() {
    this.connection = await amqp.connect(
      process.env.RABBITMQ_URL || 'amqp://localhost',
    );
    this.channel = this.rabbitMQService.getChannel();
  }

  async onModuleDestroy() {
    await this.connection.close();
  }

  async createUser(createUserDto: any): Promise<User> {
    const createdUser = await this.userModel.create(createUserDto);

    // Emit a RabbitMQ event
    this.channel.sendToQueue(
      'user.created',
      Buffer.from(JSON.stringify(createdUser)),
    );

    return createdUser;
  }

  private ensureAvatarsDirectory() {
    const dir = path.join(__dirname, '../../avatars');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async getAvatar(userId: string, avatarUrl: string): Promise<string> {
    const existingAvatar = await this.avatarModel.findOne({ userId }).exec();
    if (existingAvatar) {
      const fileBuffer = fs.readFileSync(existingAvatar.filePath);
      return fileBuffer.toString('base64');
    }

    this.ensureAvatarsDirectory();

    const response = await axios.get(avatarUrl, {
      responseType: 'arraybuffer',
    });
    const fileBuffer = Buffer.from(response.data, 'binary');

    const avatarHash = crypto
      .createHash('sha256')
      .update(fileBuffer)
      .digest('hex');
    const filePath = path.join(__dirname, `../../avatars/${avatarHash}.png`);

    fs.writeFileSync(filePath, fileBuffer);

    const createdAvatar = new this.avatarModel({
      userId,
      avatarHash,
      filePath,
    });
    await createdAvatar.save();

    return fileBuffer.toString('base64');
  }

  async deleteAvatar(userId: string): Promise<void> {
    const avatar = await this.avatarModel.findOneAndDelete({ userId }).exec();
    if (avatar && fs.existsSync(avatar.filePath)) {
      fs.unlinkSync(avatar.filePath);
    }
  }
}
