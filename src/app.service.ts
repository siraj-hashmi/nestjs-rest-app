import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  payeverTest(): string {
    return 'Payever Test!';
  }
}
