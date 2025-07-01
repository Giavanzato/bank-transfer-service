// src/transfers/transfers.service.ts
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';

@Injectable()
export class TransfersService {
  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(dto: CreateTransferDto) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1) Load source account
        const fromAccount = await tx.account.findUnique({
          where: { iban: dto.fromIban },
        });
        if (!fromAccount) {
          throw new NotFoundException(
            `Account mit IBAN ${dto.fromIban} nicht gefunden`,
          );
        }

        // 2) Load destination account
        const toAccount = await tx.account.findUnique({
          where: { iban: dto.toIban },
        });
        if (!toAccount) {
          throw new NotFoundException(
            `Account mit IBAN ${dto.toIban} nicht gefunden`,
          );
        }

        // 3) Calculate balances
        const balanceBeforeFrom = fromAccount.balance;
        const balanceAfterFrom = balanceBeforeFrom.minus(dto.amount);
        const balanceBeforeTo = toAccount.balance;
        const balanceAfterTo = balanceBeforeTo.plus(dto.amount);

        // 4) Check overdraft limit
        if (balanceAfterFrom.lt(fromAccount.limit.neg())) {
          throw new BadRequestException('Überziehungslimit überschritten');
        }

        // 5) Update source account balance
        await tx.account.update({
          where: { iban: dto.fromIban },
          data: { balance: balanceAfterFrom },
        });

        // 6) Update destination account balance
        await tx.account.update({
          where: { iban: dto.toIban },
          data: { balance: balanceAfterTo },
        });

        // 7) Create the transaction record
        return tx.transaction.create({
          data: {
            fromAccountId: fromAccount.id,
            toAccountId: toAccount.id,
            amount: dto.amount,
            purpose: dto.purpose,
            status: 'SUCCESS',
            balanceBeforeFrom,
            balanceAfterFrom,
            balanceBeforeTo,
            balanceAfterTo,
            // createdAt per @default(now())
          },
        });
      });

      return result;
    } catch (error) {
      // Bekannte Fehler 1:1 weiterwerfen
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      // Alle anderen als HTTP 500
      throw new InternalServerErrorException(
        'Es ist ein unerwarteter Fehler aufgetreten bei der Transaktion',
      );
    }
  }

  async findAll() {
    return this.prisma.transaction.findMany();
  }

  async findOne(id: string) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx) throw new NotFoundException(`Transfer ${id} nicht gefunden`);
    return tx;
  }

  async update(id: string, dto: UpdateTransferDto) {
    await this.findOne(id); // 404 wenn nicht existiert
    return this.prisma.transaction.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.transaction.delete({ where: { id } });
    return { deleted: true };
  }
}
