import { Controller, Get, Post, Body, Patch, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { FinalizacaoService } from './finalizacao.service';
import { CreateFinalizacaoDto } from './dto/create-finalizacao.dto';
import { UpdateFinalizacaoDto } from './dto/update-finalizacao.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FinalizacaoResponseDTO } from './dto/finalizacao-response.dto';

@Controller('finalizacao')
@ApiTags('Finalização')
@ApiBearerAuth()
export class FinalizacaoController {
  constructor(private readonly finalizacaoService: FinalizacaoService) {}

  @Post('criar')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ description: 'Corpo da requisição para criação de finalização.', type: CreateFinalizacaoDto })
  @ApiResponse({ status: 201, description: 'Retorna 201 se criar a finalização com sucesso.', type: FinalizacaoResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Criar uma finalização.", summary: 'Crie finalizações.' })
  create(
    @Body() createFinalizacaoDto: CreateFinalizacaoDto,
    @Query('conclusao') conclusao: string
  ) {
    console.log(conclusao);
    const conclusaoBoolean = conclusao === 'true' ? true : false;
    return this.finalizacaoService.criar(createFinalizacaoDto, conclusaoBoolean);
  }

  @Get('buscar-tudo')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar as finalizações com sucesso.', type: [FinalizacaoResponseDTO] })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar todas as finalizações.", summary: 'Busque finalizações.' })
  findAll(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('busca') busca?: string
  ) {
    return this.finalizacaoService.buscarTudo(+pagina, +limite, busca);
  }

  @Get('buscar/:id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar a finalização com sucesso.', type: FinalizacaoResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar uma finalização.", summary: 'Busque uma finalização.' })
  findOne(@Param('id') id: string) {
    return this.finalizacaoService.buscaId(+id);
  }

  @Patch('atualizar/:id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se atualizar a finalização com sucesso.', type: FinalizacaoResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Atualizar finalização.", summary: 'Atualize finalizações.' })
  update(@Param('id') id: string, @Body() updateFinalizacaoDto: UpdateFinalizacaoDto) {
    return this.finalizacaoService.atualizar(+id, updateFinalizacaoDto);
  }
}
