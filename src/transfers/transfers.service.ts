// src/transfers/transfers.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';

@Injectable()
export class TransfersService {
  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(dto: CreateTransferDto) {
    const { fromIban, toIban, amount, purpose } = dto;

    return this.prisma.$transaction(async (tx) => {
      // 1) Konten nach IBAN laden
      const fromAccount = await tx.account.findUnique({
        where: { iban: fromIban },
      });
      if (!fromAccount)
        throw new NotFoundException(
          `Account mit IBAN ${fromIban} nicht gefunden`,
        );
      const toAccount = await tx.account.findUnique({
        where: { iban: toIban },
      });
      if (!toAccount)
        throw new NotFoundException(
          `Account mit IBAN ${toIban} nicht gefunden`,
        );

      // 2) Salden berechnen
      const balanceBeforeFrom = fromAccount.balance;
      const balanceAfterFrom = balanceBeforeFrom.minus(amount);
      if (balanceAfterFrom.lt(fromAccount.limit.neg())) {
        throw new BadRequestException('Überziehungslimit überschritten');
      }
      const balanceBeforeTo = toAccount.balance;
      const balanceAfterTo = balanceBeforeTo.plus(amount);

      // 3) Konten aktualisieren
      await tx.account.update({
        where: { iban: fromIban },
        data: { balance: balanceAfterFrom },
      });
      await tx.account.update({
        where: { iban: toIban },
        data: { balance: balanceAfterTo },
      });

      // 4) Transaktion anlegen und alle Pflichtfelder mitliefern
      return tx.transaction.create({
        data: {
          fromAccountId: fromAccount.id,
          toAccountId: toAccount.id,
          amount,
          purpose,
          status: 'SUCCESS',
          balanceBeforeFrom: balanceBeforeFrom,
          balanceAfterFrom: balanceAfterFrom,
          balanceBeforeTo: balanceBeforeTo,
          balanceAfterTo: balanceAfterTo,
          // createdAt bekommt Prisma per Default(now()) automatisch
        },
      });
    });
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
