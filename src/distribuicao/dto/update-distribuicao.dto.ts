import { PartialType } from '@nestjs/swagger';
import { CreateDistribuicaoDto } from './create-distribuicao.dto';

export class UpdateDistribuicaoDto extends PartialType(CreateDistribuicaoDto) {}
