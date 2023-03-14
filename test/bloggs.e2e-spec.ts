import { INestApplication } from '@nestjs/common';
import { getAppAndCleanDB } from './utils/getAppAndCleanDB';
import { cleanDb } from './utils/cleanDb';
import request from 'supertest';
import { createUserAndGetAccessToken } from './utils/create-user-and-get-token/create-user-and-get-token';
import { newBlog } from './models-for-tests/positive/create/Blog';
import { CreateBlogModel } from '../src/blogs/models/CreateBlogModel';
import { BlogViewModel } from '../src/blogs/models/BlogViewModel';
import { UpdateBlogModel } from '../src/blogs/models/UpdateBlogModel';
import { updateBlogModel } from './models-for-tests/positive/udate/Blog';
import { getCreateModels } from './utils/get-create-models';
import { createManyItemsToDb } from './utils/create-many-items-to-db';
import { PaginatorWithItems } from '../src/shared/types/paginator-response-type';
import { BanUserForBlogModel } from '../src/blogs/models/BanUserForBlogModel';
import { createTwoUsersAndGetTokens } from './utils/create-user-and-get-token/create-two-users';
import { newPost } from './models-for-tests/positive/create/Post';
import { PostViewModel } from '../src/blogs/posts/models/PostViewModel';
import { newComment } from './models-for-tests/positive/create/Comment';

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
            isMembership: false,
            images: { main: [], wallpaper: null },
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
            isMembership: false,
            websiteUrl: updateBlogModel.websiteUrl,
            createdAt: expect.any(String),
            description: updateBlogModel.description,
            name: updateBlogModel.name,
            images: { main: [], wallpaper: null },
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

  describe('just get blogs and pagging', () => {
    let accessToken;
    beforeAll(async () => {
      await cleanDb(app);
      const { token } = await createUserAndGetAccessToken(app);
      accessToken = token;
    });
    it('should create 12 blogs', async () => {
      const models = getCreateModels<CreateBlogModel>(
        12,
        {
          websiteUrl: 'https://github.com/',
          name: '',
          description: 'good description',
        },
        'name',
      );
      await createManyItemsToDb<CreateBlogModel>(app, '/blogger/blogs', 12, models, accessToken);
    });

    it('should get blogs with pagging', async () => {
      return request(app.getHttpServer())
        .get('/blogs?' + 'searchNameTerm=va&' + 'sortDirection=desc&' + 'pageNumber=3&' + 'pageSize=1')
        .expect(200)
        .then(({ body }) => {
          expect(body.items.length).toBe(1);
          expect(body).toEqual({
            ...PaginatorWithItems,
            page: 3,
            pageSize: 1,
            pagesCount: 3,
            totalCount: 3,
            items: expect.any(Array),
          });
          expect(body.items[0].name).toBe('Ivan');
        });
    });
  });

  describe('/ban user in blog', () => {
    let blogOwner;
    let bannedUser;
    let blogOwnerAccessToken;
    let bannedUserAccessToken;
    let blog: BlogViewModel;
    let post: PostViewModel;
    beforeAll(async () => {
      await cleanDb(app);
      const { user1, user2 } = await createTwoUsersAndGetTokens(app);
      blogOwner = user1.user;
      blogOwnerAccessToken = user1.token;
      bannedUser = user2.user;
      bannedUserAccessToken = user2.token;
    });
    it('should ban user in blog', async () => {
      //create blog
      await request(app.getHttpServer())
        .post(`/blogger/blogs`)
        .send(newBlog)
        .set('Authorization', `bearer ${blogOwnerAccessToken}`)
        .expect(201)
        .then(({ body }) => {
          blog = body;
        });
      //create blog
      //create post
      await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .send(newPost)
        .set('Authorization', `bearer ${blogOwnerAccessToken}`)
        .expect(201)
        .then(({ body }) => {
          post = body;
        });
      //create post
      //ban user
      await request(app.getHttpServer())
        .put(`/blogger/users/${bannedUser.id}/ban`)
        .send({ banReason: 'stringstringstrings21t', isBanned: true, blogId: blog.id } as BanUserForBlogModel)
        .set('Authorization', `bearer ${blogOwnerAccessToken}`)
        .expect(204);
      //ban user
      //try to make commend by banned user
      await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .send(newComment)
        .set('Authorization', `bearer ${bannedUserAccessToken}`)
        .expect(403);
      //try to make commend by banned user
    });
  });
});
