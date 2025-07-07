import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  checkAml,
  checkDaily,
  checkFunds,
  checkSanctions,
} from './transaction-rules.service';
import Decimal from 'decimal.js';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Erstellt eine neue Transaktion zwischen zwei Konten.
   * Prüft dabei Saldo, Sanktionsliste und Tageslimit.
   */
  async createTransaction({
    fromIban,
    toIban,
    amount,
    purpose,
  }: CreateTransactionDto) {
    try {
      // Alles läuft in einer Datenbank-Transaktion ab
      return await this.prisma.$transaction(async (tx) => {
        // 1. Hole Sender- und Empfängerkonto anhand der IBAN
        const [from, to] = await Promise.all([
          tx.account.findUnique({ where: { iban: fromIban } }),
          tx.account.findUnique({ where: { iban: toIban } }),
        ]);

        // 2. Fehler, falls eines der Konten nicht gefunden wurde
        if (!from || !to) throw new NotFoundException('Konto nicht gefunden');

        // 3. Prüfe, ob das Konto genug Deckung (und Überziehungslimit) hat
        checkFunds(from.balance, from.limit, amount);

        // 4. Sanktionsprüfung (z.B. Überweisung nach Iran, Russland etc.)
        checkSanctions(to.iban);

        // 5. Prüfe Tageslimit für das sendende Konto (Summe der heutigen Abgänge + neue Transaktion)
        await checkDaily(tx, from.id, amount, from.dailyLimit);

        // 6. Berechne neue Kontostände nach der Transaktion
        const afterFrom = new Decimal(from.balance).minus(amount);
        const afterTo = new Decimal(to.balance).plus(amount);

        // 7. Aktualisiere Kontostände (Sender und Empfänger) parallel in der DB
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

        // 8. Erstelle Transaktions-Record mit allen Details und Salden (vorher/nachher)
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
      // Hier: Fehlerbehandlung, Monitoring, Alerting, Triggern von Events, Logging mit Cloud oder On-Premise Tools/Subsystemen
      // 9. Fehlerbehandlung: Bekannte Fehler weiterreichen, alles andere als Serverfehler
      if (e instanceof NotFoundException || e instanceof BadRequestException) {
        throw e;
      }
      throw new InternalServerErrorException('Transaktion fehlgeschlagen');
    }
  }

  /*
 

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
