import * as mongoose from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { userSignupRequestSuccess } from './mocks/user-signup-request-success.mock';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('User Sign In (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_DSN);
    await mongoose.connection.dropDatabase();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users/ (POST) - should create valid user', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(userSignupRequestSuccess)
      .expect(201);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await app.close();
  });
});
