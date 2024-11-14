import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateAlvaraTipoDto } from './dto/create-alvara-tipo.dto';
import { UpdateAlvaraTipoDto } from './dto/update-alvara-tipo.dto';
import { Alvara_Tipo } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { contains } from 'class-validator';
import { AlvaraTipoPaginadoDTO, AlvaraTipoResponseDTO } from './dto/alvara-tipo-responses.dto';

@Injectable()
export class AlvaraTipoService {
  constructor(
    private prisma: PrismaService,
    private app: AppService
  ) {}

  async verificaSeExiste(nome: string, id?: string): Promise<void> {
    const alvara_tipo: Alvara_Tipo = await this.prisma.alvara_Tipo.findFirst({
      where: { nome },
    });
    if (id && alvara_tipo && alvara_tipo.id != id)
      throw new ForbiddenException('Tipo de alvará já cadastrado');
    if (alvara_tipo)
      throw new ForbiddenException('Tipo de alvará já cadastrado');
  }

  async criar(createAlvaraTipoDto: CreateAlvaraTipoDto): Promise<Alvara_Tipo> {
    await this.verificaSeExiste(createAlvaraTipoDto.nome);
    const novo_alvara_tipo: Alvara_Tipo = await this.prisma.alvara_Tipo.create({
      data: { ...createAlvaraTipoDto },
    });
    if (!novo_alvara_tipo)
      throw new ForbiddenException('Erro ao criar tipo de alvará');
    return novo_alvara_tipo;
  }

  async listaCompleta(): Promise<AlvaraTipoResponseDTO[]> {
    const tipos: AlvaraTipoResponseDTO[] = await this.prisma.alvara_Tipo.findMany({ 
      where: { status: 1 }
    });
    if (!tipos) 
      throw new ForbiddenException('Não foi possível listar os tipos de alvará.');
    return tipos;
  }

  async buscarTudo(
    pagina: number = 1, 
    limite: number = 10, 
    busca?: string
  ): Promise<AlvaraTipoPaginadoDTO> {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const searchParams = {
      ...(busca ? 
        { 
          OR: [
            {nome: { contains: busca } }
          ]
        }: {}
        ),
    };
    const total: number = await this.prisma.alvara_Tipo.count({ where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [ pagina, limite ] = this.app.verificaLimite(pagina, limite, total);
    const alvara_tipos: AlvaraTipoResponseDTO[] = await this.prisma.alvara_Tipo.findMany({
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
    const alvara_tipo: Alvara_Tipo = await this.prisma.alvara_Tipo.findFirst({
      where: { id },
    });
    if (!alvara_tipo)
      throw new ForbiddenException('Tipo de alvará não encontrado');
    return alvara_tipo;
  }

  async atualizar(
    id: string, 
    updateAlvaraTipoDto: UpdateAlvaraTipoDto
  ): Promise<AlvaraTipoResponseDTO> {
    const alvara_tipo: AlvaraTipoResponseDTO = await this.prisma.alvara_Tipo.findFirst({
      where: { id },
    });
    if (!alvara_tipo)
      throw new ForbiddenException('Tipo de alvará não encontrado');
    const alvara_tipo_atualizado: AlvaraTipoResponseDTO = await this.prisma.alvara_Tipo.update({
      where: { id },
      data: { ...updateAlvaraTipoDto },
    });
    if (!alvara_tipo_atualizado)
      throw new ForbiddenException('Erro ao atualizar tipo de alvará');
    return alvara_tipo_atualizado;
  }

  async alterarStatus(
    id: string, 
    status: number
  ): Promise<AlvaraTipoResponseDTO> {
    const alvaraTipo: AlvaraTipoResponseDTO = await this.prisma.alvara_Tipo.findFirst({
      where: { id },
    });
    if (!alvaraTipo)
      throw new ForbiddenException('Tipo de alvara não encontrado');
    const alvaraTipo_alterado: AlvaraTipoResponseDTO = await this.prisma.alvara_Tipo.update({
      where: { id },
      data: { status },
    });
    if (!alvaraTipo_alterado)
      throw new ForbiddenException('Erro ao alterar status do tipo de alvara');
    return alvaraTipo_alterado;
  }
}
