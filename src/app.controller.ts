import { Controller, Get } from '@nestjs/common';
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
    return await this.appService.seed();
  }

  @Get('reset')
  async resetData() {
    return await this.appService.reset();
  }
}
