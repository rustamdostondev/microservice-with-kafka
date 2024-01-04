import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as mongoose from 'mongoose';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import {
  userSignupRequestFailInvalidEmail,
  userSignupRequestFailNoPw,
  userSignupRequestFailShortPw,
} from './mocks/user-signup-request-fail.mock';
import { userSignupRequestSuccess } from './mocks/user-signup-request-success.mock';

describe('User Sign Up (e2e)', () => {
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

  it('/users (POST) - should not create user without request body', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send()
      .expect(412)
      .expect((res) => {
        res.body.errors.email.properties = 'fake_properties';
        res.body.errors.password.properties = 'fake_properties';
      })
      .expect({
        message: 'user_create_precondition_failed',
        data: null,
        errors: {
          password: {
            name: 'ValidatorError',
            message: 'Password can not be empty',
            properties: 'fake_properties',
            kind: 'required',
            path: 'password',
          },
          email: {
            name: 'ValidatorError',
            message: 'Path `email` is required.',
            properties: 'fake_properties',
            kind: 'required',
            path: 'email',
          },
        },
      });
  });

  it('/users (POST) - should not create user without password', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(userSignupRequestFailNoPw)
      .expect(412)
      .expect((res) => {
        res.body.errors.password.properties = 'fake_properties';
      })
      .expect({
        message: 'user_create_precondition_failed',
        data: null,
        errors: {
          password: {
            name: 'ValidatorError',
            message: 'Password can not be empty',
            properties: 'fake_properties',
            kind: 'required',
            path: 'password',
          },
        },
      });
  });

  it('/users (POST) - should not create user if password is short', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(userSignupRequestFailShortPw)
      .expect(412)
      .expect((res) => {
        res.body.errors.password.properties = 'fake_properties';
      })
      .expect({
        message: 'user_create_precondition_failed',
        data: null,
        errors: {
          password: {
            name: 'ValidatorError',
            message: 'Password should include at least 6 chars',
            properties: 'fake_properties',
            kind: 'minlength',
            path: 'password',
            value: userSignupRequestFailShortPw.password,
          },
        },
      });
  });

  it('/users (POST) - should not create user without email', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        password: 'test111',
      })
      .expect(412)
      .expect((res) => {
        res.body.errors.email.properties = 'fake_properties';
      })
      .expect({
        message: 'user_create_precondition_failed',
        data: null,
        errors: {
          email: {
            name: 'ValidatorError',
            message: 'Path `email` is required.',
            properties: 'fake_properties',
            kind: 'required',
            path: 'email',
          },
        },
      });
  });

  it('/users (POST) - should not create user with invalid email', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(userSignupRequestFailInvalidEmail)
      .expect(412)
      .expect((res) => {
        res.body.errors.email.properties = 'fake_properties';
      })
      .expect({
        message: 'user_create_precondition_failed',
        data: null,
        errors: {
          email: {
            name: 'ValidatorError',
            message: 'Email should be valid',
            properties: 'fake_properties',
            kind: 'regexp',
            path: 'email',
            value: userSignupRequestFailInvalidEmail.email,
          },
        },
      });
  });

  it('/users/ (POST) - should create a valid user', () => {
    return request(app.getHttpServer())
      .post('/users/')
      .send(userSignupRequestSuccess)
      .expect(201)
      .expect((res) => {
        res.body.data.user.id = 'fake_value';
        res.body.data.token = 'fake_value';
      })
      .expect({
        message: 'user_create_success',
        data: {
          user: {
            email: userSignupRequestSuccess.email,
            is_confirmed: false,
            id: 'fake_value',
          },
          token: 'fake_value',
        },
        errors: null,
      });
  });
});
