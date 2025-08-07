/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateAdmissibilidadeDto } from './dto/create-admissibilidade.dto';
import { UpdateAdmissibilidadeDto } from './dto/update-admissibilidade.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { Admissibilidade, Inicial } from '@prisma/client';
import { AdmissibilidadePaginado, AdmissibilidadeResponseDTO, CreateResponseAdmissibilidadeDTO } from './dto/responses.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

interface DiasUteis {
  diasUteis: [],
  dataExpiracao: String
}

@Injectable()
export class AdmissibilidadeService {
  constructor(private prisma: PrismaService, private app: AppService) { }

  async create(
    createAdmissibilidadeDto: CreateAdmissibilidadeDto
  ): Promise<CreateResponseAdmissibilidadeDTO> {
    const { interfaces, inicial_id } = createAdmissibilidadeDto;

    try {
      // Executa todas as operações dentro de uma transação atômica
      const result = await this.prisma.$transaction(async (tx) => {
        // Primeiro, verifica se a inicial existe
        const inicial = await tx.inicial.findUnique({
          where: { id: inicial_id }
        });

        if (!inicial) {
          throw new ConflictException(`Não foi encontrada uma inicial com ID ${inicial_id}.`);
        }

        // Segundo, verifica se já existe uma admissibilidade para este inicial_id
        const admissibilidadeExistente = await tx.admissibilidade.findUnique({
          where: { inicial_id }
        });

        if (admissibilidadeExistente) {
          throw new ConflictException(`Já existe uma admissibilidade para a inicial com ID ${inicial_id}.`);
        }

        // Cria a admissibilidade
        const admissibilidade = await tx.admissibilidade.create({
          data: createAdmissibilidadeDto,
          include: { inicial: true }
        });

        // Atualiza a data de alteração da inicial
        await tx.inicial.update({
          where: { id: inicial_id },
          data: { alterado_em: new Date() }
        });

        // Se há interfaces, processa as interfaces (implementar se necessário)
        if (interfaces) {
          // TODO: Implementar lógica de interfaces se houver tabela específica
          console.log('Interfaces recebidas:', interfaces);
        }

        return admissibilidade;
      });

      if (!result) {
        throw new InternalServerErrorException('Não foi possível criar a admissibilidade. Tente novamente.');
      }

      return result;
    } catch (error) {
      // Tratamento específico para erro de constraint única do Prisma
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Já existe uma admissibilidade para a inicial com ID ${inicial_id}.`);
      }

      // Re-lança outros erros já tratados
      if (error instanceof ConflictException || error instanceof InternalServerErrorException) {
        throw error;
      }

      // Para outros erros não esperados
      console.error('Erro ao criar admissibilidade:', error);
      throw new InternalServerErrorException('Erro interno do servidor ao criar admissibilidade.');
    }
  }

  async listaCompleta(): Promise<AdmissibilidadeResponseDTO[]> {
    const admissibilidade: AdmissibilidadeResponseDTO[] = await this.prisma.admissibilidade.findMany();
    if (!admissibilidade || admissibilidade.length == 0)
      throw new InternalServerErrorException('Nenhuma subprefeitura encontrada');
    return admissibilidade;
  }

  async contarForaDoPrazo(): Promise<number> {
    const registros = await this.prisma.inicial.findMany({
      where: {
        admissibilidade: {
          data_decisao_interlocutoria: {
            not: null,
          },
        },
      },
      include: {
        admissibilidade: {
          select: {
            data_decisao_interlocutoria: true,
            unidade_id: true,
          },
        },
        alvara_tipo: {
          select: {
            prazo_admissibilidade_smul: true,
          },
        },
      },
    });
    const count: number = registros.filter((registro) => {
      const dataDecisao: Date = registro.admissibilidade?.data_decisao_interlocutoria;
      const envioAdmissibilidade: Date = registro.envio_admissibilidade;
      if (dataDecisao && envioAdmissibilidade) {
        const diffTime: number = new Date(dataDecisao).getTime() - new Date(envioAdmissibilidade).getTime();
        const diffDays: number = diffTime / (1000 * 3600 * 24);
        return diffDays > registro.alvara_tipo.prazo_admissibilidade_smul;
      }
      return false;
    }).length;
    return count;
  }

  async contarDentroDoPrazo(): Promise<number> {
    const registros = await this.prisma.inicial.findMany({
      where: {
        admissibilidade: {
          data_decisao_interlocutoria: {
            not: null,
          },
        },
      },
      include: {
        admissibilidade: {
          select: {
            data_decisao_interlocutoria: true,
            unidade_id: true,
          },
        },
        alvara_tipo: {
          select: {
            prazo_admissibilidade_smul: true,
          },
        },
      },
    });
    const count: number = registros.filter((registro) => {
      const dataDecisao: Date = registro.admissibilidade?.data_decisao_interlocutoria;
      const envioAdmissibilidade: Date = registro.envio_admissibilidade;
      if (dataDecisao && envioAdmissibilidade) {
        const diffTime: number = new Date(dataDecisao).getTime() - new Date(envioAdmissibilidade).getTime();
        const diffDays: number = diffTime / (1000 * 3600 * 24);
        return diffDays <= registro.alvara_tipo.prazo_admissibilidade_smul;
      }
      return false;
    }).length;
    return count;
  }

  async admissibilidadeFinalizada(): Promise<number> {
    const count: number = await this.prisma.admissibilidade.count({
      where: {
        data_decisao_interlocutoria: {
          not: null,
        },
      },
    });
    return count;
  }

  async buscarTudo(
    pagina: number, limite: number, filtro: number, busca?: string
  ): Promise<AdmissibilidadePaginado> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        [pagina, limite] = this.app.verificaPagina(pagina, limite);

        const searchParams = {
          ...(busca ?
            {
              OR: [
                { sei: { contains: busca } },
              ]
            } :
            {}),
        };

        const total: number = await tx.admissibilidade.count({
          where: {
            inicial: { ...searchParams }
          }
        });

        if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };

        [pagina, limite] = this.app.verificaLimite(pagina, limite, total);

        const admissibilidades: AdmissibilidadeResponseDTO[] = await tx.admissibilidade.findMany({
          include: {
            inicial: true
          },
          where: {
            status: filtro !== -1 ? filtro : undefined,
            inicial: { ...searchParams }
          },
          skip: (pagina - 1) * limite,
          take: limite,
        });

        if (admissibilidades.length === 0) {
          throw new ForbiddenException('Nenhum processo encontrado');
        }

        return {
          data: admissibilidades,
          total,
          pagina,
          limite
        };
      });

      return result;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      console.error('Erro ao buscar admissibilidades:', error);
      throw new InternalServerErrorException('Erro interno do servidor ao buscar admissibilidades.');
    }
  }

  async findAll(): Promise<AdmissibilidadeResponseDTO[]> {
    const admissibilidade: Admissibilidade[] = await this.prisma.admissibilidade.findMany();
    if (!admissibilidade || admissibilidade.length == 0)
      throw new InternalServerErrorException('Nenhuma subprefeitura encontrada');
    return admissibilidade;
  }

  async buscarPorId(id: number): Promise<Admissibilidade> {
    try {
      const admissibilidade = await this.prisma.admissibilidade.findUnique({
        where: { inicial_id: id },
        include: { inicial: true }
      });

      if (!admissibilidade) {
        throw new InternalServerErrorException('Nenhuma admissibilidade encontrada');
      }

      return admissibilidade;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      console.error('Erro ao buscar admissibilidade por ID:', error);
      throw new InternalServerErrorException('Erro interno do servidor ao buscar admissibilidade.');
    }
  }

  async ultimaAtualizacao(id: number): Promise<Inicial> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Verifica se a inicial existe antes de atualizar
        const inicialExistente = await tx.inicial.findUnique({
          where: { id }
        });

        if (!inicialExistente) {
          throw new InternalServerErrorException('Nenhum processo encontrado');
        }

        // Atualiza a data de alteração
        const inicial = await tx.inicial.update({
          where: { id },
          data: { alterado_em: new Date() }
        });

        return inicial;
      });

      return result;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      console.error('Erro ao atualizar data da inicial:', error);
      throw new InternalServerErrorException('Erro interno do servidor ao atualizar inicial.');
    }
  }

  async atualizarStatus(
    id: number,
    updateAdmissibilidadeDto: UpdateAdmissibilidadeDto
  ): Promise<Admissibilidade> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Verifica se a admissibilidade existe antes de atualizar
        const admissibilidadeExistente = await tx.admissibilidade.findUnique({
          where: { inicial_id: id }
        });

        if (!admissibilidadeExistente) {
          throw new InternalServerErrorException('Nenhuma admissibilidade encontrada');
        }

        // Atualiza a admissibilidade
        const admissibilidade = await tx.admissibilidade.update({
          where: { inicial_id: id },
          data: updateAdmissibilidadeDto
        });

        // Atualiza a data de alteração da inicial
        await tx.inicial.update({
          where: { id },
          data: { alterado_em: new Date() }
        });

        return admissibilidade;
      });

      return result;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      console.error('Erro ao atualizar admissibilidade:', error);
      throw new InternalServerErrorException('Erro interno do servidor ao atualizar admissibilidade.');
    }
  }

  async remove(id: number): Promise<string> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Verifica se a admissibilidade existe antes de deletar
        const admissibilidadeExistente = await tx.admissibilidade.findUnique({
          where: { inicial_id: id }
        });

        if (!admissibilidadeExistente) {
          throw new InternalServerErrorException(`Nenhuma admissibilidade encontrada com inicial_id ${id}`);
        }

        // Remove a admissibilidade
        await tx.admissibilidade.delete({
          where: { inicial_id: id }
        });

        // Atualiza a data de alteração da inicial
        await tx.inicial.update({
          where: { id },
          data: { alterado_em: new Date() }
        });

        return `Admissibilidade com inicial_id #${id} removida com sucesso`;
      });

