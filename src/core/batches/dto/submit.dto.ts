import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SubmitTxDto {
  @IsNotEmpty()
  @IsString()
  @Length(58)
  public aggregatedTxId: string;
}
