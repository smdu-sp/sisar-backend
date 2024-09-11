import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreateParecerAdmissibilidadeDto } from './dto/create-parecer_admissibilidade.dto';
import { UpdateParecerAdmissibilidadeDto } from './dto/update-parecer_admissibilidade.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';

@Injectable()
export class ParecerAdmissibilidadeService {
  constructor(
    private prisma: PrismaService,
    private app: AppService,
  ) {}

  async criar(createParecerAdmissibilidadeDto: CreateParecerAdmissibilidadeDto) {
    const { parecer, status } = createParecerAdmissibilidadeDto;
    const parecerAdmissibilidadeTexto = await this.prisma.parecer_Admissibilidade.findFirst({ where: { parecer }});
    if (parecerAdmissibilidadeTexto) throw new BadRequestException('Parecer ja cadastrado.');
    const parecerAdmissibilidade = await this.prisma.parecer_Admissibilidade.create({ data: { parecer, status }});
    if (!parecerAdmissibilidade) throw new InternalServerErrorException('Não foi possível criar o parecer. Tente novamente.');
    return parecerAdmissibilidade;
  }

  async buscarTudo(
    pagina: number = 1,
    limite: number = 10,
    busca?: string,
  ) {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const searchParams = {
      ...(busca && { OR: [
        { parecer: { contains: busca } },
      ]})
    };
    const total = await this.prisma.parecer_Admissibilidade.count({ where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const pareceresAdmissibilidade = await this.prisma.parecer_Admissibilidade.findMany({
      where: searchParams,
      orderBy: { parecer: 'asc' },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    return {
      total: +total,
      pagina: +pagina,
      limite: +limite,
      data: pareceresAdmissibilidade,
    };
  }

  async buscarPorId(id: string) {
    if (!id && id === "") throw new BadRequestException('Id inválido.');
    const parecerAdmissibilidade = await this.prisma.parecer_Admissibilidade.findUnique({ where: { id } });
    if (!parecerAdmissibilidade) throw new BadRequestException('Parecer não encontrado.');
    return parecerAdmissibilidade;
  }

  async atualizar(id: string, updateParecerAdmissibilidadeDto: UpdateParecerAdmissibilidadeDto) {
    if (!id && id === "") throw new BadRequestException('Id inválido.');
    const parecerAdmissibilidade = await this.prisma.parecer_Admissibilidade.findUnique({ where: { id } });
    if (!parecerAdmissibilidade) throw new BadRequestException('Parecer não encontrado.');
    const parecerAdmissibilidadeAtualizado = await this.prisma.parecer_Admissibilidade.update({ where: { id }, data: { ...updateParecerAdmissibilidadeDto } });
    if (!parecerAdmissibilidadeAtualizado) throw new InternalServerErrorException('Não foi possível atualizar o parecer. Tente novamente.');
    return parecerAdmissibilidadeAtualizado;
  }

  async desativar(id: string) {
    if (!id && id === "") throw new BadRequestException('Id inválido.');
    const parecerAdmissibilidade = await this.prisma.parecer_Admissibilidade.findUnique({ where: { id } });
    if (!parecerAdmissibilidade) throw new BadRequestException('Parecer não encontrado.');
    const parecerAdmissibilidadeDesativado = await this.prisma.parecer_Admissibilidade.update({ where: { id }, data: { status: parecerAdmissibilidade.status === 1 ? 0 : 1 } });
    if (!parecerAdmissibilidadeDesativado) throw new InternalServerErrorException('Não foi possível desativar o parecer. Tente novamente.');
    return parecerAdmissibilidadeDesativado;
  }
}
