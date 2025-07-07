// transaction-checks.ts
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import Decimal from 'decimal.js';

export function checkFunds(
  balance: Decimal,
  limit: Decimal,
  amount: number,
): void {
  if (new Decimal(balance).minus(amount).lt(new Decimal(limit).neg())) {
    throw new BadRequestException('Überziehungslimit überschritten');
  }
}

export function checkAml(amount: number, amlThreshold: Decimal): void {
  if (new Decimal(amount).gt(amlThreshold)) {
    throw new BadRequestException(
      `Betrag übersteigt AML-Schwelle von ${Number(amlThreshold)} EUR`,
    );
  }
}

export async function checkDaily(
  tx: Prisma.TransactionClient,
  accountId: string,
  amount: number,
  dailyLimit: Decimal,
): Promise<void> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { _sum } = await tx.transaction.aggregate({
    where: { fromAccountId: accountId, createdAt: { gte: startOfDay } },
    _sum: { amount: true },
  });

  const todaySum = new Decimal(_sum.amount ?? 0);
  if (todaySum.plus(amount).gt(dailyLimit)) {
    throw new BadRequestException(
      `Tägliches Limit von ${Number(dailyLimit)} EUR überschritten`,
    );
  }
}

export function getCountryCodeFromIban(iban: string): string {
  if (typeof iban !== 'string' || iban.length < 2) {
    throw new BadRequestException('Ungültige IBAN');
  }
  return iban.substring(0, 2).toUpperCase();
}

const SANCTIONED_COUNTRIES: string[] = ['RU', 'BY', 'IR', 'KP', 'SY', 'CU'];

export function checkSanctions(iban: string): void {
  const countryCode = getCountryCodeFromIban(iban);
  if (SANCTIONED_COUNTRIES.includes(countryCode)) {
    throw new BadRequestException(
      `Überweisungen in das Land ${countryCode} sind aufgrund von Sanktionen nicht erlaubt`,
    );
  }
}
