import { BlogViewModel } from '../src/blogs/models/BlogViewModel';
import { cleanDb } from './utils/cleanDb';
import { createUserAndGetAccessToken } from './utils/create-user-and-get-token/create-user-and-get-token';
import * as request from 'supertest';
import { newBlog } from './models-for-tests/positive/create/Blog';
import { CreateBlogModel } from '../src/blogs/models/CreateBlogModel';
import { ExtendedLikesInfo, PostViewModel } from '../src/blogs/posts/models/PostViewModel';
import { newPost } from './models-for-tests/positive/create/Post';
import { CreatePostModel } from '../src/blogs/posts/models/CreatePostModel';
import { updatePostModel } from './models-for-tests/positive/udate/Post';
import { UpdatePostModel } from '../src/blogs/posts/models/UpdatePostModel';
import { INestApplication } from '@nestjs/common';
import { getAppAndCleanDB } from './utils/getAppAndCleanDB';
import { LikeModel } from '../src/common/like.types';
import { UserViewModel } from '../src/users/models/UserViewModel';

jest.setTimeout(15000);

describe('posts', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await getAppAndCleanDB();
  });
  describe('/crud posts', () => {
    let blog: BlogViewModel;
    let accessToken;
    beforeAll(async () => {
      await cleanDb(app);
      const { token } = await createUserAndGetAccessToken(app);
      accessToken = token;
      await request(app.getHttpServer())
        .post('/blogger/blogs')
        .set('Authorization', `bearer ${accessToken}`)
        .send(newBlog as CreateBlogModel)
        .expect(201)
        .then(({ body }) => {
          blog = body;
        });
    });
    let post: PostViewModel;
    it('should create post for blog', async () => {
      await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .set('Authorization', `bearer ${accessToken}`)
        .send(newPost as CreatePostModel)
        .expect(201)
        .then(({ body }) => {
          post = body;
          expect(body).toEqual({
            id: expect.any(String),
            blogId: blog.id,
            blogName: blog.name,
            createdAt: expect.any(String),
            content: newPost.content,
            title: newPost.title,
            shortDescription: newPost.shortDescription,
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: expect.any(Array),
            },
          } as PostViewModel);
        });
    });
    it('should update post', async () => {
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog.id}/posts/${post.id}`)
        .set('Authorization', `bearer ${accessToken}`)
        .send(updatePostModel as UpdatePostModel)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/posts/${post.id}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            id: post.id,
            blogId: blog.id,
            blogName: blog.name,
            createdAt: expect.any(String),
            title: updatePostModel.title,
            content: updatePostModel.content,
            shortDescription: updatePostModel.shortDescription,
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: expect.any(Array),
            },
          } as PostViewModel);
        });
    });
    it('should delete post', async () => {
      await request(app.getHttpServer()).delete(`/blogger/${blog.id}/posts/${post.id}`).expect(204);
      await request(app.getHttpServer()).get(`/posts/${post.id}`).expect(404);
    });
  });
  describe('/like post', () => {
    let accessToken;
    let blog: BlogViewModel;
    let post: PostViewModel;
    let user1: UserViewModel;
    beforeAll(async () => {
      await cleanDb(app);
      const { token, user } = await createUserAndGetAccessToken(app);
      accessToken = token;
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

    it('should like post', async () => {
      //send 3 likes and 1 dislike
      await request(app.getHttpServer())
        .put(`posts/${post.id}/like-status`)
        .set('Authorization', `bearer ${accessToken}`)
        .send({ likeStatus: 'Like' } as LikeModel)
        .expect(204);
      await request(app.getHttpServer())
        .put(`posts/${post.id}/like-status`)
        .set('Authorization', `bearer ${accessToken}`)
        .send({ likeStatus: 'Like' } as LikeModel)
        .expect(204);
      await request(app.getHttpServer())
        .put(`posts/${post.id}/like-status`)
        .set('Authorization', `bearer ${accessToken}`)
        .send({ likeStatus: 'Dislike' } as LikeModel)
        .expect(204);
      await request(app.getHttpServer())
        .put(`posts/${post.id}/like-status`)
        .set('Authorization', `bearer ${accessToken}`)
        .send({ likeStatus: 'Like' } as LikeModel)
        .expect(204);
      //send 3 likes and 1 dislike
      //expect only 1 like 0 dislikes
      await request(app.getHttpServer())
        .get(`/posts/${post.id}`)
        .set('Authorization', `bearer ${accessToken}`)
        .expect(200)
        .then(({ body }) => {
          expect(body.extendedLikesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: 'Like',
            newestLikes: [{ userId: user1.id, login: user1.login, addedAt: expect.any(String) }],
          } as ExtendedLikesInfo);
        });
      //expect only 1 like 0 dislikes
    });
  });
});
