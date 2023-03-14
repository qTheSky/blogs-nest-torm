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
import { CommandBus } from '@nestjs/cqrs';
import { PaginatorResponseType } from '../shared/types/paginator-response-type';
import { BlogsQuery } from '../blogs/models/BlogsQuery';
import { ViewModelMapper } from '../shared/view-model-mapper';
import { CreateUserModel } from '../users/models/CreateUserModel';
import { UserViewModel } from '../users/models/UserViewModel';
import { RegistrationCommand } from '../auth/application/use-cases/registration-use-case';
import { DeleteUserCommand } from './use-cases/delete-user.use-case';
import { UsersQuery } from '../users/models/QueryUserModel';
import { BanUserModel } from './models/BanUserModel';
import { BanUserCommand } from './use-cases/ban-user.use-case';
import { BanBlogInputModel } from './models/BanBlogInputModel';
import { BanBlogCommand } from './use-cases/ban-blog.use-case';
import { UsersQueryRepo } from '../users/users.query.repo';
import { ParseNumberPipe } from '../shared/pipes/parse-number-pipe';
import { BlogForSAViewModel } from '../blogs/models/BlogViewModel';
import { BlogsQueryRepo } from '../blogs/blogs.query.repo';
import { QuizQuestionViewModel } from './models/quiz/QuizQuestionViewModel';
import { CreateQuizQuestionModel } from './models/quiz/CreateQuizQuestionModel';
import { CreateQuestionCommand } from './use-cases/quiz/create-question.use-case';
import { QuizQuestion } from './quiz/QuizQuestion.entity';
import { UpdateQuestionCommand } from './use-cases/quiz/update-question.use-case';
import { UpdateQuizQuestionModel } from './models/quiz/UpdateQuizQuestionModel';
import { PublishQuestionModel } from './models/quiz/PublishQuestionModel';
import { PublishQuestionCommand } from './use-cases/quiz/publish-question.use-case';
import { DeleteQuestionCommand } from './use-cases/quiz/delete-question.use-case';
import { QuizQuestionsQueryRepo } from './quiz.questions.query.repo';
import { QuizQuestionsQuery } from './models/quiz/QueryQuizModel';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiExcludeEndpoint,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { getPaginatorExample } from '../shared/swagger/schema/common/get-paginator-example';
import { questionExample } from '../shared/swagger/schema/quiz/question-example';
import { unauthorizedSwaggerMessage } from '../shared/swagger/constants/unauthorized-swagger-message';
import { BadRequestApiExample } from '../shared/swagger/schema/bad-request-schema-example';
import { badRequestSwaggerMessage } from '../shared/swagger/constants/bad-request-swagger-message';
import { blogForSuperAdminExample } from '../shared/swagger/schema/blogs/blog-for-super-admin-example';
import { userExample } from '../shared/swagger/schema/users/user-example';

@Controller('sa')
@ApiTags('Super admin')
@ApiBasicAuth()
@UseGuards(BasicAuthGuard)
export class SuperAdminController {
  constructor(
    private commandBus: CommandBus,
    private viewModelConverter: ViewModelMapper,
    private usersQueryRepo: UsersQueryRepo,
    private blogsQueryRepo: BlogsQueryRepo,
    private quizQuestionsQueryRepo: QuizQuestionsQueryRepo,
  ) {}

  // =======quiz======
  @Get('quiz/questions')
  @ApiOperation({ summary: 'Returns all questions with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: { example: getPaginatorExample<QuizQuestionViewModel>(questionExample) },
  })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  async findQuestions(@Query() query: QuizQuestionsQuery): Promise<PaginatorResponseType<QuizQuestionViewModel[]>> {
    return this.quizQuestionsQueryRepo.findQuestions(query);
  }

  @Post('quiz/questions')
  @ApiOperation({ summary: 'Create question' })
  @ApiResponse({ status: 201, description: 'Created', schema: { example: questionExample } })
  @ApiBadRequestResponse({ description: badRequestSwaggerMessage, schema: BadRequestApiExample })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  async createQuestion(@Body() createQuizQuestionModel: CreateQuizQuestionModel): Promise<QuizQuestionViewModel> {
    const newQuestion = await this.commandBus.execute<CreateQuestionCommand, QuizQuestion>(
      new CreateQuestionCommand(createQuizQuestionModel),
    );
    return this.viewModelConverter.getQuizQuestionViewModel(newQuestion);
  }

