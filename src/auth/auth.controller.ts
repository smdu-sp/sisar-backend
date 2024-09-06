import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthRequest } from './models/AuthRequest';
import { IsPublic } from './decorators/is-public.decorator';
import { UsuarioAtual } from './decorators/usuario-atual.decorator';
import { Usuario } from '@prisma/client';
import { RefreshAuthGuard } from './guards/refresh.guard';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsuarioToken } from './models/UsuarioToken';
import { LoginDto } from './models/login.dto';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login') //localhost:3000/login
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description: 'Senha e login para autenticação por JWT',
    type: LoginDto
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna 200 se tiver sucesso no login.',
    type: UsuarioToken
  })
  @UseGuards(LocalAuthGuard)
  @IsPublic()
  login(@Request() req: AuthRequest) {
    return this.authService.login(req.user);
  }

  @Post('refresh') //localhost:3000/refresh
  @ApiResponse({
    status: 200,
    description: 'Retorna 200 se o token for atualizado.',
  })
  @IsPublic()
  @UseGuards(RefreshAuthGuard)
  refresh(@UsuarioAtual() usuario: Usuario) {
    return this.authService.refresh(usuario);
  }

  @Get('eu')
  @ApiResponse({
    status: 200,
    description: 'Retorna 200 se o sistema encontrar o usuário logado.',
  })
  usuarioAtual(@UsuarioAtual() usuario: Usuario) {
    return usuario;
  }
}
