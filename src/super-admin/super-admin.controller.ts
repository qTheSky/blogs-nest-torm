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
import { PaginatorResponseType } from '../common/paginator-response-type';
import { QueryBlogModel } from '../blogs/models/QueryBlogModel';
import { QueryNormalizer } from '../common/query-normalizer';
import { ViewModelMapper } from '../common/view-model-mapper';
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
import { QueryQuizModel } from './models/quiz/QueryQuizModel';

@UseGuards(BasicAuthGuard)
@Controller('sa')
export class SuperAdminController {
  constructor(
    private commandBus: CommandBus,
    private queryNormalizer: QueryNormalizer,
    private viewModelConverter: ViewModelMapper,
    private usersQueryRepo: UsersQueryRepo,
    private blogsQueryRepo: BlogsQueryRepo,
    private quizQuestionsQueryRepo: QuizQuestionsQueryRepo,
  ) {}

  // =====blogs========
  @Put('/blogs/:blogId/ban')
  @HttpCode(204)
  async banBlog(
    @Param('blogId', ParseNumberPipe) blogId: number,
    @Body() banBlogModel: BanBlogInputModel,
  ): Promise<void> {
    await this.commandBus.execute<BanBlogCommand, void>(new BanBlogCommand(blogId, banBlogModel.isBanned));
  }

  @Get('blogs')
  async findBlogs(@Query() query: QueryBlogModel): Promise<PaginatorResponseType<BlogForSAViewModel[]>> {
    const normalizeBlogsQuery = this.queryNormalizer.normalizeBlogsQuery(query);
    const foundBlogsWithPagination = await this.blogsQueryRepo.findBlogs(normalizeBlogsQuery, {
      isAdminRequesting: true,
    });
    return {
      ...foundBlogsWithPagination,
      items: foundBlogsWithPagination.items.map(this.viewModelConverter.getBlogForSAViewModel),
    };
  }

  // =====blogs========

  // =======quiz======
  @Get('quiz/questions')
  async findQuestions(@Query() query: QueryQuizModel): Promise<PaginatorResponseType<QuizQuestionViewModel[]>> {
    const normalizedQuizQuestionsQuery = this.queryNormalizer.normalizeQuizQuestionsQuery(query);
    return this.quizQuestionsQueryRepo.findQuestions(normalizedQuizQuestionsQuery);
  }

  @Post('quiz/questions')
  async createQuestion(@Body() createQuizQuestionModel: CreateQuizQuestionModel): Promise<QuizQuestionViewModel> {
    const newQuestion = await this.commandBus.execute<CreateQuestionCommand, QuizQuestion>(
      new CreateQuestionCommand(createQuizQuestionModel),
    );
    return this.viewModelConverter.getQuizQuestionViewModel(newQuestion);
  }

  @Delete('quiz/questions/:questionId')
  @HttpCode(204)
  async deleteQuestion(@Param('questionId', ParseNumberPipe) questionId: number): Promise<void> {
    await this.commandBus.execute(new DeleteQuestionCommand(questionId));
  }

  @Put('quiz/questions/:questionId')
  @HttpCode(204)
  async updateQuestion(
    @Param('questionId', ParseNumberPipe) questionId: number,
    @Body() dto: UpdateQuizQuestionModel,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateQuestionCommand(questionId, dto));
  }

  @Put('quiz/questions/:questionId/publish')
  @HttpCode(204)
  async publishQuestion(
    @Param('questionId', ParseNumberPipe) questionId: number,
    @Body() dto: PublishQuestionModel,
  ): Promise<void> {
    await this.commandBus.execute(new PublishQuestionCommand(questionId, dto));
  }

  // =======quiz======

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
