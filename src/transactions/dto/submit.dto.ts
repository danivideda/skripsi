import { IsNotEmpty, IsString } from "class-validator"

export class SubmitDto {
  @IsNotEmpty()
  @IsString()
  public address: string

  @IsNotEmpty()
  @IsString()
  public cborHex: string
}