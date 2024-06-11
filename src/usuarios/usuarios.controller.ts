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
import { UsuariosService } from './usuarios.service';
import { AddFeriasDto, CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';
import { UsuarioAtual } from 'src/auth/decorators/usuario-atual.decorator';
import { Usuario } from '@prisma/client';

@Controller('usuarios') //localhost:3000/usuarios
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Permissoes('SUP', 'ADM')
  @Post('criar') //localhost:3000/usuarios/criar
  criar(
    @UsuarioAtual() usuario: Usuario,
    @Body() createUsuarioDto: CreateUsuarioDto,
  ) {
    return this.usuariosService.criar(createUsuarioDto, usuario);
  }

  @Permissoes('ADM', 'SUP')
  @Get('buscar-tudo') //localhost:3000/usuarios/buscar-tudo
  buscarTudo(
    @UsuarioAtual() usuario: Usuario,
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('status') status?: string,
    @Query('busca') busca?: string,
    @Query('permissao') permissao?: string,
  ) {
    return this.usuariosService.buscarTudo(usuario, +pagina, +limite, +status, busca, permissao);
  }

  @Permissoes('ADM', 'SUP')
  @Get('buscar-por-id/:id') //localhost:3000/usuarios/buscar-por-id/id
  buscarPorId(@Param('id') id: string) {
    return this.usuariosService.buscarPorId(id);
  }

  @Permissoes('ADM', 'SUP')
  @Patch('atualizar/:id') //localhost:3000/usuarios/atualizar/id
  atualizar(
    @UsuarioAtual() usuario: Usuario,
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.atualizar(usuario, id, updateUsuarioDto);
  }

  @Permissoes('ADM', 'SUP')
  @Get('lista-completa')
  listaCompleta() {
    return this.usuariosService.listaCompleta();
  }

  @Permissoes('ADM', 'SUP')
  @Delete('desativar/:id') //localhost:3000/usuarios/excluir/id
  excluir(@Param('id') id: string) {
    return this.usuariosService.excluir(id);
  }

  @Permissoes('ADM', 'SUP')
  @Patch('autorizar/:id')
  autorizarUsuario(@Param('id') id: string) {
    return this.usuariosService.autorizaUsuario(id);
  }

  @Permissoes('ADM', 'SUP')
  @Patch('adiciona-ferias/:id')
  adicionaFerias(@Param('id') id: string, @Body() addFeriasDto: AddFeriasDto) {
    return this.usuariosService.adicionaFerias(id, addFeriasDto);
  }

  @Get('valida-usuario')
  validaUsuario(@UsuarioAtual() usuario: Usuario) {
    return this.usuariosService.validaUsuario(usuario.id);
  }

  @Permissoes('ADM', 'SUP')
  @Get('buscar-novo')
  buscarNovo(@Query('login') login: string) {
    return this.usuariosService.buscarNovo(login);
  }

  @Permissoes('ADM', 'SUP')
  @Get('buscar-administrativos')
  buscarAdministrativos() {
    return this.usuariosService.buscarAdministrativos();
  }

  @Permissoes('ADM', 'SUP', 'USR')
  @Get('buscar-funcionarios')
  buscarFuncionarios() {
    return this.usuariosService.buscarFuncionarios();
  }

  @Permissoes('ADM', 'SUP')
  @Post('adicionar-substituto')
  adicionarSubstituto(@Body() { usuario_id, substituto_id }: { usuario_id: string; substituto_id: string }) {
    return this.usuariosService.adicionarSubstituto(usuario_id, substituto_id);
  }

  @Permissoes('ADM', 'SUP')
  @Delete('remover-substituto/:id')
  removerSubstituto(@Param('id') id: string) {
    return this.usuariosService.removerSubstituto(id);
  }
}
