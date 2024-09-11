import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { AvisosService } from './avisos.service';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';
import { UsuarioAtual } from 'src/auth/decorators/usuario-atual.decorator';
import { Usuario } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AvisosPorDataResponseDTO, AvisosResponseDTO } from './dto/response.dto';

@ApiTags('Avisos')
@ApiBearerAuth()
@Controller('avisos')
export class AvisosController {
  constructor(private readonly avisosService: AvisosService) {}

  @Post('criar')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ description: 'Corpo da requisição para criação de aviso.', type: CreateAvisoDto })
  @ApiResponse({ status: 201, description: 'Retorna 201 se criar o aviso com sucesso.',  type: AvisosResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Criar um aviso.", summary: 'Crie avisos.' })
  create(
    @Body() createAvisoDto: CreateAvisoDto, 
    @UsuarioAtual() usuario: Usuario
  ): Promise<AvisosResponseDTO> {
    return this.avisosService.create(createAvisoDto, createAvisoDto.tipo === 1 ? usuario.id : null);
  }

  @Get('buscar/:data')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar o aviso por data com sucesso.' })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar avisos por data.", summary: 'Busque avisos por data.' })
  findOne(
    @Param('data') data: Date, 
    @UsuarioAtual() usuario: Usuario
  ) {
    return this.avisosService.findOne(data, usuario.id);
  }

  @Get('buscar/:mes/:ano')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar o aviso por mês e ano com sucesso.',  type: [AvisosResponseDTO] })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar avisos por mês e ano.", summary: 'Busque avisos por mês e ano.' })
  buscarPorMesAno(
    @Param('mes') mes: string, 
    @Param('ano') ano: string, 
    @UsuarioAtual() usuario: Usuario
  ): Promise<AvisosResponseDTO[]> {
    return this.avisosService.buscarPorMesAno(parseInt(mes), parseInt(ano), usuario.id);
  }

  @Patch('atualizar/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ description: 'Corpo da requisição para atualização de aviso.', type: UpdateAvisoDto })
  @ApiResponse({ status: 200, description: 'Retorna 200 se atualizar o aviso por data com sucesso.',  type: AvisosResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Atualizar aviso.", summary: 'Atualize avisos.' })
  update(
    @Param('id') id: string, 
    @Body() updateAvisoDto: UpdateAvisoDto
  ): Promise<AvisosResponseDTO> {
    return this.avisosService.update(id, updateAvisoDto);
  }

  @Delete('excluir/:id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se deletar o aviso com sucesso.',  type: AvisosResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Deletar aviso.", summary: 'Delete avisos.' })
  remove(@Param('id') id: string): Promise<AvisosResponseDTO> {
    return this.avisosService.remove(id);
  }
}
