import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateSubprefeituraDto } from './dto/create-subprefeitura.dto';
import { UpdateSubprefeituraDto } from './dto/update-subprefeitura.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { CreateResponseSubprefeituraDTO, SubprefeituraResponseDTO } from './dto/subprefeitura-response.dto';
import { Subprefeitura, Unidade } from '@prisma/client';

@Injectable()
export class SubprefeituraService {
  constructor(
    private prisma: PrismaService,
    private app: AppService
  ) {}

  async listaCompleta(): Promise<SubprefeituraResponseDTO[]> {
    const lista: Subprefeitura[] = await this.prisma.subprefeitura.findMany({
      orderBy: { nome: 'asc' }
    });
    return lista;
  }

  async buscaPorNome(nome: string): Promise<SubprefeituraResponseDTO> {
    const subprefeitura: Subprefeitura = await this.prisma.subprefeitura.findUnique({
      where: { nome }
    });
    return subprefeitura;
  }

  async criar(createsubprefeituraDto: CreateSubprefeituraDto): Promise<CreateResponseSubprefeituraDTO> {
    const { nome, sigla, status } = createsubprefeituraDto;
    if (await this.buscaPorNome(nome)) 
      throw new ForbiddenException('Ja existe uma subprefeitura com o mesmo nome');
    const novasubprefeitura: Subprefeitura = await this.prisma.subprefeitura.create({
      data: { nome, sigla, status }
    });
    if (!novasubprefeitura) 
      throw new InternalServerErrorException('Não foi possível criar a subprefeitura. Tente novamente.');
    return novasubprefeitura;
  }

  async buscarTudo(
    pagina: number = 1,
    limite: number = 10,
    busca?: string
  ): Promise<{ 
    total: number, 
    pagina: number, 
    limite: number, 
    data: Subprefeitura[] 
  }> {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const searchParams = {
      ...(busca ? 
        { OR: [
            { nome: { contains: busca } },
            { sigla: { contains: busca } },
        ] } : 
        {}),
    };
    const total: number = await this.prisma.subprefeitura.count({ where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const subprefeituras: Subprefeitura[] = await this.prisma.subprefeitura.findMany({
      where: searchParams,
      skip: (pagina - 1) * limite,
      take: limite,
    });
    return {
      total: +total,
      pagina: +pagina,
      limite: +limite,
      data: subprefeituras
    };
  }

  async buscarPorId(id: string): Promise<SubprefeituraResponseDTO> {
    const subprefeitura: SubprefeituraResponseDTO = await this.prisma.subprefeitura.findUnique({ 
      where: { id } 
    });
    if (!subprefeitura) throw new ForbiddenException('subprefeitura não encontrada.');
    return subprefeitura;
  }

  async atualizar(id: string, updatesubprefeituraDto: UpdateSubprefeituraDto): Promise<SubprefeituraResponseDTO> {
    const { nome } = updatesubprefeituraDto;
    const subprefeitura: SubprefeituraResponseDTO = await this.prisma.subprefeitura.findUnique({ 
      where: { id } 
    });
    if (!subprefeitura) throw new ForbiddenException('subprefeitura não encontrada.');
    if (nome) {
      const subprefeituraNome: SubprefeituraResponseDTO = await this.buscaPorNome(nome);
      if (subprefeituraNome && subprefeituraNome.id != id) 
        throw new ForbiddenException('Já existe uma subprefeitura com o mesmo nome.');
    }
    const updatedsubprefeitura: SubprefeituraResponseDTO = await this.prisma.subprefeitura.update({
      where: { id },
      data: updatesubprefeituraDto
    });
    if (!updatedsubprefeitura) 
      throw new InternalServerErrorException('Não foi possível atualizar a subprefeitura. Tente novamente.');
    return updatedsubprefeitura;
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
