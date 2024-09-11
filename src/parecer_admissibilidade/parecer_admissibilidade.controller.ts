import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ParecerAdmissibilidadeService } from './parecer_admissibilidade.service';
import { CreateParecerAdmissibilidadeDto } from './dto/create-parecer_admissibilidade.dto';
import { UpdateParecerAdmissibilidadeDto } from './dto/update-parecer_admissibilidade.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParecerAdmissibilidadePaginadoDTO, ParecerAdmissibilidadeResponseDTO } from './dto/parecer_admissibilidade-resopnse.dto';

@ApiTags('Parecer-Admissibilidade')
@Controller('parecer-admissibilidade')
export class ParecerAdmissibilidadeController {
  constructor(private readonly parecerAdmissibilidadeService: ParecerAdmissibilidadeService) {}

  @Post('criar')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateParecerAdmissibilidadeDto })
  @ApiResponse({ status: 201, description: 'Retorna 201 se registrar um parecer-admissibilidade com sucesso.', type: ParecerAdmissibilidadeResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Registrar um parecer-admissibilidade.", summary: 'Registre um parecer-admissibilidade.' })
  create(
    @Body() createParecerAdmissibilidadeDto: CreateParecerAdmissibilidadeDto
  ): Promise<ParecerAdmissibilidadeResponseDTO> {
    return this.parecerAdmissibilidadeService.criar(createParecerAdmissibilidadeDto);
  }

  @Get('buscar-tudo')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'pagina', required: true })
  @ApiQuery({ name: 'limite', required: true })
  @ApiQuery({ name: 'busca', required: false })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar parecer-admissibilidade com sucesso.', type: ParecerAdmissibilidadePaginadoDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar todos os parecer-admissibilidade.", summary: 'Busque parecer-admissibilidade.' })
  buscarTudo(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('busca') busca?: string,
  ): Promise<ParecerAdmissibilidadePaginadoDTO> {
    return this.parecerAdmissibilidadeService.buscarTudo(+pagina, +limite, busca);
  }

  @Get('buscar-por-id/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar um parecer-admissibilidade por ID com sucesso.', type: ParecerAdmissibilidadeResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar um parecer-admissibilidade.", summary: 'Busque um parecer-admissibilidade.' })
  buscarPorId(@Param('id') id: string): Promise<ParecerAdmissibilidadeResponseDTO> {
    return this.parecerAdmissibilidadeService.buscarPorId(id);
  }

  @Patch('atualizar/:id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se atualizar parecer-admissibilidade com sucesso.', type: ParecerAdmissibilidadePaginadoDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Atualizar um parecer-admissibilidade.", summary: 'Atualize parecer-admissibilidade.' })
  atualizar(
    @Param('id') id: string, 
    @Body() updateParecerAdmissibilidadeDto: UpdateParecerAdmissibilidadeDto
  ): Promise<ParecerAdmissibilidadeResponseDTO> {
    return this.parecerAdmissibilidadeService.atualizar(id, updateParecerAdmissibilidadeDto);
  }

  @Delete('desativar/:id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se deletar parecer-admissibilidade com sucesso.', type: ParecerAdmissibilidadePaginadoDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Deletar um parecer-admissibilidade.", summary: 'Delete parecer-admissibilidade.' })
  desativar(@Param('id') id: string) {
    return this.parecerAdmissibilidadeService.desativar(id);
  }
}
