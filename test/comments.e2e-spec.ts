import { INestApplication } from '@nestjs/common';
import { getAppAndCleanDB } from './utils/getAppAndCleanDB';
import { BlogViewModel } from '../src/blogs/models/BlogViewModel';
import { cleanDb } from './utils/cleanDb';
import { createUserAndGetAccessToken } from './utils/create-user-and-get-token/create-user-and-get-token';
import * as request from 'supertest';
import { newBlog } from './models-for-tests/positive/create/Blog';
import { CreateBlogModel } from '../src/blogs/models/CreateBlogModel';
import { PostViewModel } from '../src/blogs/posts/models/PostViewModel';
import { newPost } from './models-for-tests/positive/create/Post';
import { CreatePostModel } from '../src/blogs/posts/models/CreatePostModel';
import { CreateCommentModel } from '../src/blogs/posts/comments/models/CreateCommentModel';
import { CommentViewModel } from '../src/blogs/posts/comments/models/CommentViewModel';
import { UserViewModel } from '../src/users/models/UserViewModel';
import { UpdateCommentModel } from '../src/blogs/posts/comments/models/UpdateCommentModel';

jest.setTimeout(15000);
describe('/comments', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await getAppAndCleanDB();
  });

  describe('crud comments', () => {
    let blog: BlogViewModel;
    let post: PostViewModel;
    let accessToken;
    let user1: UserViewModel;
    beforeAll(async () => {
      await cleanDb(app);
      const { token, user } = await createUserAndGetAccessToken(app);
      accessToken = token;
      user1 = user;
      await request(app.getHttpServer())
        .post('/blogger/blogs')
        .set('Authorization', `bearer ${accessToken}`)
        .send(newBlog as CreateBlogModel)
        .expect(201)
        .then(({ body }) => {
          blog = body;
        });

      await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .set('Authorization', `bearer ${accessToken}`)
        .send(newPost as CreatePostModel)
        .expect(201)
        .then(({ body }) => {
          post = body;
        });
    });
    let comment: PostViewModel;
    it('should create comment', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', `bearer ${accessToken}`)
        .send({ content: 'contentcontencotocntcotn' } as CreateCommentModel)
        .expect(201)
        .then(({ body }) => {
          comment = body;
          expect(comment).toEqual({
            id: expect.any(String),
            content: 'contentcontencotocntcotn',
            createdAt: expect.any(String),
            likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
            commentatorInfo: { userId: user1.id, userLogin: user1.login },
          } as CommentViewModel);
        });
    });
    it('should update comment', async () => {
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}`)
        .send({ content: '123ofjdspjdsappfdsfdsfds' } as UpdateCommentModel)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({ ...comment, content: '123ofjdspjdsappfdsfdsfds' });
        });
    });
    it('should delete comment', async () => {
      await request(app.getHttpServer())
        .delete(`/comments/${comment.id}`)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(204);
      await request(app.getHttpServer()).get(`/comments/${comment.id}`).expect(404);
    });
  });
});