  @Delete('quiz/questions/:questionId')
  @ApiOperation({ summary: 'Delete question' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiNotFoundResponse({ description: 'Not found' })
  @HttpCode(204)
  async deleteQuestion(@Param('questionId', ParseNumberPipe) questionId: number): Promise<void> {
    await this.commandBus.execute(new DeleteQuestionCommand(questionId));
  }

  @Put('quiz/questions/:questionId')
  @ApiOperation({ summary: 'Update question' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiBadRequestResponse({ description: badRequestSwaggerMessage, schema: BadRequestApiExample })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiNotFoundResponse({ description: 'Not found' })
  @HttpCode(204)
  async updateQuestion(
    @Param('questionId', ParseNumberPipe) questionId: number,
    @Body() dto: UpdateQuizQuestionModel,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateQuestionCommand(questionId, dto));
  }

  @Put('quiz/questions/:questionId/publish')
  @ApiOperation({ summary: 'Update question' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiBadRequestResponse({ description: badRequestSwaggerMessage, schema: BadRequestApiExample })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @HttpCode(204)
  async publishQuestion(
    @Param('questionId', ParseNumberPipe) questionId: number,
    @Body() dto: PublishQuestionModel,
  ): Promise<void> {
    await this.commandBus.execute(new PublishQuestionCommand(questionId, dto));
  }

  // =======quiz======

  // =====blogs========
  @Put('/blogs/:blogId/ban')
  @ApiOperation({ summary: 'Ban/unban blog' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiBadRequestResponse({ description: badRequestSwaggerMessage, schema: BadRequestApiExample })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @HttpCode(204)
  async banBlog(
    @Param('blogId', ParseNumberPipe) blogId: number,
    @Body() banBlogModel: BanBlogInputModel,
  ): Promise<void> {
    await this.commandBus.execute<BanBlogCommand, void>(new BanBlogCommand(blogId, banBlogModel.isBanned));
  }

  @Get('blogs')
  @ApiOperation({ summary: 'Returns blogs with paging' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: { example: getPaginatorExample<BlogForSAViewModel>(blogForSuperAdminExample) },
  })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  async findBlogs(@Query() query: BlogsQuery): Promise<PaginatorResponseType<BlogForSAViewModel[]>> {
    const foundBlogsWithPagination = await this.blogsQueryRepo.findBlogs(query, {
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
  @ApiOperation({ summary: 'Ban/unban user (banned user cant log in, and likes by banned users don`t return)' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiBadRequestResponse({ description: badRequestSwaggerMessage, schema: BadRequestApiExample })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @HttpCode(204)
  async banUser(@Param('id', ParseIntPipe) id: number, @Body() banUserModel: BanUserModel): Promise<void> {
    await this.commandBus.execute<BanUserCommand, void>(new BanUserCommand(id, banUserModel));
  }

  @Get('/users')
  @ApiOperation({ summary: 'Returns all users with paging' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: { example: getPaginatorExample<UserViewModel>(userExample) },
  })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  async findUsers(@Query() query: UsersQuery): Promise<PaginatorResponseType<UserViewModel[]>> {
    return this.usersQueryRepo.findUsers(query);
  }

  @Post('/users')
  @ApiOperation({ summary: 'Add new user to the system. User creates with verified email' })
  @ApiResponse({ status: 201, description: 'Returns the newly created user', schema: { example: userExample } })
  @ApiBadRequestResponse({ description: badRequestSwaggerMessage, schema: BadRequestApiExample })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  async createUserByAdmin(@Body() createUserModel: CreateUserModel): Promise<UserViewModel> {
    const newUser = await this.commandBus.execute(new RegistrationCommand(createUserModel, true));
    return this.viewModelConverter.getUserViewModel(newUser);
  }

  @Delete('users/:id')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Delete specified user by id' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiNotFoundResponse({ description: 'If specified user is not exists' })
  @HttpCode(204)
  async deleteUser(@Param('id', ParseNumberPipe) id: number): Promise<void> {
    await this.commandBus.execute<DeleteUserCommand, void>(new DeleteUserCommand(id));
  }

  // =======users=========
}
