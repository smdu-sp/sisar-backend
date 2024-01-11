import { IsEmail, IsString, Length } from 'class-validator';

export class LoginRequestBody {
  @IsString({ message: "Login precisa ser um texto." })
  @Length(7, 7, { message: "Login precisa ter 7 caracteres." })
  login: string;

  @IsString({ message: "A senha precisa ser um texto." })
  senha: string;
}
