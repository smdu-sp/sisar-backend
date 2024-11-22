import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUnidadeDto } from './dto/create-unidade.dto';
import { UpdateUnidadeDto } from './dto/update-unidade.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { UnidadeResponseDTO } from './dto/unidade-response.dto';

@Injectable()
export class UnidadesService {
  constructor(
    private prisma: PrismaService,
    private app: AppService
  ) {}

  async listaCompleta() {
    return await this.prisma.unidade.findMany({
      orderBy: { nome: 'asc' }
    });
  }

  async buscaPorCodigo(codigo: string) {
    return await this.prisma.unidade.findUnique({
      where: { codigo }
    });
  }

  async buscaPorSigla(sigla: string) {
    return await this.prisma.unidade.findUnique({
      where: { sigla }
    });
  }

  async buscaPorNome(nome: string) {
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
    const novaUnidade = await this.prisma.unidade.create({
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
  ) {
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
    const total = await this.prisma.unidade.count({ where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, users: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const unidades = await this.prisma.unidade.findMany({
      where: {
        AND: [
          searchParams,
          { status: !filtro ? undefined : filtro },
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

  async buscarPorId(id: string) {
    return await this.prisma.unidade.findUnique({ where: { id } });
  }

  async atualizar(id: string, updateUnidadeDto: UpdateUnidadeDto) {
    const { nome, sigla, codigo } = updateUnidadeDto;
    const unidade = await this.prisma.unidade.findUnique({ where: { id } });
    if (!unidade) throw new ForbiddenException('Unidade não encontrada.');
    if (nome) {
      const unidadeNome = await this.buscaPorNome(nome);
      if (unidadeNome && unidadeNome.id != id) 
        throw new ForbiddenException(`Já existe uma unidade com o mesmo nome (${nome}).`);
    }
    if (sigla) {
      const unidadeSigla = await this.buscaPorSigla(sigla);
      if (unidadeSigla && unidadeSigla.id != id) 
        throw new ForbiddenException(`Já existe uma unidade com a mesma sigla (${sigla}).`);
    }
    if (codigo) {
      const unidadeCodigo = await this.buscaPorCodigo(codigo);
      if (unidadeCodigo && unidadeCodigo.id != id) 
        throw new ForbiddenException(`Já existe uma unidade com o mesmo código (${codigo}).`);
    }
    const updatedUnidade = await this.prisma.unidade.update({
      where: { id },
      data: updateUnidadeDto
    });
    if (!updatedUnidade) 
      throw new InternalServerErrorException('Não foi possível atualizar a unidade. Tente novamente.');
    return updatedUnidade;
  }

  async desativar(id: string) {
    const unidade = await this.prisma.unidade.findUnique({ where: { id } });
    if (!unidade) throw new ForbiddenException('Unidade não encontrada.');
    const updatedUnidade = await this.prisma.unidade.update({
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
