import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AnaliseService } from './analise.service';
import { RegistrarPreReuniaoDto } from './dto/registrar-pre-reuniao.dto';
import { RegistrarComuniqueSeDto } from './dto/registrar-comunique-se.dto';
import { RegistrarDecisaoDto } from './dto/registrar-decisao.dto';
import { RespostaComuniqueSeDto } from './dto/resposta-comunique-se.dto';

@ApiTags('Análise')
@ApiBearerAuth()
@Controller('analise')
export class AnaliseController {
  constructor(private readonly analiseService: AnaliseService) {}

  @Get('contexto/:inicialId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Estado do fluxo de análise técnica' })
  obterContexto(@Param('inicialId') inicialId: string) {
    return this.analiseService.obterContexto(+inicialId);
  }

  @Post('pre-reuniao/:inicialId')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: RegistrarPreReuniaoDto })
  registrarPreReuniao(
    @Param('inicialId') inicialId: string,
    @Body() dto: RegistrarPreReuniaoDto,
  ) {
    return this.analiseService.registrarPreReuniao(+inicialId, dto);
  }

  @Post('comunique-se/:inicialId')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: RegistrarComuniqueSeDto })
  registrarComuniqueSe(
    @Param('inicialId') inicialId: string,
    @Body() dto: RegistrarComuniqueSeDto,
  ) {
    return this.analiseService.registrarComuniqueSe(+inicialId, dto);
  }

  @Patch('comunique-se/:id/resposta')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: RespostaComuniqueSeDto })
  registrarRespostaComuniqueSe(
    @Param('id') id: string,
    @Body() dto: RespostaComuniqueSeDto,
  ) {
    return this.analiseService.registrarRespostaComuniqueSe(
      id,
      dto.data_resposta,
    );
  }

  @Post('decisao/:inicialId')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: RegistrarDecisaoDto })
  registrarDecisao(
    @Param('inicialId') inicialId: string,
    @Body() dto: RegistrarDecisaoDto,
  ) {
    return this.analiseService.registrarDecisao(+inicialId, dto);
  }

  @Post('recurso/:inicialId')
  @HttpCode(HttpStatus.OK)
  registrarRecurso(@Param('inicialId') inicialId: string) {
    return this.analiseService.registrarRecurso(+inicialId);
  }

  @Post('encerrar-recurso/:inicialId')
  @HttpCode(HttpStatus.OK)
  encerrarSemRecurso(@Param('inicialId') inicialId: string) {
    return this.analiseService.encerrarSemRecurso(+inicialId);
  }
}
