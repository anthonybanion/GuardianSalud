import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import jwtConfig from './config/jwt.config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StaffModule } from './modules/staff/staff.module';
import { ResidentsModule } from './modules/residents/residents.module';
import { MedicationsModule } from './modules/medications/medications.module';
import { TreatmentsModule } from './modules/treatments/treatments.module';
import { ShiftAssignmentsModule } from './modules/shift-assignments/shift-assignments.module';
import { DoseLogsModule } from './modules/dose-logs/dose-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    StaffModule,
    ResidentsModule,
    MedicationsModule,
    TreatmentsModule,
    ShiftAssignmentsModule,
    DoseLogsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}