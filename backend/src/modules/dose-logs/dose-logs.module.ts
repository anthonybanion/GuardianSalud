import { Module } from '@nestjs/common';

import { DoseLogsController } from './dose-logs.controller';
import { DoseLogsService } from './dose-logs.service';
import { DoseLogsRepository } from './dose-logs.repository';

@Module({
  controllers: [DoseLogsController],
  providers: [DoseLogsService, DoseLogsRepository],
  exports: [DoseLogsService],
})
export class DoseLogsModule {}
