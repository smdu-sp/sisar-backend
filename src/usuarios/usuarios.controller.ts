import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { AddFeriasDto, CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';
import { UsuarioAtual } from 'src/auth/decorators/usuario-atual.decorator';
import { Ferias, Usuario } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AddSubstitutoDTO, BuscarFuncionariosResponseDTO, BuscarNovoResponseDTO, UsuarioAutorizadoResponseDTO, UsuarioDesativadoResponseDTO, UsuarioPaginadoResponseDTO, UsuarioResponseDTO } from './dto/usuario-response.dto';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('usuarios') //localhost:3000/usuarios
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Permissoes('SUP', 'ADM')
  @Post('criar') //localhost:3000/usuarios/criar
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateUsuarioDto })
  @ApiOperation({ description: "Registrar um usuário.", summary: 'Registre um usuário.' })
  @ApiResponse({ status: 201, description: 'Retorna 201 se registrar o usuario com sucesso.', type: UsuarioResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  criar(
    @UsuarioAtual() usuario: Usuario,
    @Body() createUsuarioDto: CreateUsuarioDto,
  ): Promise<UsuarioResponseDTO> {
    return this.usuariosService.criar(createUsuarioDto, usuario);
  }

  @Permissoes('ADM', 'SUP')
  @Get('buscar-tudo') //localhost:3000/usuarios/buscar-tudo
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'pagina', type: 'string', required: true })
  @ApiQuery({ name: 'limite', type: 'string', required: true })
  @ApiQuery({ name: 'status', type: 'string', required: true })
  @ApiQuery({ name: 'busca', type: 'string', required: false })
  @ApiQuery({ name: 'permissao', type: 'string', required: false })
  @ApiOperation({ description: "Buscar todos os usuários.", summary: 'Busque os usuários.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar os usuarios com sucesso.', type: UsuarioPaginadoResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  buscarTudo(
    @UsuarioAtual() usuario: Usuario,
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('status') status?: string,
    @Query('busca') busca?: string,
    @Query('permissao') permissao?: string,
  ): Promise<UsuarioPaginadoResponseDTO> {
    return this.usuariosService.buscarTudo(usuario, +pagina, +limite, +status, busca, permissao);
  }

  @Permissoes('ADM', 'SUP')
  @Get('buscar-por-id/:id') //localhost:3000/usuarios/buscar-por-id/id
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ description: "Buscar usuário por ID.", summary: 'Busque um usuário.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar um usuário com sucesso.', type: UsuarioResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  buscarPorId(@Param('id') id: string): Promise<UsuarioResponseDTO> {
    return this.usuariosService.buscarPorId(id);
  }

  @Permissoes('ADM', 'SUP')
  @Patch('atualizar/:id') //localhost:3000/usuarios/atualizar/id
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiBody({ type: UpdateUsuarioDto })
  @ApiOperation({ description: "Atualizar usuário.", summary: 'Atualize um usuário.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar os usuarios com sucesso.', type: UsuarioResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  atualizar(
    @UsuarioAtual() usuario: Usuario,
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<UsuarioResponseDTO> {
    return this.usuariosService.atualizar(usuario, id, updateUsuarioDto);
  }

  @Permissoes('ADM', 'SUP')
  @Get('lista-completa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: "Listar todos os usuários.", summary: 'Liste os usuários.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se listar os usuarios com sucesso.', type: [UsuarioResponseDTO] })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  listaCompleta(): Promise<UsuarioResponseDTO[]> {
    return this.usuariosService.listaCompleta();
  }

  @Permissoes('ADM', 'SUP')
  @Delete('desativar/:id') //localhost:3000/usuarios/excluir/id
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: "Deletar todos os usuários.", summary: 'Delete os usuários.' })
  @ApiResponse({ status: 201, description: 'Retorna 200 se deletar o usuario com sucesso.', type: UsuarioDesativadoResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  excluir(@Param('id') id: string): Promise<UsuarioDesativadoResponseDTO> {
    return this.usuariosService.excluir(id);
  }

  @Permissoes('ADM', 'SUP')
  @Patch('autorizar/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ description: "Autorizar usuário.", summary: 'Autorize um usuário.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se autorizar o usuário com sucesso.', type: UsuarioAutorizadoResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  autorizarUsuario(@Param('id') id: string): Promise<UsuarioAutorizadoResponseDTO> {
    return this.usuariosService.autorizaUsuario(id);
  }

  @Permissoes('ADM', 'SUP')
  @Patch('adiciona-ferias/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiBody({ type: AddFeriasDto })
  @ApiOperation({ description: "Adicionar férias do usuário.", summary: 'Adicionae férias ao usuário.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se adicionar férias ao usuário com sucesso.', type: AddFeriasDto })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  adicionaFerias(
    @Param('id') id: string, 
    @Body() addFeriasDto: AddFeriasDto
  ): Promise<Ferias> {
    return this.usuariosService.adicionaFerias(id, addFeriasDto);
  }

  @Get('valida-usuario')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: "Validar usuário.", summary: 'Valide ao usuário.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se validar usuário com sucesso.', type: UsuarioResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  validaUsuario(@UsuarioAtual() usuario: Usuario): Promise<UsuarioResponseDTO> {
    return this.usuariosService.validaUsuario(usuario.id);
  }

  @Permissoes('ADM', 'SUP')
  @Get('buscar-novo')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'login', type: 'string', required: true })
  @ApiOperation({ description: "Buscar novo usuário.", summary: 'Busque um novo usuário.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar usuário com sucesso.', type: BuscarNovoResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  buscarNovo(@Query('login') login: string): Promise<BuscarNovoResponseDTO> {
    return this.usuariosService.buscarNovo(login);
  }

  @Permissoes('ADM', 'SUP')
  @Get('buscar-administrativos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: "Buscar administrativos.", summary: 'Busque administrativios.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar administrativos com sucesso.', type: [UsuarioResponseDTO] })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  buscarAdministrativos(): Promise<UsuarioResponseDTO[]> {
    return this.usuariosService.buscarAdministrativos();
  }

  @Permissoes('ADM', 'SUP', 'USR')
  @Get('buscar-funcionarios')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: "Buscar funcionários.", summary: 'Busque funcionários.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar funcionários com sucesso.', type: BuscarFuncionariosResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  buscarFuncionarios(): Promise<BuscarFuncionariosResponseDTO> {
    return this.usuariosService.buscarFuncionarios();
  }

  @Permissoes('ADM', 'SUP')
  @Post('adicionar-substituto')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ description: "Adicionar substituto.", summary: 'Adicionar substituto ao usuário.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se adicionar substituto ao usuário com sucesso.', type: AddSubstitutoDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  adicionarSubstituto(
    @Body() { usuario_id, substituto_id }: AddSubstitutoDTO
  ): Promise<AddSubstitutoDTO> {
    return this.usuariosService.adicionarSubstituto(usuario_id, substituto_id);
  }

  @Permissoes('ADM', 'SUP')
  @Delete('remover-substituto/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ description: "Deletar usuário.", summary: 'Delete ao usuário.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se deletar usuário com sucesso.', type: Boolean })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  removerSubstituto(@Param('id') id: string): Promise<boolean> {
    return this.usuariosService.removerSubstituto(id);
  }
}
