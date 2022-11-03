import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class SendTransactionDto {
  @IsNotEmpty()
  @IsString()
  public stakeAddress: string;

  @IsNotEmpty()
  @IsString()
  public destinationAddress: string;

  @IsNotEmpty()
  @IsString()
  public utxos: string;

  @IsNotEmpty()
  @IsInt()
  public lovelace: number;
}
