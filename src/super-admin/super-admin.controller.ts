import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id-pipe';
import { Types } from 'mongoose';
import { CommandBus } from '@nestjs/cqrs';
import { BindBlogWithUserCommand } from './use-cases/bind-blog-with-user.use-case';
import { PaginatorResponseType } from '../common/paginator-response-type';
import { BlogForSAViewModel } from '../blogs/models/BlogViewModel';
import { QueryBlogModel } from '../blogs/models/QueryBlogModel';
import { QueryNormalizer } from '../common/query-normalizer';
import { ViewModelMapper } from '../common/view-model-mapper';
import { BlogsQueryRepository } from '../blogs/blogs.query.repository';
import { CreateUserModel } from '../users/models/CreateUserModel';
import { UserViewModel } from '../users/models/UserViewModel';
import { RegistrationCommand } from '../auth/application/use-cases/registration-use-case';
import { DeleteUserCommand } from './use-cases/delete-user.use-case';
import { QueryUserModel } from '../users/models/QueryUserModel';
import { BanUserModel } from './models/BanUserModel';
import { BanUserCommand } from './use-cases/ban-user.use-case';
import { BanBlogInputModel } from './models/BanBlogInputModel';
import { BanBlogCommand } from './use-cases/ban-blog.use-case';
import { UsersQueryRepo } from '../users/users.query.repo';
import { ParseNumberPipe } from '../common/pipes/parse-number-pipe';

@UseGuards(BasicAuthGuard)
@Controller('sa')
export class SuperAdminController {
  constructor(
    private commandBus: CommandBus,
    private queryNormalizer: QueryNormalizer,
    private viewModelConverter: ViewModelMapper,
    private blogsQueryRepository: BlogsQueryRepository,
    private usersQueryRepo: UsersQueryRepo,
  ) {}

  // =====blogs========
  @Put('/blogs/:blogId/ban')
  @HttpCode(204)
  async banBlog(
    @Param('blogId', ParseObjectIdPipe) blogId: Types.ObjectId,
    @Body() banBlogModel: BanBlogInputModel,
  ): Promise<void> {
    await this.commandBus.execute<BanBlogCommand, void>(new BanBlogCommand(blogId, banBlogModel.isBanned));
  }

  @Put('/blogs/:blogId/bind-with-user/:userId')
  @HttpCode(204)
  async bindBlogWithUser(
    @Param('blogId', ParseObjectIdPipe) blogId: Types.ObjectId,
    @Param('userId', ParseObjectIdPipe) userId: Types.ObjectId,
  ): Promise<void> {
    await this.commandBus.execute<BindBlogWithUserCommand, void>(new BindBlogWithUserCommand(blogId, userId));
  }

  @Get('/blogs')
  async findBlogs(@Query() query: QueryBlogModel): Promise<PaginatorResponseType<BlogForSAViewModel[]>> {
    const normalizeBlogsQuery = this.queryNormalizer.normalizeBlogsQuery(query);
    const foundBlogsWithPagination = await this.blogsQueryRepository.findBlogs(normalizeBlogsQuery, {
      isAdminRequesting: true,
    });
    return {
      ...foundBlogsWithPagination,
      items: foundBlogsWithPagination.items.map(this.viewModelConverter.getBlogForSAViewModel),
    };
  }

  // =====blogs========

  // =======users=========

  @Put('/users/:id/ban')
  @HttpCode(204)
  async banUser(@Param('id', ParseIntPipe) id: number, @Body() banUserModel: BanUserModel): Promise<void> {
    await this.commandBus.execute<BanUserCommand, void>(new BanUserCommand(id, banUserModel));
  }

  @Get('/users')
  async findUsers(@Query() query: QueryUserModel): Promise<PaginatorResponseType<UserViewModel[]>> {
    const normalizedUsersQuery = this.queryNormalizer.normalizeUsersQuery(query);
    return this.usersQueryRepo.findUsers(normalizedUsersQuery);
  }

  @Post('/users')
  async createUserByAdmin(@Body() createUserModel: CreateUserModel): Promise<UserViewModel> {
    const newUser = await this.commandBus.execute(new RegistrationCommand(createUserModel, true));
    return this.viewModelConverter.getUserViewModel(newUser);
  }

  @Delete('users/:id')
  @HttpCode(204)
  async deleteUser(@Param('id', ParseNumberPipe) id: number): Promise<void> {
    await this.commandBus.execute<DeleteUserCommand, void>(new DeleteUserCommand(id));
  }

  // =======users=========
}
