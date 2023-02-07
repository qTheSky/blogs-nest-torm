import { createTestingModule } from './bolerplate';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { newBlog } from './models-for-tests/positive/create/Blog';
import { BlogViewModel } from '../src/blogs/models/BlogViewModel';
import { updateBlogModel } from './models-for-tests/positive/udate/Blog';
import { createUserAndGetToken } from './utils/create-user-and-get-token/create-user-and-get-token';

describe('BLOGS', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingModule(app);
  });

  afterAll(() => {
    return request(app.getHttpServer()).delete('/testing/all-data').expect(204);
  });

  describe('crud blogs', () => {
    let createdUser;
    let accessToken: string;
    beforeAll(async () => {
      await request(app.getHttpServer()).delete('/testing/all-data').expect(204);
      const { token, user } = await createUserAndGetToken(app);
      createdUser = user;
      accessToken = token;
    });
    let createdBlog: BlogViewModel;
    it('should create blog', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .set('authorization', `bearer ${accessToken}`)
        .send(newBlog)
        .expect(201);
      createdBlog = createResponse.body;
      expect(createResponse.body).toEqual({
        id: expect.any(String),
        name: newBlog.name,
        description: newBlog.description,
        websiteUrl: newBlog.websiteUrl,
        createdAt: expect.any(String),
      });
    });
    it('should update blog', async () => {
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${createdBlog.id}`)
        .set('authorization', `bearer ${accessToken}`)
        .send(updateBlogModel)
        .expect(204);
    });
    it('should get by id after updating with correct data', async () => {
      const { body } = await request(app.getHttpServer()).get(`/blogs/${createdBlog.id}`).expect(200);
      expect(body.id).toBe(createdBlog.id);
      expect(body.name).toBe(updateBlogModel.name);
      expect(body.description).toBe(updateBlogModel.description);
      expect(body.websiteUrl).toBe(updateBlogModel.websiteUrl);
    });
    it('should delete blog by id then get it by id and take 404 error', async () => {
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${createdBlog.id}`)
        .set('authorization', `bearer ${accessToken}`)
        .expect(204);
      await request(app.getHttpServer()).get(`/blogs/${createdBlog.id}`).expect(404);
    });
  });
});
