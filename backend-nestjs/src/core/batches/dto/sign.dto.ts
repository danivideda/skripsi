import { IsNotEmpty, IsString } from 'class-validator';

export class SignBatchesDto {
  @IsNotEmpty()
  @IsString()
  public stakeAddressHex: string;

  @IsNotEmpty()
  @IsString()
  public signatureCborHex: string;
}
