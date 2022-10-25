import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class SendDto {
  @IsNotEmpty()
  @IsString()
  public originAddress: string;

  @IsNotEmpty()
  @IsString()
  public destinationAddress: string;

  @IsNotEmpty()
  @IsString()
  public cborHex: string;

  @IsNotEmpty()
  @IsInt()
  public lovelace: number;
}
