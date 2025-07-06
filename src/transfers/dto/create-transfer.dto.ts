import { ApiProperty } from '@nestjs/swagger';
import { IsIBAN, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransferDto {
  @ApiProperty({
    example: 'DE89370400440532013000',
    description: 'Absender-IBAN',
  })
  @IsIBAN()
  fromIban: string;

  @ApiProperty({
    example: 'DE75512108001245126199',
    description: 'Empfänger-IBAN',
  })
  @IsIBAN()
  toIban: string;

  @ApiProperty({ example: 100.5, description: 'Betrag in EUR' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'Rechnung 4711', description: 'Verwendungszweck' })
  @IsNotEmpty()
  purpose: string;
}
