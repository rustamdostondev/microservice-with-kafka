import * as mongoose from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { userSignupRequestSuccess } from './mocks/user-signup-request-success.mock';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import {
  userLoginRequestFailWrongEmail,
  userLoginRequestFailWrongPw,
} from './mocks/user-login-request-fail.mock';

describe('User Sign In (e2e)', () => {
  let app: INestApplication;

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

  it('/users/ (POST) - should create valid user', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(userSignupRequestSuccess)
      .expect(201);
  });

  it('/users/login (POST) - should not create a token for invalid email', () => {
    return request(app.getHttpServer())
      .post('/users/login')
      .send(userLoginRequestFailWrongEmail)
      .expect(401)
      .expect({
        message: 'user_search_by_credentials_not_found',
        data: null,
        errors: null,
      });
  });

  it('/users/login (POST) - should not create a token for invalid password', () => {
    return request(app.getHttpServer())
      .post('/users/login')
      .send(userLoginRequestFailWrongPw)
      .expect(401)
      .expect({
        message: 'user_search_by_credentials_not_match',
        data: null,
        errors: null,
      });
  });

  it('/users/login (POST) - should not create a token for empty body', () => {
    return request(app.getHttpServer())
      .post('/users/login')
      .send()
      .expect(401)
      .expect({
        message: 'user_search_by_credentials_not_found',
        data: null,
        errors: null,
      });
  });

  it('/users/login (POST) - should not create a token for string value in body', () => {
    return request(app.getHttpServer())
      .post('/users/login')
      .send(userSignupRequestSuccess.email)
      .expect(401)
      .expect({
        message: 'user_search_by_credentials_not_found',
        data: null,
        errors: null,
      });
  });

  it('/users/login (POST) - should create a token for valid credentials', () => {
    return request(app.getHttpServer())
      .post('/users/login')
      .send(userSignupRequestSuccess)
      .expect(201)
      .expect((res) => {
        res.body.data.token = 'fake_value';
      })
      .expect({
        message: 'token_create_success',
        data: {
          token: 'fake_value',
        },
        errors: null,
      });
  });
});
