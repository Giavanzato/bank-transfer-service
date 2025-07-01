// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // macht PrismaService in der ganzen App verfügbar
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
