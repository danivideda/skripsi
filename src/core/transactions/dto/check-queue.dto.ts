import { IsNotEmpty, IsString, Length } from 'class-validator';

export class GetStatusDTO {
  @IsNotEmpty()
  @IsString()
  @Length(58)
  public stakeAddressHex: string;
}
