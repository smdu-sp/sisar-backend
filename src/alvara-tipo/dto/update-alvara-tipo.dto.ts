import { PartialType } from '@nestjs/mapped-types';
import { CreateAlvaraTipoDto } from './create-alvara-tipo.dto';

export class UpdateAlvaraTipoDto extends PartialType(CreateAlvaraTipoDto) {}
