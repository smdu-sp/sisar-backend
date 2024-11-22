import {
  ForbiddenException,
  Global,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AddFeriasDto, CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { $Enums, Ferias, Usuario } from '@prisma/client';
import { AppService } from 'src/app.service';
import { SGUService } from 'src/sgu/sgu.service';
import { Client, createClient } from 'ldapjs';
import { AddSubstitutoDTO, BuscarFuncionariosResponseDTO, BuscarNovoResponseDTO, UsuarioAutorizadoResponseDTO, UsuarioPaginadoResponseDTO, UsuarioResponseDTO } from './dto/usuario-response.dto';

@Global()
@Injectable()
export class UsuariosService {
  constructor(
    private prisma: PrismaService,
    private sgu: SGUService,
    private app: AppService,
  ) {}

  async retornaPermissao(id: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    return usuario.permissao;
  }

  async listaCompleta(): Promise<UsuarioResponseDTO[]> {
    const lista = await this.prisma.usuario.findMany({
      orderBy: { nome: 'asc' },
    });
    if (!lista || lista.length == 0) throw new ForbiddenException('Nenhum usuário encontrado.');
    return lista;
  }

  validaPermissaoCriador(
    permissao: $Enums.Permissao,
    permissaoCriador: $Enums.Permissao,
  ) {
    if (
      permissao === $Enums.Permissao.DEV &&
      permissaoCriador === $Enums.Permissao.SUP
    )
      permissao = $Enums.Permissao.SUP;
    if (
      (permissao === $Enums.Permissao.DEV ||
        permissao === $Enums.Permissao.SUP) &&
      permissaoCriador === $Enums.Permissao.ADM
    )
      permissao = $Enums.Permissao.ADM;
    return permissao;
  }

  async criar(
    createUsuarioDto: CreateUsuarioDto, 
    criador?: Usuario
  ): Promise<UsuarioResponseDTO> {
    const loguser = await this.buscarPorLogin(createUsuarioDto.login);
    if (loguser) throw new ForbiddenException('Login já cadastrado.');
    const emailuser = await this.buscarPorEmail(createUsuarioDto.email);
    if (emailuser) throw new ForbiddenException('Email já cadastrado.');
    if (!criador) createUsuarioDto.permissao = 'USR';
    if (criador) {
      const permissaoCriador = await this.retornaPermissao(criador.id);
      if (permissaoCriador !== $Enums.Permissao.DEV)
        createUsuarioDto.permissao = this.validaPermissaoCriador(
          createUsuarioDto.permissao,
          permissaoCriador,
        );
    }
    const usuario = await this.prisma.usuario.create({
      data: { ...createUsuarioDto }
    });
    if (!usuario)
      throw new InternalServerErrorException(
        'Não foi possível criar o usuário, tente novamente.',
      );
    return usuario;
  }

  async buscarTudo(
    usuario: Usuario = null,
    pagina: number = 1,
    limite: number = 10,
    status: number = 1,
    busca?: string,
    permissao?: string,
    unidade_id?: string,
  ): Promise<UsuarioPaginadoResponseDTO> {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const searchParams = {
      ...(busca && { OR: [
        { nome: { contains: busca } },
        { login: { contains: busca } },
        { email: { contains: busca } },
      ]}),
      ...(unidade_id !== '' && { unidade_id }),
      ...(permissao !== '' && { permissao: $Enums.Permissao[permissao] }),
      ...(usuario.permissao !== 'DEV' ? { status: 1 } : (status !== 4 && { status })),
    };
    const total = await this.prisma.usuario.count({ where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const usuarios = await this.prisma.usuario.findMany({
      where: searchParams,
      orderBy: { nome: 'asc' },
      include: {
        unidade: true
      },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    return {
      total: +total,
      pagina: +pagina,
      limite: +limite,
      data: usuarios,
    };
  }

  async buscarPorId(id: string): Promise<UsuarioResponseDTO> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        ferias: {
          where: {
            OR: [
              { inicio: { gte: new Date() } },
              { final:  { lte: new Date() } },
            ]
          }
        },
        substitutos: {
          include: {
            substituto: true,
            usuario: true
          },
          orderBy: { criado_em: 'asc' }
        },
        usuarios: {
          include: {
            substituto: true,
            usuario: true
          },
          orderBy: { criado_em: 'asc' }
        }
      }
    });
    return usuario;
  }

  async buscarPorEmail(email: string) {
    return await this.prisma.usuario.findUnique({ where: { email } });
  }

  async buscarPorLogin(login: string): Promise<UsuarioResponseDTO> {
    return await this.prisma.usuario.findUnique({
      where: { login },
    });
  }

  async atualizar(
    usuario: Usuario,
    id: string,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<UsuarioResponseDTO> {
    const usuarioLogado = await this.buscarPorId(usuario.id);
    if (!usuarioLogado || ['TEC', 'USR'].includes(usuarioLogado.permissao) && id !== usuarioLogado.id)
      throw new ForbiddenException('Operação não autorizada para este usuário.')
    if (updateUsuarioDto.login) {
      const usuario = await this.buscarPorLogin(updateUsuarioDto.login);
      if (usuario && usuario.id !== id)
        throw new ForbiddenException('Login já cadastrado.');
    }
    if (updateUsuarioDto.permissao)
      updateUsuarioDto.permissao = this.validaPermissaoCriador(
        updateUsuarioDto.permissao,
        usuarioLogado.permissao,
      );
    const usuarioAtualizado = await this.prisma.usuario.update({
      data: updateUsuarioDto,
      where: { id },
    });
    return usuarioAtualizado;
  }

  async excluir(id: string) {
    await this.prisma.usuario.update({
      data: { status: 2 },
      where: { id },
    });
    return {
      desativado: true,
    };
  }

  async autorizaUsuario(id: string): Promise<UsuarioAutorizadoResponseDTO> {
    const autorizado = await this.prisma.usuario.update({
      where: { id },
      data: { status: 1 },
    });
    if (autorizado && autorizado.status === 1) return { autorizado: true };
    throw new ForbiddenException('Erro ao autorizar o usuário.');
  }

  async validaUsuario(id: string): Promise<UsuarioResponseDTO> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id }});
    if (!usuario) throw new ForbiddenException('Usuário não encontrado.');
    if (usuario.status !== 1) throw new ForbiddenException('Usuário inativo.');
    return usuario;
  }

  async adicionaFerias(
    id: string, 
    addFeriasDto: AddFeriasDto
  ): Promise<Ferias> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new ForbiddenException('Usuário não encontrado.');
    if (usuario.status !== 1) throw new ForbiddenException('Usuário inativo.');
    const ferias = await this.prisma.ferias.create({
      data: { ...addFeriasDto, usuario_id: id },
    });
    if (!ferias) throw new ForbiddenException('Erro ao adicionar ferias.');
    return ferias;
  }

  async buscaUnidade(login: string) {
    let unidade_id = '';
    const usuario_sgu = await this.sgu.tblUsuarios.findFirst({
      where: {
        cpRF: { startsWith: login.substring(1) },
      },
    });
    if (usuario_sgu){
      const codigo = usuario_sgu.cpUnid;
      const unidade = await this.prisma.unidade.findUnique({ where: { codigo } });
      unidade_id = unidade ? unidade.id : '';
    }
    return unidade_id;
  }

  async buscarNovo(login: string): Promise<BuscarNovoResponseDTO> {
    const usuarioExiste = await this.buscarPorLogin(login);
    if (usuarioExiste && usuarioExiste.status === 1) throw new ForbiddenException('Login já cadastrado.');
    if (usuarioExiste && usuarioExiste.status !== 1){
      const usuarioReativado = await this.prisma.usuario.update({ 
        where: { id: usuarioExiste.id }, 
        data: { status: 1 } 
      });
      return usuarioReativado;
    }
    const client: Client = createClient({
      url: process.env.LDAP_SERVER,
    });
    let unidade_id = await this.buscaUnidade(login);
    await new Promise<void>((resolve, reject) => {
      client.bind(`${process.env.USER_LDAP}${process.env.LDAP_DOMAIN}`, process.env.PASS_LDAP, (err) => {
        if (err) {
          client.destroy();
          reject(new UnauthorizedException('Credenciais incorretas 2.'));
        }
        resolve();
      });
    });
    const usuario_ldap = await new Promise<any>((resolve, reject) => {
      client.search(
        process.env.LDAP_BASE,
        {
          filter: `(&(samaccountname=${login})(company=SMUL))`,
          scope: 'sub',
          attributes: ['name', 'mail'],
        },
        (err, res) => {
          if (err) {
            client.destroy();
            resolve('erro');
          }
          res.on('searchEntry', async (entry) => {
            const nome = JSON.stringify(
              entry.pojo.attributes[0].values[0],
            ).replaceAll('"', '');
            const email = JSON.stringify(
              entry.pojo.attributes[1].values[0],
            ).replaceAll('"', '').toLowerCase();
            resolve({ nome, email });
          });
          res.on('error', (err) => {
            client.destroy();
            resolve('erro');
          });
          res.on('end', () => {
            client.destroy();
            resolve('erro');
          });
        },
      );
    });
    client.destroy();
    if (!usuario_ldap.email) throw new UnauthorizedException('Credenciais incorretas.');
    return {
      login,
      nome: usuario_ldap.nome,
      email: usuario_ldap.email,
      unidade_id,
    };
  }

  async adicionarSubstituto(
    usuario_id: string, 
    substituto_id: string
  ): Promise<AddSubstitutoDTO> {
    if (usuario_id === substituto_id) 
      throw new ForbiddenException('Substituto não pode ser o usuário.');
    const substituto = await this.prisma.substituto.findFirst({
      where: { substituto_id, usuario_id },
    });
    if (substituto) throw new ForbiddenException('Substituto ja adicionado.');
    const novo_substituto = await this.prisma.substituto.create({
      data: {
        substituto_id,
        usuario_id,
      },
    });
    return novo_substituto;
  }

  async removerSubstituto(id: string): Promise<boolean> {
    const substituto = await this.prisma.substituto.findUnique({ where: { id } });
    if (!substituto) throw new ForbiddenException('Substituto não cadastrado.');
    await this.prisma.substituto.delete({ where: { id } });
    return true;
  }

  async buscarAdministrativos(): Promise<UsuarioResponseDTO[]> {
    const administrativos = await this.prisma.usuario.findMany({
      where: { cargo: 'ADM' },
    });
    if (!administrativos) 
      throw new ForbiddenException('Nenhum administrativo encontrado.');
    return administrativos;
  }

  async buscarFuncionarios(): Promise<BuscarFuncionariosResponseDTO> {
    const administrativos = await this.prisma.usuario.findMany({
      where: { cargo: 'ADM' },
    });
    const tecnicos = await this.prisma.usuario.findMany({
      where: { cargo: 'TEC' },
    });
    return { administrativos, tecnicos };
  }
}
