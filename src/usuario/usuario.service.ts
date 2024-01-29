import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { $Enums, Permissao, Usuario } from '@prisma/client';

@Injectable()
export class UsuarioService {
  constructor (private prisma: PrismaService) {}

  async retornaPermissao(id: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    return usuario.permissao;
  }

  validaPermissaoCriador(permissao: $Enums.Permissao, permissaoCriador: $Enums.Permissao) {
    console.log({permissao, permissaoCriador});
    if (permissao === $Enums.Permissao.DEV && permissaoCriador === $Enums.Permissao.SUP) permissao = $Enums.Permissao.SUP;
    if ((permissao === $Enums.Permissao.DEV || permissao === $Enums.Permissao.SUP) && permissaoCriador === $Enums.Permissao.ADM) permissao = $Enums.Permissao.ADM;
    return permissao;
  }

  async autorizaUsuario(id: string) {
    const autorizado = await this.prisma.usuario.update({ where: { id }, data: { status: 1 } });
    if (autorizado && autorizado.status === 1) return { autorizado: true };
    throw new ForbiddenException("Erro ao autorizar o usuário.");
  }

  async criar(createUsuarioDto: CreateUsuarioDto, criador?: Usuario) {
    var { nome, login, cargo, permissao, status, email } = createUsuarioDto;
    const loguser = await this.buscarPorLogin(login);
    if (loguser) throw new ForbiddenException("Login já cadastrado.");
    const emailuser = await this.buscarPorLogin(login);
    if (emailuser) throw new ForbiddenException("Email já cadastrado.");
    if (!criador){
      permissao = 'USR';
      cargo = 'ADM';
    }
    if (criador){
      const permissaoCriador = await this.retornaPermissao(criador.id);
      if (permissaoCriador !== $Enums.Permissao.DEV)
        permissao = this.validaPermissaoCriador(permissao, permissaoCriador);
    }
    const usuario = await this.prisma.usuario.create({
      data: {
        nome,
        login,
        email,
        cargo,
        permissao,
        status
      }
    });
    if (!usuario) throw new InternalServerErrorException("Não foi possível criar o usuário, tente novamente.");
    return usuario;
  }

  verificaPagina(pagina: number, limite: number) {
    if (!pagina) pagina = 1;
    if (!limite) limite = 10;
    if (pagina < 1) pagina = 1;
    if (limite < 1) limite = 10;
    return [ pagina, limite ];
  }

  verificaLimite(pagina: number, limite: number, total: number) {
    if (limite > total) limite = total;
    if ((pagina - 1) * limite >= total) pagina = Math.ceil(total / limite);
    return [ pagina, limite ];
  }

  async buscarTudo(
    pagina: number = 1,
    limite: number = 10,
    status: number = 1,
    busca?: string
  ) {
    console.log(pagina);
    [ pagina, limite ] = this.verificaPagina(pagina, limite);
    const searchParams = {
      ...(busca ? {nome: { contains: busca }} : {}),
      ...(status == 4 ? {} : { status }),
    };
    const total = await this.prisma.usuario.count({ where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, users: [] };
    [ pagina, limite ] = this.verificaLimite(pagina, limite, total);
    const usuarios = await this.prisma.usuario.findMany({
      where: searchParams,
      orderBy: { criado_em: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite
    });
    return {
      total: +total,
      pagina: +pagina,
      limite: +limite,
      data: usuarios
    }
  }

  async buscarPorId(id: string) {
    return await this.prisma.usuario.findUnique({ where: { id } });
  }

  async buscarPorEmail(email: string) {
    return await this.prisma.usuario.findUnique({ where: { email } });
  }

  async buscarPorLogin(login: string): Promise<Usuario | undefined> {
    return this.prisma.usuario.findFirst({ where: { login } });
  }

  async atualizar(id: string, updateUsuarioDto: UpdateUsuarioDto, criador: Usuario) {
    const loguser = await this.buscarPorLogin(updateUsuarioDto.login);
    if (loguser && loguser.id != id) throw new ForbiddenException("Login já cadastrado.");
    if (updateUsuarioDto.permissao){
      const permissaoCriador = await this.retornaPermissao(criador.id);
      if (permissaoCriador !== $Enums.Permissao.DEV)
        updateUsuarioDto.permissao = this.validaPermissaoCriador(updateUsuarioDto.permissao, permissaoCriador);
    }
    const usuarioAtualizado = await this.prisma.usuario.update({
      where: { id },
      data: updateUsuarioDto
    });
    if (!usuarioAtualizado) throw new InternalServerErrorException("Não foi possível atualizar o usuário, tente novamente.");
    return usuarioAtualizado;
  }

  async desativar(id: string) {
    await this.prisma.usuario.update({ where: { id }, data: { status: 2 } });
    return {
      mensagem: "Usuário desativado com sucesso.",
    }
  }
}
