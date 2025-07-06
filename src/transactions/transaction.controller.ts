import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Transaction } from './entities/transaction.entity';

@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Erstelle neue Überweisung' })
  @ApiResponse({ status: 201, type: Transaction })
  async create(@Body() dto: CreateTransactionDto) {
    return this.transactionService.createTransaction(dto);
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
