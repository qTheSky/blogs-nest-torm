import { Module } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { ViewModelMapper } from './common/view-model-mapper';
import { QueryNormalizer } from './common/query-normalizer';
import { BlogsController } from './blogs/blogs.controller';
import { PostsController } from './blogs/posts/posts.controller';
import { TestingController } from './testing/testing.controller';
import { PostsService } from './blogs/posts/posts.service';
import { IsEmailOrLoginUniqueConstraint } from './users/models/CreateUserModel';
import { EmailsManager } from './common/managers/emails-manager';
import { EmailAdapter } from './common/adapters/email.adapter';
import { AuthController } from './auth/auth.controller';
import { IsConfirmationCodeValidConstraint } from './auth/models/ConfirmationCodeModel';
import { CheckIsEmailConfirmedConstraint } from './auth/models/EmailResendModel';
import { JwtModule } from '@nestjs/jwt';
import { CommentsService } from './blogs/posts/comments/comments.service';
import { CommentsController } from './blogs/posts/comments/comments.controller';
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
import { CreatePostUseCase } from './blogs/posts/use-cases/create-post.use-case';
import { DeletePostUseCase } from './blogs/posts/use-cases/delete-post.use-case';
import { UpdatePostUseCase } from './blogs/posts/use-cases/update-post.use-case';
import { SuperAdminController } from './super-admin/super-admin.controller';
import { BindBlogWithUserUseCase } from './super-admin/use-cases/bind-blog-with-user.use-case';
import { DeleteUserUseCase } from './super-admin/use-cases/delete-user.use-case';
import { BanUserUseCase } from './super-admin/use-cases/ban-user.use-case';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog.use-case';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog.use-case';
import { LoginUseCase } from './auth/application/use-cases/login.use-case';
import { GetAuthUserDataUseCase } from './auth/application/use-cases/get-auth-user-data.use-case';
import { BanUserForBlogUseCase } from './blogs/application/use-cases/ban-user-for-blog.use-case';
import { CreateCommentUseCase } from './blogs/posts/comments/use-cases/create-comment.use-case';
import { UpdateCommentUseCase } from './blogs/posts/comments/use-cases/update-comment.use-case';
import { BanBlogUseCase } from './super-admin/use-cases/ban-blog.use-case';
import { UpdateEmailConfirmationCodeUseCase } from './auth/application/use-cases/update-email-confirmation-code.use-case';
import { DeleteCommentUseCase } from './blogs/posts/comments/use-cases/delete-comment.use-case';
import { PutLikeToCommentUseCase } from './blogs/posts/comments/use-cases/put-like-to-comment.use-case';
import { PutLikeToPostUseCase } from './blogs/posts/use-cases/put-like-to-post.use-case';
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
import { BlogsRepo } from './blogs/blogs.repo';
import { Blog } from './blogs/entities/blog.entity';
import { BlogBanInfo } from './blogs/entities/blog-ban-info.entity';
import { Post } from './blogs/posts/entities/post.entity';
import { PostsRepo } from './blogs/posts/posts.repo';
import { BlogsQueryRepo } from './blogs/blogs.query.repo';
import { BannedUserInBlog } from './blogs/entities/banned-user-in-blog.entity';
import { BannedUsersInBlogRepo } from './blogs/banned-users-in-blog.repo';
import { BannedUsersInBlogQueryRepo } from './blogs/banned-users-in-blog.query.repo';
import { LikesPostsRepo } from './blogs/posts/likes/likesPosts.repo';
import { LikePost } from './blogs/posts/likes/LikePost.entity';
import { PostsQueryRepo } from './blogs/posts/posts.query.repo';
import { CommentsRepo } from './blogs/posts/comments/comments,repo';
import { LikesCommentsRepo } from './blogs/posts/comments/likes/likes-comments-repo';
import { Comment } from './blogs/posts/comments/entities/comment.entity';
import { LikeComment } from './blogs/posts/comments/likes/likeComment.entity';
import { CommentsQueryRepo } from './blogs/posts/comments/comments.query.repo';

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
  EmailAdapter,
  EmailsManager,
  UsersRepo,
  SessionsRepo,
  RefreshTokenBlackListRepo,
  UsersQueryRepo,
  BlogsRepo,
  PostsRepo,
  BlogsQueryRepo,
  BannedUsersInBlogRepo,
  BannedUsersInBlogQueryRepo,
  LikesPostsRepo,
  PostsQueryRepo,
  CommentsRepo,
  LikesCommentsRepo,
  CommentsQueryRepo,
];

const constraints = [
  IsEmailOrLoginUniqueConstraint,
  IsConfirmationCodeValidConstraint,
  CheckIsEmailConfirmedConstraint,
];

const services = [BlogsService, PostsService, CommentsService, SessionsService, UsersService, AuthService];

const authStrategies = [LocalStrategy, JwtStrategy, BasicStrategy];
//CLOUD
//elephant
export const __typeOrmOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'snuffleupagus.db.elephantsql.com',
  port: 5432,
  username: 'fqidihfj',
  password: 'GsfjixstNork6WFqSctdeNAXCyLL4mAC',
  database: 'fqidihfj',
  autoLoadEntities: true,
  synchronize: true,
};
//elephant
//neon
export const typeOrmOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'ep-curly-unit-690125.eu-central-1.aws.neon.tech',
  port: 5432,
  username: 'qTheSky',
  password: 'uK2OTMdLmeV3',
  database: 'neondb',
  autoLoadEntities: true,
  synchronize: true,
  ssl: true,
};
//neon
//CLOUD
//LOCAL
export const _typeOrmOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '02121998',
  database: 'Blogs',
  autoLoadEntities: true,
  synchronize: true,
  // logging: true,
};
//LOCAL

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([
      User,
      UserEmailConfirmation,
      UserBanInfo,
      Session,
      RefreshTokenBL,
      Blog,
      BlogBanInfo,
      Post,
      BannedUserInBlog,
      LikePost,
      Comment,
      LikeComment,
    ]),
    TypeOrmModule.forRoot(typeOrmOptions),
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
