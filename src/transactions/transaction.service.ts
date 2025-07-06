import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { checkAml, checkDaily, checkFunds } from './transaction-rules.service';
import Decimal from 'decimal.js';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async createTransaction({
    fromIban,
    toIban,
    amount,
    purpose,
  }: CreateTransactionDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const [from, to] = await Promise.all([
          tx.account.findUnique({ where: { iban: fromIban } }),
          tx.account.findUnique({ where: { iban: toIban } }),
        ]);

        if (!from || !to) throw new NotFoundException('Konto nicht gefunden');

        checkFunds(from.balance, from.limit, amount);
        checkAml(amount, from.amlThreshold);
        await checkDaily(tx, from.id, amount, from.dailyLimit);

        const afterFrom = new Decimal(from.balance).minus(amount);
        const afterTo = new Decimal(to.balance).plus(amount);

        await Promise.all([
          tx.account.update({
            where: { iban: fromIban },
            data: { balance: afterFrom },
          }),
          tx.account.update({
            where: { iban: toIban },
            data: { balance: afterTo },
          }),
        ]);

        return tx.transaction.create({
          data: {
            fromAccountId: from.id,
            toAccountId: to.id,
            amount,
            purpose,
            status: 'SUCCESS',
            balanceBeforeFrom: from.balance,
            balanceAfterFrom: afterFrom,
            balanceBeforeTo: to.balance,
            balanceAfterTo: afterTo,
          },
        });
      });
    } catch (e) {
      if (e instanceof NotFoundException || e instanceof BadRequestException) {
        throw e; // original Fehler (inkl. eigener Nachricht) weiterreichen!
      }
      throw new InternalServerErrorException('Transaktion fehlgeschlagen');
    }
  }
  /*async createTransaction(dto: CreateTransactionDto) {
    try {
      const result = await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const from = await tx.account.findUnique({
            where: { iban: dto.fromIban },
          });
          if (!from)
            throw new NotFoundException('Sender-Account nicht gefunden');
          const to = await tx.account.findUnique({
            where: { iban: dto.toIban },
          });
          if (!to)
            throw new NotFoundException('Empfänger-Account nicht gefunden');

          // 1. Kontosaldo & Limit prüfen
          TransactionRulesService.ensureSufficientFundsAndLimit(
            from.balance,
            from.limit,
            dto.amount,
          );

          // 2. AML-Regel prüfen
          TransactionRulesService.ensureAmlCompliance(
            dto.amount,
            from.amlThreshold,
          );

          // 3. Tageslimit prüfen
          await TransactionRulesService.ensureDailyLimitNotExceeded(
            tx,
            from.id,
            dto.amount,
            from.dailyLimit,
          );

          // Salden berechnen
          const beforeFrom = from.balance;
          const afterFrom = beforeFrom.minus(dto.amount);
          const beforeTo = to.balance;
          const afterTo = beforeTo.plus(dto.amount);

          // Kontostände updaten
          await tx.account.update({
            where: { iban: dto.fromIban },
            data: { balance: afterFrom },
          });
          await tx.account.update({
            where: { iban: dto.toIban },
            data: { balance: afterTo },
          });

          // Transaktion schreiben
          return tx.transaction.create({
            data: {
              fromAccountId: from.id,
              toAccountId: to.id,
              amount: dto.amount,
              purpose: dto.purpose,
              status: 'SUCCESS',
              balanceBeforeFrom: beforeFrom,
              balanceAfterFrom: afterFrom,
              balanceBeforeTo: beforeTo,
              balanceAfterTo: afterTo,
            },
          });
        },
      );
      return result;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(`Transaktion fehlgeschlagen`);
    }
  }

  async findAll() {
    return this.prisma.transaction.findMany();
  }

  async findOne(id: string) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx) throw new NotFoundException(`Transaction ${id} nicht gefunden`);
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
  } */
}
