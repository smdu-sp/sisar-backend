import { PartialType } from '@nestjs/swagger';
import { CreateDiretoriaDto } from './create-diretoria.dto';

export class UpdateDiretoriaDto extends PartialType(CreateDiretoriaDto) {}
