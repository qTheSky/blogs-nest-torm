import { Module } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { _User, UserSchema } from './users/user.schema';
import { ViewModelMapper } from './common/view-model-mapper';
import { QueryNormalizer } from './common/query-normalizer';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsRepository } from './blogs/blogs.repository';
import { Blog, BlogSchema } from './blogs/blog.schema';
import { BlogsQueryRepository } from './blogs/blogs.query.repository';
import { PostsRepository } from './posts/posts.repository';
import { PostsQueryRepository } from './posts/posts.query.repository';
import { Post, PostSchema } from './posts/post.schema';
import { PostsController } from './posts/posts.controller';
import { TestingController } from './testing/testing.controller';
import { PostsService } from './posts/posts.service';
import { IsBlogExistConstraint } from './posts/models/CreatePostModel';
import { IsEmailOrLoginUniqueConstraint } from './users/models/CreateUserModel';
import { EmailsManager } from './common/managers/emails-manager';
import { EmailAdapter } from './common/adapters/email.adapter';
import { AuthController } from './auth/auth.controller';
import { IsConfirmationCodeValidConstraint } from './auth/models/ConfirmationCodeModel';
import { CheckIsEmailConfirmedConstraint } from './auth/models/EmailResendModel';
import { JwtModule } from '@nestjs/jwt';
import { Comment, CommentSchema } from './posts/comments/comment.schema';
import { CommentsService } from './posts/comments/comments.service';
import { CommentsRepository } from './posts/comments/comments.repository';
import { CommentsQueryRepository } from './posts/comments/comments.query.repository';
import { CommentsController } from './posts/comments/comments.controller';
import { LikesCommentsRepository } from './posts/comments/likes/likesComments.repository';
import { LikeComment, LikeCommentSchema } from './posts/comments/likes/likeComment.schema';
import { LikesPostsRepository } from './posts/likes/likesPosts.repository';
import { LikePost, LikePostSchema } from './posts/likes/likePost.schema';
import { SessionsService } from './security/application/sessions.service';
import { SessionsController } from './security/sessions.controller';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { jwtConstants } from './auth/constants';
import { BasicStrategy } from './auth/strategies/basic.strategy';
import { AuthService } from './auth/application/auth.service';
import { CqrsModule } from '@nestjs/cqrs';
import { RegistrationUseCase } from './auth/application/use-cases/registration-use-case';
import { ConfirmEmailUseCase } from './auth/application/use-cases/confirm-email-use-case';
import { LogoutUseCase } from './auth/application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from './auth/application/use-cases/refresh-token.use-case';
import { BlogsService } from './blogs/application/blogs.service';
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog.use-case';
import { BloggerController } from './blogs/blogger.controller';
import { CreatePostUseCase } from './posts/use-cases/create-post.use-case';
import { DeletePostUseCase } from './posts/use-cases/delete-post.use-case';
import { UpdatePostUseCase } from './posts/use-cases/update-post.use-case';
import { SuperAdminController } from './super-admin/super-admin.controller';
import { BindBlogWithUserUseCase } from './super-admin/use-cases/bind-blog-with-user.use-case';
import { DeleteUserUseCase } from './super-admin/use-cases/delete-user.use-case';
import { BanUserUseCase } from './super-admin/use-cases/ban-user.use-case';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog.use-case';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog.use-case';
import { LoginUseCase } from './auth/application/use-cases/login.use-case';
import { GetAuthUserDataUseCase } from './auth/application/use-cases/get-auth-user-data.use-case';
import { BanUserForBlogUseCase } from './blogs/application/use-cases/ban-user-for-blog.use-case';
import { CreateCommentUseCase } from './posts/comments/use-cases/create-comment.use-case';
import { UpdateCommentUseCase } from './posts/comments/use-cases/update-comment.use-case';
import { BanBlogUseCase } from './super-admin/use-cases/ban-blog.use-case';
import { BannedUsersInBlogsRepository } from './blogs/banned-users-in-blogs.repository';
import { BannedUsersInBlogQueryRepository } from './blogs/banned-users-in-blog.query.repository';
import { BannedUserInBlog, BannedUserInBlogSchema } from './blogs/banned-user-in-blog.schema';
import { UsersRepository } from './users/users.repository';
import { UpdateEmailConfirmationCodeUseCase } from './auth/application/use-cases/update-email-confirmation-code.use-case';
import { DeleteCommentUseCase } from './posts/comments/use-cases/delete-comment.use-case';
import { PutLikeToCommentUseCase } from './posts/comments/use-cases/put-like-to-comment.use-case';
import { PutLikeToPostUseCase } from './posts/use-cases/put-like-to-post.use-case';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { UserEmailConfirmation } from './users/entities/userEmailConfirmation.entity';
import { UsersRepo } from './users/users.repo';
import { UserBanInfo } from './users/entities/userBanInfo.entity';
import { SessionsRepo } from './security/sessions.repo';
import { Session } from './security/entities/session.entity';
import { DeleteSessionByDeviceIdUseCase } from './security/application/use-cases/delete-session-by-device-id-use.case';
import { DeleteSessionsExceptCurrentUseCase } from './security/application/use-cases/delete-sessions-except-current.use-case';
import { RefreshTokenBL } from './security/entities/refreshTokenBlackList.entity';
import { RefreshTokenBlackListRepo } from './security/refreshTokenBlackList.repo';
import { UsersQueryRepo } from './users/users.query.repo';

