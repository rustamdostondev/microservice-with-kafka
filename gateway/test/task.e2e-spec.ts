import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as mongoose from 'mongoose';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { userSignupRequestSuccess } from './mocks/user-signup-request-success.mock';
import { taskCreateRequestSuccess } from './mocks/task-create-request-success.mock';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let userToken: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_DSN);
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
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

  it('/users (POST) - should create a user for checking tasks api', () => {
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

  it('/tasks (GET) - should not return tasks without valid token', () => {
    return request(app.getHttpServer()).get('/tasks').expect(401).expect({
      message: 'token_decode_unauthorized',
      data: null,
      errors: null,
    });
  });

  it('should not create task with invalid token', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .set('authorization', userToken + 1)
      .send(taskCreateRequestSuccess)
      .expect(401)
      .expect({
        message: 'token_decode_unauthorized',
        data: null,
        errors: null,
      });
  });

  it('/tasks (POST) - should not create task for unconfirmed user with valid token', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .set('authorization', userToken)
      .send(taskCreateRequestSuccess)
      .expect(403)
      .expect({
        message: 'permission_check_forbidden',
        data: null,
        errors: null,
      });
  });

  it('/tasks (GET) - should not retrieve tasks without a valid token', () => {
    return request(app.getHttpServer()).get('/tasks').expect(401).expect({
      message: 'token_decode_unauthorized',
      data: null,
      errors: null,
    });
  });

  it('/tasks (GET) - should not retrieve tasks with an valid token', () => {
    return request(app.getHttpServer())
      .get('/tasks')
      .set('authorization', userToken + 1)
      .expect(401)
      .expect({
        message: 'token_decode_unauthorized',
        data: null,
        errors: null,
      });
  });
});
