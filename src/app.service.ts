import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import Decimal from 'decimal.js';
@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}
  getHello(): string {
    return `
    Willkommen zur Demo-API für Überweisungen im Zahlungsverkehr!
    Diese API demonstriert, wie eine bankfachliche Transaktion, nachvollziehbar und regelbasiert verarbeitet werden – inklusive Prüfungen wie Kontosaldo, Tageslimit und Blacklists.
    **Wichtig:** Bitte rufen Sie vor der ersten Überweisung den /seed-Endpoint auf, um Testdaten (z.B. Beispielkonten) zu generieren.
    Danach können Sie Überweisungen via /transaction anstoßen und die verschiedenen Prüf- und Fehlermechanismen nachvollziehen.
    Viel Spaß beim Testen!
  `;
  }

  async seed(): Promise<{
    alice: any;
    bob: any;
    iran: any;
    transactions: any[];
  }> {
    const alice = await this.prisma.account.create({
      data: {
        companyName: 'Alice GmbH',
        iban: 'DE89370400440532013000',
        currency: 'EUR',
        balance: 1000,
        limit: 0,
        dailyLimit: 5000,
      },
    });

    const bob = await this.prisma.account.create({
      data: {
        companyName: 'Bob AG',
        iban: 'DE75512108001245126199',
        currency: 'EUR',
        balance: 1000,
        limit: 0,
        dailyLimit: 100,
      },
    });

    // Iranischer Testkunde mit gültiger IBAN
    const iran = await this.prisma.account.create({
      data: {
        companyName: 'Tehran Export LLC',
        iban: 'IR820540102680020817909002', // Gültige IR-IBAN
        currency: 'IRR',
        balance: 1000,
        limit: 0,
        dailyLimit: 10000,
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

    // Testüberweisung nach Iran (wird durch Sanktions-Check geblockt!)
    const txAliceToIran = await this.prisma.transaction.create({
      data: {
        fromAccountId: alice.id,
        toAccountId: iran.id,
        amount: 200,
        purpose: 'Test Sanktionsprüfung',
        status: 'SUCCESS',
        balanceBeforeFrom: 1000,
        balanceAfterFrom: 800,
        balanceBeforeTo: 1000,
        balanceAfterTo: 1200,
      },
    });

    return {
      alice,
      bob,
      iran,
      transactions: [txBob1, txAliceToIran],
    };
  }

  async reset(): Promise<void> {
    await this.prisma.transaction.deleteMany({});
    await this.prisma.account.deleteMany({});
  }
}
