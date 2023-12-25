import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigService } from './services/config/jwt-config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './services/config/mongo-config.service';
import { TokenSchema } from './schemas/token.schema';

@Module({
  imports: [
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),

    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),

    MongooseModule.forFeature([
      {
        name: 'Token',
        schema: TokenSchema,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
