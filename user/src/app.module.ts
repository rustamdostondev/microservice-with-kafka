import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from './services/config/config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './services/config/mongo-config.service';
import { UserSchema } from './schemas/user.schemas';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema, collection: 'users' },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
