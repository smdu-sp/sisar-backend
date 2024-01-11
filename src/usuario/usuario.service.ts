import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Usuario } from '@prisma/client';

@Injectable()
export class UsuarioService {
  async buscarPorLogin(login: string) {
    return await this.prisma.usuario.findUnique({ where: { login } });
  }

  async retornaPermissao(id: string) {
    return await this.prisma.usuario.findUnique({ where: { id } }).permissao;	
  }
  constructor (private prisma: PrismaService) {

  }
  create(createUsuarioDto: CreateUsuarioDto) {
    const { nome, login, cargo, permissao, status } = createUsuarioDto;
    const usuario = this.prisma.usuario.create({
      data: {
        nome,
        login,
        cargo,
        permissao,
        status
      }
    });
    if (!usuario) return new Error("Não foi possível criar o usuário, tente novamente.");
    return usuario;
  }

  findAll() {
    return `This action returns all usuario`;
  }

  findOne(id: string) {
    return `This action returns a #${id} usuario`;
  }

  async findByLogin(login: string): Promise<Usuario | undefined> {
    return this.prisma.usuario.findFirst({ where: { login } });
  }

  update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id: string) {
    return `This action removes a #${id} usuario`;
  }
}
