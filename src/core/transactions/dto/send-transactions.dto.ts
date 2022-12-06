import { ArrayContains, IsArray, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class SendTransactionDto {
  @IsNotEmpty()
  @IsString()
  public stakeAddressHex: string;

  @IsNotEmpty()
  @IsString()
  public destinationAddressBech32: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({each: true})
  public utxos: Array<string>;

  @IsNotEmpty()
  @IsInt()
  public lovelace: number;
}
