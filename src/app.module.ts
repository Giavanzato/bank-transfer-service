import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransfersModule } from './transfers/transfers.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [TransfersModule],
})
export class AppModule {}
