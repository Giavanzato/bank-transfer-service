// src/transfers/transfers.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransferEntity } from './entities/transfer.entity';

@ApiTags('transfers')
@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  @ApiOperation({ summary: 'Erstelle neue Überweisung' })
  @ApiResponse({ status: 201, type: TransferEntity })
  async create(@Body() dto: CreateTransferDto) {
    return this.transfersService.createTransaction(dto);
  }

  /* @Get()
  @ApiOperation({ summary: 'Liste alle Überweisungen' })
  @ApiResponse({ status: 200, type: [TransferEntity] })
  async findAll() {
    return this.transfersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Hole Überweisung nach ID' })
  @ApiResponse({ status: 200, type: TransferEntity })
  @ApiResponse({ status: 404, description: 'Nicht gefunden' })
  async findOne(@Param('id') id: string) {
    return this.transfersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Aktualisiere Überweisung' })
  @ApiResponse({ status: 200, type: TransferEntity })
  async update(@Param('id') id: string, @Body() dto: UpdateTransferDto) {
    return this.transfersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Lösche Überweisung' })
  @ApiResponse({ status: 200, description: 'Gelöscht' })
  async remove(@Param('id') id: string) {
    return this.transfersService.remove(id);
  } */
}
