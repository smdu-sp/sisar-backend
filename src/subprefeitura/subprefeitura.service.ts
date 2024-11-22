import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateSubprefeituraDto } from './dto/create-subprefeitura.dto';
import { UpdateSubprefeituraDto } from './dto/update-subprefeitura.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { CreateResponseSubprefeituraDTO } from './dto/subprefeitura-response.dto';

@Injectable()
export class SubprefeituraService {
  constructor(
    private prisma: PrismaService,
    private app: AppService
  ) {}

  async listaCompleta() {
    const lista = await this.prisma.subprefeitura.findMany({
      orderBy: { nome: 'asc' }
    });
    return lista;
  }

  async buscaPorNome(nome: string) {
    const subprefeitura = await this.prisma.subprefeitura.findUnique({
      where: { nome }
    });
    return subprefeitura;
  }

  async criar(createsubprefeituraDto: CreateSubprefeituraDto): Promise<CreateResponseSubprefeituraDTO> {
    const { nome, sigla, status } = createsubprefeituraDto;
    if (await this.buscaPorNome(nome)) 
      throw new ForbiddenException('Ja existe uma subprefeitura com o mesmo nome');
    const novasubprefeitura = await this.prisma.subprefeitura.create({
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
  ) {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const searchParams = {
      ...(busca ? 
        { OR: [
            { nome: { contains: busca } },
            { sigla: { contains: busca } },
        ] } : 
        {}),
    };
    const total = await this.prisma.subprefeitura.count({ where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, users: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const subprefeituras = await this.prisma.subprefeitura.findMany({
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

  async buscarPorId(id: string) {
    const subprefeitura = await this.prisma.subprefeitura.findUnique({ where: { id } });
    if (!subprefeitura) throw new ForbiddenException('subprefeitura não encontrada.');
    return subprefeitura;
  }

  async atualizar(id: string, updatesubprefeituraDto: UpdateSubprefeituraDto) {
    const { nome } = updatesubprefeituraDto;
    const subprefeitura = await this.prisma.subprefeitura.findUnique({ where: { id } });
    if (!subprefeitura) throw new ForbiddenException('subprefeitura não encontrada.');
    if (nome) {
      const subprefeituraNome = await this.buscaPorNome(nome);
      if (subprefeituraNome && subprefeituraNome.id != id) 
        throw new ForbiddenException('Já existe uma subprefeitura com o mesmo nome.');
    }
    const updatedsubprefeitura = await this.prisma.subprefeitura.update({
      where: { id },
      data: updatesubprefeituraDto
    });
    if (!updatedsubprefeitura) 
      throw new InternalServerErrorException('Não foi possível atualizar a subprefeitura. Tente novamente.');
    return updatedsubprefeitura;
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