      return result;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      console.error('Erro ao remover admissibilidade:', error);
      throw new InternalServerErrorException('Erro interno do servidor ao remover admissibilidade.');
    }
  }

  async verificaDiasUteis(data: string, dias: number): Promise<DiasUteis> {
    const feriado = await fetch(`${process.env.API_FERIADOS_URL}/feriados/diasUteisCorridos/${data}/${dias}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }).then((response) => response.json())
    return feriado;
  }

  dataExperacaoNaoUtil(data: string, dias: number): Date {
    const dataExperacao: Date = new Date(data);
    dataExperacao.setDate(dataExperacao.getDate() + dias);
    return dataExperacao;
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async verificaReconsideracao() {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Busca os processos reconsiderados
        const reconsiderados = await tx.admissibilidade.findMany({
          where: {
            AND: [
              { status: 3 },
              { data_decisao_interlocutoria: { not: null } }
            ]
          },
          select: {
            inicial_id: true,
            data_decisao_interlocutoria: true,
            inicial: {
              select: {
                alvara_tipo: {
                  select: {
                    reconsideracao_multi: true,
                    reconsideracao_smul: true,
                    reconsideracao_multi_tipo: true,
                    reconsideracao_smul_tipo: true
                  }
                }
              }
            }
          }
        });

        if (!reconsiderados || reconsiderados.length === 0) {
          return [];
        }

        // Processa cada reconsideração
        const atualizacoes = [];
        for (let i = 0; i < reconsiderados.length; i++) {
          let dataFinal: Date;
          // TODO: Implementar lógica para calcular dataFinal baseado nos prazos

          if (new Date() >= dataFinal) {
            // Atualiza status da admissibilidade
            const admissibilidadeAtualizada = await tx.admissibilidade.update({
              where: { inicial_id: reconsiderados[i].inicial_id },
              data: { status: 2 }
            });

            // Atualiza status da inicial
            const inicialAtualizada = await tx.inicial.update({
              where: { id: reconsiderados[i].inicial_id },
              data: {
                status: 1,
                alterado_em: new Date()
              }
            });

            atualizacoes.push({
              inicial_id: reconsiderados[i].inicial_id,
              admissibilidade: admissibilidadeAtualizada,
              inicial: inicialAtualizada
            });
          }
        }

        return {
          processados: reconsiderados,
          atualizados: atualizacoes
        };
      });

      return result;
    } catch (error) {
      console.error('Erro na verificação de reconsideração:', error);
      throw new InternalServerErrorException('Erro interno do servidor na verificação de reconsideração.');
    }
  }

  async medianaTempoAdmissibilidade(): Promise<number | null> {
    const registros = await this.prisma.inicial.findMany({
      where: {
        admissibilidade: {
          data_decisao_interlocutoria: {
            not: null,
          },
        },
        envio_admissibilidade: {
          not: null,
        },
      },
      include: {
        admissibilidade: {
          select: {
            data_decisao_interlocutoria: true,
          },
        },
      },
    });
    const diffsInDays: number[] = registros
      .map((registro) => {
        const dataDecisao: Date = registro.admissibilidade?.data_decisao_interlocutoria;
        const envioAdmissibilidade: Date = registro.envio_admissibilidade;
        if (dataDecisao && envioAdmissibilidade) {
          const diffTime: number = new Date(dataDecisao).getTime() - new Date(envioAdmissibilidade).getTime();
          return diffTime / (1000 * 3600 * 24);
        }
        return null;
      }).filter((diff) => diff !== null) as number[];
    if (diffsInDays.length === 0) return null;
    diffsInDays.sort((a, b) => a - b);
    const middle: number = Math.floor(diffsInDays.length / 2);
    if (diffsInDays.length % 2 === 0)
      return (diffsInDays[middle - 1] + diffsInDays[middle]) / 2;
    return diffsInDays[middle];
  }

  async registrosAdmissibilidadeFinalizada(): Promise<{
    dataDecisaoInterlocutoria: Date;
    sei: string;
    envioAdmissibilidade: Date;
    dias: number;
    status: string;
  }[]> {
    const registros = await this.prisma.admissibilidade.findMany({
      where: {
        data_decisao_interlocutoria: {
          not: null,
        },
      },
      include: {
        inicial: {
          select: {
            sei: true,
            envio_admissibilidade: true,
          },
        },
      },
    });
    const resultado: {
      dataDecisaoInterlocutoria: Date;
      sei: string;
      envioAdmissibilidade: Date;
      dias: number;
      status: string;
    }[] = registros.map((registro) => {
      const dataDecisaoInterlocutoria: Date = new Date(registro.data_decisao_interlocutoria);
      const envioAdmissibilidade: Date = new Date(registro.inicial.envio_admissibilidade);
      const diffTime: number = dataDecisaoInterlocutoria.getTime() - envioAdmissibilidade.getTime();
      const dias: number = Math.floor(diffTime / (1000 * 3600 * 24));
      const status: string = dias > 15 ? "Fora do Prazo" : "Dentro do Prazo";
      return {
        dataDecisaoInterlocutoria,
        sei: registro.inicial.sei,
        envioAdmissibilidade,
        dias,
        status,
      };
    });
    return resultado;
  }

  /**
   * Verifica se uma inicial existe no banco de dados
   */
  private async verificarInicialExiste(inicial_id: number): Promise<boolean> {
    try {
      const inicial = await this.prisma.inicial.findUnique({
        where: { id: inicial_id }
      });
      return !!inicial;
    } catch (error) {
      console.error('Erro ao verificar se inicial existe:', error);
      return false;
    }
  }

  /**
   * Verifica se já existe uma admissibilidade para uma inicial específica
   */
  async verificarAdmissibilidadeExistente(inicial_id: number): Promise<boolean> {
    try {
      const admissibilidade = await this.prisma.admissibilidade.findUnique({
        where: { inicial_id }
      });
      return !!admissibilidade;
    } catch (error) {
      console.error('Erro ao verificar se admissibilidade existe:', error);
      return false;
    }
  }

  /**
   * Cria uma nova admissibilidade com validações e operações atômicas
   */
  async criarComValidacao(
    createAdmissibilidadeDto: CreateAdmissibilidadeDto
  ): Promise<CreateResponseAdmissibilidadeDTO> {
    const { inicial_id, interfaces } = createAdmissibilidadeDto;

    return await this.prisma.$transaction(async (tx) => {
      // 1. Verifica se a inicial existe
      const inicial = await tx.inicial.findUnique({
        where: { id: inicial_id },
        include: {
          alvara_tipo: true
        }
      });

      if (!inicial) {
        throw new ConflictException(`Inicial com ID ${inicial_id} não encontrada.`);
      }

      // 2. Verifica se já existe admissibilidade
      const admissibilidadeExistente = await tx.admissibilidade.findUnique({
        where: { inicial_id }
      });

      if (admissibilidadeExistente) {
        throw new ConflictException(`Já existe uma admissibilidade para a inicial ${inicial_id}.`);
      }

      // 3. Verifica se todas as chaves estrangeiras existem
      if (createAdmissibilidadeDto.unidade_id) {
        const unidade = await tx.unidade.findUnique({
          where: { id: createAdmissibilidadeDto.unidade_id }
        });
        if (!unidade) {
          throw new ConflictException(`Unidade com ID ${createAdmissibilidadeDto.unidade_id} não encontrada.`);
        }
      }

      if (createAdmissibilidadeDto.subprefeitura_id) {
        const subprefeitura = await tx.subprefeitura.findUnique({
          where: { id: createAdmissibilidadeDto.subprefeitura_id }
        });
        if (!subprefeitura) {
          throw new ConflictException(`Subprefeitura com ID ${createAdmissibilidadeDto.subprefeitura_id} não encontrada.`);
        }
      }

      if (createAdmissibilidadeDto.categoria_id) {
        const categoria = await tx.categoria.findUnique({
          where: { id: createAdmissibilidadeDto.categoria_id }
        });
        if (!categoria) {
          throw new ConflictException(`Categoria com ID ${createAdmissibilidadeDto.categoria_id} não encontrada.`);
        }
      }

      // 4. Cria a admissibilidade
      const admissibilidade = await tx.admissibilidade.create({
        data: {
          ...createAdmissibilidadeDto,
          status: createAdmissibilidadeDto.status ?? 1
        },
        include: {
          inicial: true,
          unidade: true,
          subprefeitura: true,
          categoria: true,
          parecer_admissibilidade: true
        }
      });

      // 5. Atualiza a inicial
      await tx.inicial.update({
        where: { id: inicial_id },
        data: {
          alterado_em: new Date(),
          status: 2 // Status "em análise de admissibilidade"
        }
      });

      // 6. Se há interfaces, processa (implementar conforme necessário)
      if (interfaces) {
        // TODO: Implementar criação de registros de interface se houver tabela específica
        console.log('Processando interfaces:', interfaces);
      }

      return admissibilidade;
    });
  }

  /**
   * Atualiza múltiplas admissibilidades em uma única transação
   */
  async atualizarLote(
    atualizacoes: Array<{ inicial_id: number; dados: UpdateAdmissibilidadeDto }>
  ): Promise<{ sucesso: number; erros: Array<{ inicial_id: number; erro: string }> }> {
    try {
      const resultado = await this.prisma.$transaction(async (tx) => {
        const sucessos: number[] = [];
        const erros: Array<{ inicial_id: number; erro: string }> = [];

        for (const { inicial_id, dados } of atualizacoes) {
          try {
            // Verifica se existe
            const existe = await tx.admissibilidade.findUnique({
              where: { inicial_id }
            });

            if (!existe) {
              erros.push({
                inicial_id,
                erro: 'Admissibilidade não encontrada'
              });
              continue;
            }

            // Atualiza
            await tx.admissibilidade.update({
              where: { inicial_id },
              data: dados
            });

            // Atualiza inicial
            await tx.inicial.update({
              where: { id: inicial_id },
              data: { alterado_em: new Date() }
            });

            sucessos.push(inicial_id);
          } catch (error) {
            erros.push({
              inicial_id,
              erro: error.message || 'Erro desconhecido'
            });
          }
        }

        return {
          sucesso: sucessos.length,
          erros
        };
      });

      return resultado;
    } catch (error) {
      console.error('Erro na atualização em lote:', error);
      throw new InternalServerErrorException('Erro interno do servidor na atualização em lote.');
    }
  }

  /**
   * Remove múltiplas admissibilidades em uma única transação
   */
  async removerLote(iniciais_ids: number[]): Promise<{ sucesso: number; erros: Array<{ inicial_id: number; erro: string }> }> {
    try {
      const resultado = await this.prisma.$transaction(async (tx) => {
        const sucessos: number[] = [];
        const erros: Array<{ inicial_id: number; erro: string }> = [];

        for (const inicial_id of iniciais_ids) {
          try {
            // Verifica se existe
            const existe = await tx.admissibilidade.findUnique({
              where: { inicial_id }
            });

            if (!existe) {
              erros.push({
                inicial_id,
                erro: 'Admissibilidade não encontrada'
              });
              continue;
            }

            // Remove
            await tx.admissibilidade.delete({
              where: { inicial_id }
            });

            // Atualiza inicial
            await tx.inicial.update({
              where: { id: inicial_id },
              data: { alterado_em: new Date() }
            });

            sucessos.push(inicial_id);
          } catch (error) {
            erros.push({
              inicial_id,
              erro: error.message || 'Erro desconhecido'
            });
          }
        }

        return {
          sucesso: sucessos.length,
          erros
        };
      });

      return resultado;
    } catch (error) {
      console.error('Erro na remoção em lote:', error);
      throw new InternalServerErrorException('Erro interno do servidor na remoção em lote.');
    }
  }
}
