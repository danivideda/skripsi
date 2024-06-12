import { IsArray, IsInt, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsString()
  @Length(58)
  public stakeAddressHex: string;

  @IsNotEmpty()
  @IsString()
  public destinationAddressBech32: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  public utxos: Array<string>;

  @IsNotEmpty()
  @IsInt()
  public lovelace: number;
}
