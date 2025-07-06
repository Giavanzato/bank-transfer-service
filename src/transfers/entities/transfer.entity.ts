import { ApiProperty } from '@nestjs/swagger';

export class TransferEntity {
  @ApiProperty({ description: 'Transfer-ID (UUID)' })
  id: string;

  @ApiProperty({ description: 'Absender-Account-ID (UUID)' })
  fromAccountId: string;

  @ApiProperty({ description: 'Empfänger-Account-ID (UUID)' })
  toAccountId: string;

  @ApiProperty({ description: 'Betrag' })
  amount: string;

  @ApiProperty({ description: 'Verwendungszweck' })
  purpose: string;

  @ApiProperty({ description: 'Status', example: 'SUCCESS' })
  status: string;

  @ApiProperty({ description: 'Saldo vor Abgang' })
  balanceBeforeFrom: string;

  @ApiProperty({ description: 'Saldo nach Abgang' })
  balanceAfterFrom: string;

  @ApiProperty({ description: 'Saldo vor Eingang' })
  balanceBeforeTo: string;

  @ApiProperty({ description: 'Saldo nach Eingang' })
  balanceAfterTo: string;

  @ApiProperty({ description: 'Erstellungszeitpunkt' })
  createdAt: Date;
}
