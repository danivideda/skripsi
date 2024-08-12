import { IsNotEmpty, IsString, Length } from 'class-validator';

export class GetBatchDto {
  @IsNotEmpty()
  @IsString()
  @Length(58)
  public stakeAddressHex: string;
}
