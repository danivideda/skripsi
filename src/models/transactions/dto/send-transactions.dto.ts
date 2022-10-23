import { IsNotEmpty, IsString } from 'class-validator';

export class SendDto {
  @IsNotEmpty()
  @IsString()
  public address: string;

  @IsNotEmpty()
  @IsString()
  public cborHex: string;
}
