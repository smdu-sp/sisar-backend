import { Injectable } from '@nestjs/common';
import { CreateDistribuicaoDto } from './dto/create-distribuicao.dto';
import { UpdateDistribuicaoDto } from './dto/update-distribuicao.dto';

@Injectable()
export class DistribuicaoService {
  create(createDistribuicaoDto: CreateDistribuicaoDto) {
    return 'This action adds a new distribuicao';
  }

  findAll() {
    return `This action returns all distribuicao`;
  }

  findOne(id: number) {
    return `This action returns a #${id} distribuicao`;
  }

  update(id: number, updateDistribuicaoDto: UpdateDistribuicaoDto) {
    return `This action updates a #${id} distribuicao`;
  }

  remove(id: number) {
    return `This action removes a #${id} distribuicao`;
  }
}
