import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import jwtConfig from './config/jwt.config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import {StaffModule} from './modules/staff/staff.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
  load: [
    jwtConfig,
  ],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    StaffModule,
  ],
    controllers: [AppController],
})
export class AppModule {}