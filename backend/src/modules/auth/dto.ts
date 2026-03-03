import { IsDateString, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class RegisterDto {
  @IsString() @IsNotEmpty()
  name!: string;

  @IsString()
  @Matches(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/)
  whatsapp!: string;

  @IsDateString()
  birthDate!: string;

  @IsString() @IsNotEmpty()
  dioceseId!: string;

  @IsString() @IsNotEmpty()
  city!: string;

  @IsString() @IsNotEmpty()
  prayerGroup!: string;

  @IsString() @MinLength(6)
  password!: string;
}

export class LoginDto {
  @IsString()
  @Matches(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/)
  whatsapp!: string;

  @IsString() @IsNotEmpty()
  password!: string;
}