//USE CASES
const authUseCases = [
  RegistrationUseCase,
  ConfirmEmailUseCase,
  ConfirmEmailUseCase,
  LogoutUseCase,
  RefreshTokenUseCase,
  LoginUseCase,
  GetAuthUserDataUseCase,
  UpdateEmailConfirmationCodeUseCase,
];
const blogsUseCases = [DeleteBlogUseCase, CreateBlogUseCase, UpdateBlogUseCase, BanUserForBlogUseCase];
const postsUseCases = [CreatePostUseCase, DeletePostUseCase, UpdatePostUseCase, PutLikeToPostUseCase];
const commentsUseCases = [CreateCommentUseCase, UpdateCommentUseCase, DeleteCommentUseCase, PutLikeToCommentUseCase];
const saUseCases = [BindBlogWithUserUseCase, DeleteUserUseCase, BanUserUseCase, BanBlogUseCase];
const sessionsUseCases = [DeleteSessionByDeviceIdUseCase, DeleteSessionsExceptCurrentUseCase];
const useCases = [
  ...commentsUseCases,
  ...authUseCases,
  ...blogsUseCases,
  ...postsUseCases,
  ...saUseCases,
  ...sessionsUseCases,
];
//USE CASES

const adapters = [
  BlogsRepository,
  BlogsQueryRepository,
  PostsRepository,
  PostsQueryRepository,
  EmailAdapter,
  EmailsManager,
  CommentsQueryRepository,
  LikesCommentsRepository,
  LikesPostsRepository,
  CommentsRepository,
  BannedUsersInBlogsRepository,
  BannedUsersInBlogQueryRepository,
  UsersRepo,
  SessionsRepo,
  RefreshTokenBlackListRepo,
  UsersQueryRepo,
];

const constraints = [
  IsBlogExistConstraint,
  IsEmailOrLoginUniqueConstraint,
  IsConfirmationCodeValidConstraint,
  CheckIsEmailConfirmedConstraint,
];

const services = [BlogsService, PostsService, CommentsService, SessionsService, UsersService, AuthService];

const authStrategies = [LocalStrategy, JwtStrategy, BasicStrategy];

export const typeOrmOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'snuffleupagus.db.elephantsql.com',
  port: 5432,
  username: 'fqidihfj',
  password: 'GsfjixstNork6WFqSctdeNAXCyLL4mAC',
  database: 'fqidihfj',
  autoLoadEntities: true,
  synchronize: true,
};
export const _typeOrmOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '02121998',
  database: 'Blogs',
  autoLoadEntities: true,
  synchronize: true,
};

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([User, UserEmailConfirmation, UserBanInfo, Session, RefreshTokenBL]),
    TypeOrmModule.forRoot(typeOrmOptions),
    MongooseModule.forRoot(process.env.MONGO_URI),
    MongooseModule.forFeature([
      { name: _User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: LikePost.name, schema: LikePostSchema },
      { name: LikeComment.name, schema: LikeCommentSchema },
      { name: BannedUserInBlog.name, schema: BannedUserInBlogSchema },
    ]),
    ThrottlerModule.forRoot({ ttl: 60, limit: 60 }),
    PassportModule,
    JwtModule.register({ secret: jwtConstants.secret, signOptions: { expiresIn: process.env.ACCESS_TOKEN_TIME } }),
  ],
  controllers: [
    AuthController,
    BlogsController,
    PostsController,
    TestingController,
    CommentsController,
    SessionsController,
    BloggerController,
    SuperAdminController,
  ],
  providers: [
    { provide: UsersRepository, useClass: UsersRepository },
    ...useCases,
    ...constraints,
    ...adapters,
    ...services,
    ViewModelMapper,
    QueryNormalizer,
    ...authStrategies,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
