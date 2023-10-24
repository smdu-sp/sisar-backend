import { PartialType } from '@nestjs/swagger';
import { CreateAlvaraTipoDto } from './create-alvara_tipo.dto';

export class UpdateAlvaraTipoDto extends PartialType(CreateAlvaraTipoDto) {}
