import { Module } from '@nestjs/common';

import { ResidentsController } from './residents.controller';
import { ResidentsService } from './residents.service';
import { ResidentsRepository } from './residents.repository';

@Module({
  controllers: [ResidentsController],
  providers: [ResidentsService, ResidentsRepository],
  exports: [ResidentsService],
})
export class ResidentsModule {}
