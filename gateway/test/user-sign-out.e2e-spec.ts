import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as mongoose from 'mongoose';
import { AppModule } from '../src/app.module';
import { userSignupRequestSuccess } from './mocks/user-signup-request-success.mock';
import * as request from 'supertest';

describe('User Sign Out (e2e)', () => {
  let app: INestApplication;
  let userToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_DSN);
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/users/ (POST) - should create a valid user', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(userSignupRequestSuccess)
      .expect(201);
  });

  it('/users/login (POST) - should create a token for valid credentials', () => {
    return request(app.getHttpServer())
      .post('/users/login')
      .send(userSignupRequestSuccess)
      .expect(201)
      .expect((res) => {
        userToken = res.body.data.token;
      });
  });

  it('/users/logout (POST) - should destroy token for user', () => {
    return request(app.getHttpServer())
      .post('/users/logout')
      .set('authorization', userToken)
      .expect(200)
      .expect({
        message: 'token_destroy_success',
        data: null,
        errors: null,
      });
  });

  it('/users/ (GET) - should not retrieve user by a destroyed token', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('authorization', userToken)
      .expect(401)
      .expect({
        message: 'token_decode_unauthorized',
        data: null,
        errors: null,
      });
  });
});
