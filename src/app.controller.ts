import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('seed')
  async seedData() {
    try {
      const result = await this.appService.seed();
      return {
        status: 'success',
        data: result,
      };
    } catch (error) {
      // Optional: console.error(error);
      throw new InternalServerErrorException(
        'Seed-Daten konnten nicht eingespielt werden.',
      );
    }
  }
}
