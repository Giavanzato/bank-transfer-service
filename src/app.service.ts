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
    alice: any;
    bob: any;
    charlie: any;
    transactions: any[];
  }> {
    const alice = await this.prisma.account.create({
      data: {
        firstName: 'Alice',
        lastName: 'Muster',
        iban: 'DE89370400440532013000', // 1000 EUR, Limit 0
        currency: 'EUR',
        balance: 1000,
        limit: 0,
        dailyLimit: 5000,
        amlThreshold: 10000,
      },
    });

    const bob = await this.prisma.account.create({
      data: {
        firstName: 'Bob',
        lastName: 'Tageslimit',
        iban: 'DE75512108001245126199', // 1000 EUR, Tageslimit 100
        currency: 'EUR',
        balance: 1000,
        limit: 0,
        dailyLimit: 100,
        amlThreshold: 10000,
      },
    });

    const charlie = await this.prisma.account.create({
      data: {
        firstName: 'Charlie',
        lastName: 'AMLTest',
        iban: 'DE44500105175407324931', // 1000 EUR, AML-Schwelle 50
        currency: 'EUR',
        balance: 1000,
        limit: 0,
        dailyLimit: 5000,
        amlThreshold: 50,
      },
    });

    // Bob macht heute schon eine Überweisung über 90 EUR
    const txBob1 = await this.prisma.transaction.create({
      data: {
        fromAccountId: bob.id,
        toAccountId: alice.id,
        amount: 90,
        purpose: 'Tageslimit Test Vorbelegung',
        status: 'SUCCESS',
        balanceBeforeFrom: 1000,
        balanceAfterFrom: 910,
        balanceBeforeTo: 1000,
        balanceAfterTo: 1090,
      },
    });

    return {
      alice,
      bob,
      charlie,
      transactions: [txBob1],
    };
  }

  async reset(): Promise<void> {
    await this.prisma.transaction.deleteMany({});
    await this.prisma.account.deleteMany({});
  }
}
