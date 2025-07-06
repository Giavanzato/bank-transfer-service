import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import Decimal from 'decimal.js';
@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}
  getHello(): string {
    return `
    Willkommen zur Demo-API für Überweisungen im Zahlungsverkehr!
    Diese API demonstriert, wie eine bankfachliche Transaktion, nachvollziehbar und regelbasiert verarbeitet werden – inklusive Prüfungen wie Kontosaldo, Tageslimit und Anti-Geldwäsche-Vorgaben.
    **Wichtig:** Bitte rufen Sie vor der ersten Überweisung den /seed-Endpoint auf, um Testdaten (z.B. Beispielkonten) zu generieren.
    Danach können Sie Überweisungen via /transaction anstoßen und die verschiedenen Prüf- und Fehlermechanismen nachvollziehen.
    Viel Spaß beim Testen!
  `;
  }

  async seed(): Promise<{
    accountA: any;
    accountB: any;
    transaction: any;
  }> {
    const accountA = await this.prisma.account.create({
      data: {
        firstName: 'Alice',
        lastName: 'Muster',
        iban: 'DE89370400440532013000',
        currency: 'EUR',
        balance: 1000, // initialer Kontostand
        limit: 0, // Überziehungslimit
        dailyLimit: 5000, // Tageslimit (EUR)
        amlThreshold: 10000, // AML-Schwelle (EUR)
      },
    });

    const accountB = await this.prisma.account.create({
      data: {
        firstName: 'Bob',
        lastName: 'Beispiel',
        iban: 'DE75512108001245126199',
        currency: 'EUR',
        balance: 500,
        limit: 0,
        // dailyLimit: 5000,
        // amlThreshold: 10000,
      },
    });

    // 2) Eine Transaktion von A nach B
    const transaction = await this.prisma.transaction.create({
      data: {
        fromAccountId: accountA.id,
        toAccountId: accountB.id,
        amount: 150,
        purpose: 'Test-Transaction',
        status: 'SUCCESS',
        balanceBeforeFrom: accountA.balance,
        balanceAfterFrom: Number(accountA.balance) - 150,
        balanceBeforeTo: accountB.balance,
        balanceAfterTo: Number(accountB.balance) + 150,
        // createdAt wird automatisch per Default(now()) gesetzt
      },
    });

    return { accountA, accountB, transaction };
  }
}
