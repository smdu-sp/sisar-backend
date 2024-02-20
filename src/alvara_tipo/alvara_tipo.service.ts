import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateAlvaraTipoDto } from './dto/create-alvara_tipo.dto';
import { UpdateAlvaraTipoDto } from './dto/update-alvara_tipo.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Alvara_Tipo } from '@prisma/client';

@Injectable()
export class AlvaraTipoService {
  constructor(private prisma: PrismaService) {}

  async verificaSeExiste(nome: string, id?: string) {
    const alvara_tipo = await this.prisma.alvara_Tipo.findFirst({
      where: { nome },
    });
    if (id)
      if (alvara_tipo && alvara_tipo.id != id)
        throw new ForbiddenException('Tipo de alvará já cadastrado');
    if (alvara_tipo)
      throw new ForbiddenException('Tipo de alvará já cadastrado');
  }

  async criar(createAlvaraTipoDto: CreateAlvaraTipoDto): Promise<Alvara_Tipo> {
    await this.verificaSeExiste(createAlvaraTipoDto.nome);
    const novo_alvara_tipo = await this.prisma.alvara_Tipo.create({
      data: { ...createAlvaraTipoDto },
    });
    if (!novo_alvara_tipo)
      throw new ForbiddenException('Erro ao criar tipo de alvará');
    return novo_alvara_tipo;
  }

  verificaPagina(pagina: number, limite: number) {
    if (!pagina) pagina = 1;
    if (!limite) limite = 10;
    if (pagina < 1) pagina = 1;
    if (limite < 1) limite = 10;
    return [pagina, limite];
  }

  verificaLimite(pagina: number, limite: number, total: number) {
    if (limite > total) limite = total;
    if ((pagina - 1) * limite >= total) pagina = Math.ceil(total / limite);
    return [pagina, limite];
  }

  async buscarTudo(pagina: number = 1, limite: number = 10, busca?: string) {
    [pagina, limite] = this.verificaPagina(pagina, limite);
    const searchParams = {
      ...(busca ? { nome: { contains: busca } } : {}),
    };
    const total = await this.prisma.alvara_Tipo.count({ where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, users: [] };
    [pagina, limite] = this.verificaLimite(pagina, limite, total);
    const alvara_tipos = await this.prisma.alvara_Tipo.findMany({
      where: searchParams,
      orderBy: { criado_em: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    if (!alvara_tipos)
      throw new ForbiddenException('Nenhum tipo de alvará encontrado');
    return {
      total: +total,
      pagina: +pagina,
      limite: +limite,
      data: alvara_tipos,
    };
  }

  async buscarPorId(id: string): Promise<Alvara_Tipo> {
    const alvara_tipo = await this.prisma.alvara_Tipo.findFirst({
      where: { id },
    });
    if (!alvara_tipo)
      throw new ForbiddenException('Tipo de alvará não encontrado');
    return alvara_tipo;
  }

  async atualizar(id: string, updateAlvaraTipoDto: UpdateAlvaraTipoDto) {
    const alvara_tipo = await this.prisma.alvara_Tipo.findFirst({
      where: { id },
    });
    if (!alvara_tipo)
      throw new ForbiddenException('Tipo de alvará não encontrado');
    await this.verificaSeExiste(updateAlvaraTipoDto.nome, id);
    const alvara_tipo_atualizado = await this.prisma.alvara_Tipo.update({
      where: { id },
      data: { ...updateAlvaraTipoDto },
    });
    if (!alvara_tipo_atualizado)
      throw new ForbiddenException('Erro ao atualizar tipo de alvará');
    return alvara_tipo_atualizado;
  }

  // remove(id: number) {
  //   return `This action removes a #${id} alvaraTipo`;
  // }
}
