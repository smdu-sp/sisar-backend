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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsuarioToken } from './models/UsuarioToken';
import { LoginDto } from './models/login.dto';
import { EuResponseDTO } from './models/eu-response.dto';

@ApiBearerAuth()
@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login') //localhost:3000/login
  @HttpCode(HttpStatus.OK)
  @ApiBody({ description: 'Senha e login para autenticação por JWT.', type: LoginDto })
  @ApiResponse({ status: 200, description: 'Retorna 200 se tiver sucesso no login.', type: UsuarioToken })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Logue na aplicação.", summary: 'Faça o login na aplicação.' })
  @UseGuards(LocalAuthGuard)
  @IsPublic()
  login(@Request() req: AuthRequest): Promise<UsuarioToken> {
    return this.authService.login(req.user);
  }

  @Post('refresh') //localhost:3000/refresh
  @ApiResponse({ status: 200, description: 'Retorna 200 se o token for atualizado.', type: UsuarioToken })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Faça o refresh de seu token.", summary: 'Faça refresh do token.' })
  @IsPublic()
  @UseGuards(RefreshAuthGuard)
  refresh(@UsuarioAtual() usuario: Usuario): Promise<UsuarioToken> {
    return this.authService.refresh(usuario);
  }

  @Get('eu')
  @ApiResponse({ status: 200, description: 'Retorna 200 se o sistema encontrar o usuário logado.', type: EuResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Busque o usuário logado.", summary: 'Busque o usuário logado' })
  usuarioAtual(@UsuarioAtual() usuario: Usuario) {
    return usuario;
  }
}
