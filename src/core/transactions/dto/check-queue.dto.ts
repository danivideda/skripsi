import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CheckQueueDTO {
  @IsNotEmpty()
  @IsString()
  @Length(58)
  public stakeAddressHex: string;
}
