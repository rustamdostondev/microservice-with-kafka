import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as mongoose from 'mongoose';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { userSignupRequestSuccess } from './mocks/user-signup-request-success.mock';
import { taskCreateRequestSuccess } from './mocks/task-create-request-success.mock';
import { taskUpdateRequestSuccess } from './mocks/task-update-request-success.mock';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let user;
  let taskId;

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

  it('/tasks (GET) - should not retrieve tasks with valid token', () => {
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

  it('/users/confirm/:link (GET) - should confirm user', async () => {
    user = await mongoose.connection
      .collection('users')
      .find({
        email: userSignupRequestSuccess.email,
      })
      .toArray();

    const userConfirmation = await mongoose.connection
      .collection('user_links')
      .find({
        user_id: user[0]._id.toString(),
      })
      .toArray();

    return request(app.getHttpServer())
      .get(`/users/confirm/${userConfirmation[0].link}`)
      .send()
      .expect(200)
      .expect({
        message: 'user_confirm_success',
        data: null,
        errors: null,
      });
  });

  it('/tasks (POST) - should create a task for the user with a valid token', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .set('authorization', userToken)
      .send(taskCreateRequestSuccess)
      .expect(201)
      .expect((res) => {
        res.body.data.task.id = 'fake_value';
        res.body.data.task.created_at = 'fake_value';
        res.body.data.task.updated_at = 'fake_value';
      })
      .expect({
        message: 'task_create_success',
        data: {
          task: {
            notification_id: null,
            name: taskCreateRequestSuccess.name,
            description: taskCreateRequestSuccess.description,
            start_time: taskCreateRequestSuccess.start_time,
            duration: taskCreateRequestSuccess.duration,
            user_id: user[0]._id.toString(),
            is_solved: false,
            created_at: 'fake_value',
            updated_at: 'fake_value',
            id: 'fake_value',
          },
        },
        errors: null,
      });
  });

  it('/tasks (POST) - should not create a task with invalid params', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .set('authorization', userToken)
      .send(null)
      .expect(412)
      .expect((res) => {
        res.body.errors.duration.properties = 'fake_properties';
        res.body.errors.start_time.properties = 'fake_properties';
        res.body.errors.name.properties = 'fake_properties';
      })
      .expect({
        message: 'task_create_precondition_failed',
        data: null,
        errors: {
          duration: {
            name: 'ValidatorError',
            message: 'Duration can not be empty',
            properties: 'fake_properties',
            kind: 'required',
            path: 'duration',
          },
          start_time: {
            name: 'ValidatorError',
            message: 'Start time can not be empty',
            properties: 'fake_properties',
            kind: 'required',
            path: 'start_time',
          },
          name: {
            name: 'ValidatorError',
            message: 'Name can not be empty',
            properties: 'fake_properties',
            kind: 'required',
            path: 'name',
          },
        },
      });
  });

  it('/tasks (GET) - should retrieve tasks for a valid token', () => {
    return request(app.getHttpServer())
      .get('/tasks')
      .set('authorization', userToken)
      .expect(200)
      .expect((res) => {
        res.body.data.tasks[0].created_at = 'fake_value';
        res.body.data.tasks[0].updated_at = 'fake_value';
        taskId = res.body.data.tasks[0].id.toString();
        res.body.data.tasks[0].id = 'fake_value';
      })
      .expect({
        message: 'task_search_by_user_id_success',
        data: {
          tasks: [
            {
              notification_id: null,
              name: taskCreateRequestSuccess.name,
              description: taskCreateRequestSuccess.description,
              start_time: taskCreateRequestSuccess.start_time,
              duration: taskCreateRequestSuccess.duration,
              created_at: 'fake_value',
              updated_at: 'fake_value',
              user_id: user[0]._id.toString(),
              is_solved: false,
              id: 'fake_value',
            },
          ],
        },
        errors: null,
      });
  });

  it('/tasks/{id} (PUT) - should not task with invalid token', () => {
    return request(app.getHttpServer())
      .put(`/tasks/${taskId}`)
      .send(taskUpdateRequestSuccess)
      .expect(401)
      .expect({
        message: 'token_decode_unauthorized',
        data: null,
        errors: null,
      });
  });

  it('/tasks/{id} (PUT) - should update task with valid params', () => {
    return request(app.getHttpServer())
      .put(`/tasks/${taskId}`)
      .set('authorization', userToken)
      .send(taskUpdateRequestSuccess)
      .expect(200)
      .expect((res) => {
        res.body.data.task.created_at = 'fake_value';
        res.body.data.task.updated_at = 'fake_value';
      })
      .expect({
        message: 'task_update_by_id_success',
        data: {
          task: {
            notification_id: null,
            name: taskUpdateRequestSuccess.name,
            description: taskUpdateRequestSuccess.description,
            start_time: taskUpdateRequestSuccess.start_time,
            duration: taskUpdateRequestSuccess.duration,
            created_at: 'fake_value',
            updated_at: 'fake_value',
            user_id: user[0]._id.toString(),
            is_solved: taskUpdateRequestSuccess.is_solved,
            id: taskId,
          },
        },
        errors: null,
      });
  });

  it('/tasks/{id} (DELETE) - should not delete task with invalid token', () => {
    return request(app.getHttpServer())
      .delete(`/tasks/${taskId}`)
      .send()
      .expect(401)
      .expect({
        message: 'token_decode_unauthorized',
        data: null,
        errors: null,
      });
  });

  it('/tasks/{id} (DELETE) - should delete task with  valid token', () => {
    return request(app.getHttpServer())
      .delete(`/tasks/${taskId}`)
      .set('authorization', userToken)
      .send()
      .expect(200)
      .expect({
        message: 'task_delete_by_id_success',
        data: null,
        errors: null,
      });
  });
});
