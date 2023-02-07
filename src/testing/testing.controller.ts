import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('testing')
export class TestingController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteEntireDataInDb() {
    try {
      await this.connection.db.dropDatabase();
      return;
    } catch (e) {
      console.log(e);
    }
  }
}
