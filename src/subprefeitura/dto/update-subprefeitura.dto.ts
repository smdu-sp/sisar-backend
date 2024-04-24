import { PartialType } from '@nestjs/mapped-types';
import { CreateSubprefeituraDto } from './create-subprefeitura.dto';

export class UpdateSubprefeituraDto extends PartialType(CreateSubprefeituraDto) {}
