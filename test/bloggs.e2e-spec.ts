import { INestApplication } from '@nestjs/common';
import { getAppAndCleanDB } from './utils/getAppAndCleanDB';
import { cleanDb } from './utils/cleanDb';
import * as request from 'supertest';
import { createUserAndGetAccessToken } from './utils/create-user-and-get-token/create-user-and-get-token';
import { newBlog } from './models-for-tests/positive/create/Blog';
import { CreateBlogModel } from '../src/blogs/models/CreateBlogModel';
import { BlogViewModel } from '../src/blogs/models/BlogViewModel';
import { UpdateBlogModel } from '../src/blogs/models/UpdateBlogModel';
import { updateBlogModel } from './models-for-tests/positive/udate/Blog';

jest.setTimeout(15000);
describe('/blogger controller', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await getAppAndCleanDB();
  });

  describe('/crud blogs', () => {
    beforeAll(async () => {
      await cleanDb(app);
    });
    let blog: BlogViewModel;
    let accessToken;
    it('should create blog', async () => {
      const { user, token } = await createUserAndGetAccessToken(app);
      accessToken = token;
      return request(app.getHttpServer())
        .post('/blogger/blogs')
        .set('Authorization', `bearer ${accessToken}`)
        .send(newBlog as CreateBlogModel)
        .expect(201)
        .then(({ body }) => {
          blog = body;
          expect(body).toEqual({
            id: expect.any(String),
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: expect.any(String),
            isMembership: true,
          } as BlogViewModel);
        });
    });
    it('should update blog', async () => {
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog.id}`)
        .set('Authorization', `bearer ${accessToken}`)
        .send(updateBlogModel as UpdateBlogModel)
        .expect(204);

      return request(app.getHttpServer())
        .get(`/blogs/${blog.id}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            id: blog.id,
            isMembership: true,
            websiteUrl: updateBlogModel.websiteUrl,
            createdAt: expect.any(String),
            description: updateBlogModel.description,
            name: updateBlogModel.name,
          } as BlogViewModel);
        });
    });

    it('should delete blog', async () => {
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog.id}`)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(204);

      return request(app.getHttpServer()).get(`/blogs/${blog.id}`).expect(404);
    });
  });
});
