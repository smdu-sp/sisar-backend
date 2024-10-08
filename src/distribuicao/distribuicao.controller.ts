import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { DistribuicaoService } from './distribuicao.service';
import { CreateDistribuicaoDto } from './dto/create-distribuicao.dto';
import { UpdateDistribuicaoDto } from './dto/update-distribuicao.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DistribuicaoResponseDTO } from './dto/distribuicao-response.dto';

export class UpdateAdministrativoResponsavelDTO {
  @ApiProperty()
  administrativo_responsavel_id: string;
}

export class UpdateTecnicoResponsavelDTO {
  @ApiProperty()
  tecnico_responsavel_id: string;
}

@ApiTags('Distribuição')
@ApiBearerAuth()
@Controller('distribuicao')
export class DistribuicaoController {
  constructor(private readonly distribuicaoService: DistribuicaoService) {}

  @Post('criar')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ description: 'Corpo da requisição para criação de distribuição.', type: CreateDistribuicaoDto })
  @ApiResponse({ status: 201, description: 'Retorna 201 se criar a distribuição com sucesso.', type: DistribuicaoResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Criar uma distribuição.", summary: 'Crie distribuições.' })
  criar(@Body() createDistribuicaoDto: CreateDistribuicaoDto): Promise<DistribuicaoResponseDTO> {
    return this.distribuicaoService.criar(createDistribuicaoDto);
  }

  @Patch('atualizar/:inicial_id')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ description: 'Corpo da requisição para atualização de distribuição.', type: CreateDistribuicaoDto })
  @ApiResponse({ status: 200, description: 'Retorna 200 se atualizar a distribuição com sucesso.', type: DistribuicaoResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Atualizar uma distribuição.", summary: 'Atualize distribuições.' })
  atualizar(
    @Param('inicial_id') inicial_id: string, 
    @Body() updateDistribuicaoDto: UpdateDistribuicaoDto
  ): Promise<DistribuicaoResponseDTO> {
    return this.distribuicaoService.atualizar(+inicial_id, updateDistribuicaoDto);
  }

  @Patch('administrativo/atualizar/:inicial_id')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ description: 'Corpo da requisição para atualização de adiministrativo.', type: UpdateAdministrativoResponsavelDTO })
  @ApiResponse({ status: 200, description: 'Retorna 200 se atualizar o administrativo com sucesso.', type: DistribuicaoResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Atualizar o adiministrativo.", summary: 'Atualize o adiministrativo.' })
  mudarAdministrativoResponsavel(
    @Param('inicial_id') inicial_id: string, 
    @Body() { administrativo_responsavel_id }: UpdateAdministrativoResponsavelDTO
  ): Promise<DistribuicaoResponseDTO> {
    return this.distribuicaoService.mudarAdministrativoResponsavel(+inicial_id, administrativo_responsavel_id);
  }

  @Patch('tecnico/atualizar/:inicial_id')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ description: 'Corpo da requisição para atualização de tecnico.', type: UpdateTecnicoResponsavelDTO })
  @ApiResponse({ status: 200, description: 'Retorna 200 se atualizar o tecnico com sucesso.', type: DistribuicaoResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Atualizar o tecnico.", summary: 'Atualize o tecnico.' })
  mudarTecnicoResponsavel(
    @Param('inicial_id') inicial_id: string, 
    @Body() { tecnico_responsavel_id }: UpdateTecnicoResponsavelDTO
  ): Promise<DistribuicaoResponseDTO> {
    return this.distribuicaoService.mudarTecnicoResponsavel(+inicial_id, tecnico_responsavel_id);
  }
}
