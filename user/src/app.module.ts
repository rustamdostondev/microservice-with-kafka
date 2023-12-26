import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigService } from './services/config/config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './services/config/mongo-config.service';
import { UserSchema } from './schemas/user.schemas';
import { UserLinkSchema } from './schemas/user-link.schema';
import { UserService } from './services/user.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
        collection: 'users',
      },
      {
        name: 'UserLink',
        schema: UserLinkSchema,
        collection: 'user_links',
      },
    ]),
  ],
  controllers: [AppController],
  providers: [UserService, ConfigService],
})
export class AppModule {}
