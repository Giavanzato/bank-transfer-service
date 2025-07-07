import { Controller, Post, Body } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Transaction } from './entities/transaction.entity';

@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Erstelle neue Überweisung' })
  @ApiBody({
    schema: {
      example: {
        fromIban: 'DE89370400440532013000',
        toIban: 'IR820540102680020817909002', // Gültige Iran-IBAN
        amount: 200,
        purpose: 'Test Sanktionsprüfung Iran',
      },
    },
    description:
      'Beispiel: Überweisung nach Iran (wird durch Sanktionsprüfung abgelehnt)',
  })
  @ApiResponse({
    status: 400,
    description: 'Sanktionsliste: Überweisung in sanktioniertes Land',
    content: {
      'application/json': {
        example: {
          success: false,
          error: {
            statusCode: 400,
            message:
              'Überweisungen in das Land IR sind aufgrund von Sanktionen nicht erlaubt',
            error: 'BadRequestException',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Transaktion erfolgreich',
    type: Transaction,
  })
  @ApiResponse({
    status: 400,
    description: 'Überziehungslimit überschritten',
    content: {
      'application/json': {
        example: {
          success: false,
          error: {
            statusCode: 400,
            message: 'Überziehungslimit überschritten',
            error: 'BadRequestException',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Tägliches Limit überschritten',
    content: {
      'application/json': {
        example: {
          success: false,
          error: {
            statusCode: 400,
            message: 'Tägliches Limit von 100 EUR überschritten',
            error: 'BadRequestException',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Konto nicht gefunden',
    content: {
      'application/json': {
        example: {
          success: false,
          error: {
            statusCode: 404,
            message: 'Konto nicht gefunden',
            error: 'NotFoundException',
          },
        },
      },
    },
  })
  async create(@Body() dto: CreateTransactionDto) {
    return this.transactionService.createTransaction(dto);
  }
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
