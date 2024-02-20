import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioAtual } from 'src/auth/decorators/usuario-atual.decorator';
import { Usuario } from '@prisma/client';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Permissoes('SUP', 'ADM')
  @Post('criar')
  criar(
    @Body() createUsuarioDto: CreateUsuarioDto,
    @UsuarioAtual() usuario: Usuario,
  ) {
    return this.usuarioService.criar(createUsuarioDto, usuario);
  }

  @Permissoes('SUP', 'ADM')
  @Get('buscar-tudo')
  buscarTudo(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('status') status?: string,
    @Query('busca') busca?: string,
  ) {
    return this.usuarioService.buscarTudo(+pagina, +limite, +status, busca);
  }

  @Permissoes('SUP', 'ADM')
  @Get('buscar-por-id/:id')
  buscarPorId(@Param('id') id: string) {
    return this.usuarioService.buscarPorId(id);
  }

  @Permissoes('SUP', 'ADM')
  @Patch('atualizar/:id')
  atualizar(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @UsuarioAtual() usuario: Usuario,
  ) {
    return this.usuarioService.atualizar(id, updateUsuarioDto, usuario);
  }

  @Permissoes('SUP')
  @Delete('desativar/:id')
  desativar(@Param('id') id: string) {
    return this.usuarioService.desativar(id);
  }

  @Permissoes('SUP', 'ADM')
  @Patch('autorizar/:id')
  autorizarUsuario(@Param('id') id: string) {
    return this.usuarioService.autorizaUsuario(id);
  }

  @Get('valida-usuario')
  validaUsuario(@UsuarioAtual() usuario: Usuario) {
    return this.usuarioService.validaUsuario(usuario.id);
  }
}
