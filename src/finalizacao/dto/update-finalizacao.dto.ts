import { PartialType } from '@nestjs/swagger';
import { CreateFinalizacaoDto } from './create-finalizacao.dto';

export class UpdateFinalizacaoDto extends PartialType(CreateFinalizacaoDto) {}
