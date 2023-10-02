import { PartialType } from '@nestjs/swagger';
import { CreateInicialDto } from './create-inicial.dto';

export class UpdateInicialDto extends PartialType(CreateInicialDto) {}
