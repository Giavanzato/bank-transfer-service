import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}
  getHello(): string {
    return 'Hello World!';
  }

  async seed(): Promise<{
    accountA: any;
    accountB: any;
    transaction: any;
  }> {
    // 1) Accounts anlegen
    const accountA = await this.prisma.account.create({
      data: {
        firstName: 'Alice',
        lastName: 'Muster',
        iban: 'DE12500105170648489890',
        currency: 'EUR',
        balance: 1000,
        limit: 0,
      },
    });

    const accountB = await this.prisma.account.create({
      data: {
        firstName: 'Bob',
        lastName: 'Beispiel',
        iban: 'DE44500105178821782364',
        currency: 'EUR',
        balance: 500,
        limit: 0,
      },
    });

    // 2) Eine Transaktion von A nach B
    const transaction = await this.prisma.transaction.create({
      data: {
        fromAccountId: accountA.id,
        toAccountId: accountB.id,
        amount: 150,
        purpose: 'Test-Transfer',
        status: 'SUCCESS',
        balanceBeforeFrom: accountA.balance,
        balanceAfterFrom: Number(accountA.balance) - 150,
        balanceBeforeTo: accountB.balance,
        balanceAfterTo: Number(accountB.balance) + 150,
        // createdAt wird automatisch gesetzt
      },
    });

    return { accountA, accountB, transaction };
  }
}
