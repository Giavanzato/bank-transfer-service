import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import Decimal from 'decimal.js';
import { Prisma } from '@prisma/client';

export class TransferRulesService {
  static ensureSufficientFundsAndLimit(
    balance: Decimal,
    limit: Decimal,
    amount: number,
  ) {
    const after = new Decimal(balance).minus(amount);
    if (after.lt(new Decimal(limit).neg())) {
      throw new BadRequestException('Überziehungslimit überschritten');
    }
  }
  static ensureAmlCompliance(amount: number, amlThreshold: Decimal) {
    if (new Decimal(amount).gt(new Decimal(amlThreshold))) {
      throw new BadRequestException(
        `Betrag übersteigt AML-Schwelle von ${Number(amlThreshold)} EUR`,
      );
    }
  }

  static async ensureDailyLimitNotExceeded(
    tx: Prisma.TransactionClient,
    accountId: string,
    amount: number,
    dailyLimit: Decimal,
  ) {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const { _sum } = await tx.transaction.aggregate({
      where: {
        fromAccountId: accountId,
        createdAt: { gte: startOfDay },
      },
      _sum: { amount: true },
    });

    const todaySum = new Decimal(_sum.amount ?? 0);
    if (todaySum.plus(amount).gt(new Decimal(dailyLimit))) {
      throw new BadRequestException(
        `Tägliches Limit von ${Number(dailyLimit)} EUR überschritten`,
      );
    }
  }
}
