import { IsIBAN, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransferDto {
  @IsIBAN()
  fromIban: string;

  @IsIBAN()
  toIban: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  purpose: string;
}
