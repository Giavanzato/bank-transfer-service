/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/transfers/transfer-rules.service.ts
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import Decimal from 'decimal.js';
import { Prisma } from '@prisma/client';

export class TransferRulesService {
  /**
   * Prüft, ob after = balance - amount >= -limit.
   */
  static ensureSufficientFundsAndLimit(
    balance: Decimal,
    limit: Decimal,
    amount: number,
  ) {
    try {
      const after = new Decimal(balance).minus(amount);
      if (after.lt(new Decimal(limit).neg())) {
        throw new BadRequestException('Überziehungslimit überschritten');
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Fehler in ensureSufficientFundsAndLimit: ${error}`,
      );
    }
  }

  /**
   * Prüft, ob amount die AML-Schwelle überschreitet.
   */
  static ensureAmlCompliance(amount: number, amlThreshold: Decimal) {
    try {
      if (new Decimal(amount).gt(new Decimal(amlThreshold))) {
        throw new BadRequestException(
          `Betrag übersteigt AML-Schwelle von ${amlThreshold} EUR`,
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Fehler in ensureAmlCompliance: ${error}`,
      );
    }
  }

  /**
   * Aggregiert die Summe aller heutigen Transaktionen und prüft gegen das tägliche Limit.
   */
  static async ensureDailyLimitNotExceeded(
    tx: Prisma.TransactionClient,
    accountId: string,
    amount: number,
    dailyLimit: Decimal,
  ) {
    try {
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
          `Tägliches Limit von ${dailyLimit} EUR überschritten`,
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Fehler in ensureDailyLimitNotExceeded: ${error}`,
      );
    }
  }
}
