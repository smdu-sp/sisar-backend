import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUnidadeDto } from './dto/create-unidade.dto';
import { UpdateUnidadeDto } from './dto/update-unidade.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { UnidadeResponseDTO } from './dto/unidade-response.dto';
import { Unidade } from '@prisma/client';

@Injectable()
export class UnidadesService {
  constructor(
    private prisma: PrismaService,
    private app: AppService
  ) {}

  async listaCompleta(): Promise<UnidadeResponseDTO[]> {
    return await this.prisma.unidade.findMany({
      orderBy: { nome: 'asc' }
    });
  }

  async buscaPorCodigo(codigo: string): Promise<UnidadeResponseDTO> {
    return await this.prisma.unidade.findUnique({
      where: { codigo }
    });
  }

  async buscaPorSigla(sigla: string): Promise<UnidadeResponseDTO> {
    return await this.prisma.unidade.findUnique({
      where: { sigla }
    });
  }

  async buscaPorNome(nome: string): Promise<UnidadeResponseDTO> {
    return await this.prisma.unidade.findUnique({
      where: { nome }
    });
  }

  async criar(createUnidadeDto: CreateUnidadeDto): Promise<UnidadeResponseDTO> {
    const { nome, sigla, codigo, status } = createUnidadeDto;
    if (await this.buscaPorCodigo(codigo)) 
      throw new ForbiddenException(`Ja existe uma unidade com o mesmo código (${codigo})`);
    if (await this.buscaPorNome(nome)) 
      throw new ForbiddenException(`Ja existe uma unidade com o mesmo nome (${nome})`);
    if (await this.buscaPorSigla(sigla)) 
      throw new ForbiddenException(`Ja existe uma unidade com a mesmo sigla (${sigla})`);
    const novaUnidade: Unidade = await this.prisma.unidade.create({
      data: { nome, sigla, status, codigo }
    });
    if (!novaUnidade) 
      throw new InternalServerErrorException('Não foi possível criar a unidade. Tente novamente.');
    return novaUnidade;
  }

  async buscarTudo(
    pagina: number = 1,
    limite: number = 10,
    busca?: string,
    filtro?: number
  ): Promise<{ total: number, pagina: number, limite: number, data: Unidade[] }> {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const searchParams = {
      ...(busca ?
        {
          OR: [
            { nome: { contains: busca } },
            { sigla: { contains: busca } },
            { codigo: { contains: busca } }
          ]
        } :
        {}),
    };
    const total: number = await this.prisma.unidade.count({ where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const unidades: Unidade[] = await this.prisma.unidade.findMany({
      where: {
        AND: [
          searchParams,
          { status: filtro < 0 || !filtro && filtro !== 0 ? undefined : filtro },
        ]
      },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    return {
      total: +total,
      pagina: +pagina,
      limite: +limite,
      data: unidades
    };
  }

  async buscarPorId(id: string): Promise<UnidadeResponseDTO> {
    return await this.prisma.unidade.findUnique({ where: { id } });
  }

  async atualizar(id: string, updateUnidadeDto: UpdateUnidadeDto): Promise<UnidadeResponseDTO> {
    const { nome, sigla, codigo } = updateUnidadeDto;
    const unidade: Unidade = await this.prisma.unidade.findUnique({ where: { id } });
    if (!unidade) throw new ForbiddenException('Unidade não encontrada.');
    if (nome) {
      const unidadeNome: Unidade = await this.buscaPorNome(nome);
      if (unidadeNome && unidadeNome.id != id) 
        throw new ForbiddenException(`Já existe uma unidade com o mesmo nome (${nome}).`);
    }
    if (sigla) {
      const unidadeSigla: Unidade = await this.buscaPorSigla(sigla);
      if (unidadeSigla && unidadeSigla.id != id) 
        throw new ForbiddenException(`Já existe uma unidade com a mesma sigla (${sigla}).`);
    }
    if (codigo) {
      const unidadeCodigo: Unidade = await this.buscaPorCodigo(codigo);
      if (unidadeCodigo && unidadeCodigo.id != id) 
        throw new ForbiddenException(`Já existe uma unidade com o mesmo código (${codigo}).`);
    }
    const updatedUnidade: Unidade = await this.prisma.unidade.update({
      where: { id },
      data: updateUnidadeDto
    });
    if (!updatedUnidade) 
      throw new InternalServerErrorException('Não foi possível atualizar a unidade. Tente novamente.');
    return updatedUnidade;
  }

  async desativar(id: string): Promise<{ message: string }> {
    const unidade: Unidade = await this.prisma.unidade.findUnique({ where: { id } });
    if (!unidade) throw new ForbiddenException('Unidade não encontrada.');
    const updatedUnidade: Unidade = await this.prisma.unidade.update({
      where: { id },
      data: { status: 0 }
    });
    if (!updatedUnidade) 
      throw new InternalServerErrorException('Não foi possível desativar a unidade. Tente novamente.');
    return {
      message: 'Unidade desativada com sucesso.'
    }
  }
}
