import { UserViewModel } from '../users/models/UserViewModel';
import { BlogForSAViewModel, BlogViewModel } from '../blogs/models/BlogViewModel';
import { PostViewModel } from '../blogs/posts/models/PostViewModel';
import { CommentForBloggerViewModel, CommentViewModel } from '../blogs/posts/comments/models/CommentViewModel';
import { likesMapper } from './utils/likes-mapper';
import { Injectable } from '@nestjs/common';
import { PostsService } from '../blogs/posts/posts.service';
import { LikesInfoViewModel, NewestLikes } from './like.types';
import { SessionViewModel } from '../security/models/SessionViewModel';
import { BannedUserInBlogViewModel } from '../blogs/models/BannedUserInBlogViewModel';
import { User } from '../users/entities/user.entity';
import { Session } from '../security/entities/session.entity';
import { Blog } from '../blogs/entities/blog.entity';
import { BannedUserInBlog } from '../blogs/entities/banned-user-in-blog.entity';
import { Post } from '../blogs/posts/entities/post.entity';
import { LikePost } from '../blogs/posts/likes/LikePost.entity';
import { LikesPostsRepo } from '../blogs/posts/likes/likesPosts.repo';
import { PostsRepo } from '../blogs/posts/posts.repo';
import { Comment } from '../blogs/posts/comments/entities/comment.entity';
import { LikesCommentsRepo } from '../blogs/posts/comments/likes/likes-comments-repo';
import { LikeComment } from '../blogs/posts/comments/likes/likeComment.entity';
import { QuizQuestionViewModel } from '../super-admin/models/quiz/QuizQuestionViewModel';
import { QuizQuestion } from '../super-admin/quiz/QuizQuestion.entity';
import { Game } from '../quiz/entities/game.entity';
import { AnswerViewModel, GamePairViewModel, GamePlayerProgressViewModel } from '../quiz/models/GameModels';
import { Answer } from '../quiz/entities/player.entity';

@Injectable()
export class ViewModelMapper {
  constructor(
    private postsRepo: PostsRepo,
    private postsService: PostsService,
    private likesPostsRepo: LikesPostsRepo,
    private likesCommentsRepo: LikesCommentsRepo,
  ) {}

  getUserViewModel(user: User): UserViewModel {
    return {
      id: user.id.toString(),
      email: user.email,
      login: user.login,
      createdAt: user.createdAt.toISOString(),
      banInfo: {
        isBanned: user.banInfo.isBanned,
        banDate: user.banInfo.banDate?.toISOString() || null,
        banReason: user.banInfo.banReason,
      },
    };
  }

  getBlogForSAViewModel(blog: Blog): BlogForSAViewModel {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      createdAt: blog.createdAt.toISOString(),
      websiteUrl: blog.websiteUrl,
      blogOwnerInfo: { userId: blog.userId.toString(), userLogin: blog.user.login },
      banInfo: { isBanned: blog.banInfo.isBanned, banDate: blog.banInfo.banDate?.toISOString() || null },
      isMembership: blog.isMembership,
    };
  }

  getBlogViewModel(blog: Blog): BlogViewModel {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      createdAt: blog.createdAt.toISOString(),
      websiteUrl: blog.websiteUrl,
      isMembership: blog.isMembership,
    };
  }

  async getPostViewModel(post: Post, userIdForLikeStatus: number | null): Promise<PostViewModel> {
    let like: LikePost | null = null;
    if (userIdForLikeStatus) like = await this.likesPostsRepo.findLikeOfSpecifiedUser(userIdForLikeStatus, post.id);
    const myStatus = like?.status || 'None';

    const { likesCount, dislikesCount } = likesMapper(post.likes);

    const getNewestLikes = (allLikesForPost: LikePost[]): NewestLikes[] => {
      const newestLikes: NewestLikes[] = [];
      for (const like of allLikesForPost) {
        if (newestLikes.length === 3) return newestLikes;
        if (like.status === 'Like') {
          newestLikes.push({
            addedAt: like.addedAt,
            userId: like.userId.toString(),
            login: like.user.login,
          });
        }
      }
      return newestLikes;
    };

    return {
      id: post.id.toString(),
      shortDescription: post.shortDescription,
      title: post.title,
      blogName: post.blog.name,
      createdAt: post.createdAt.toISOString(),
      blogId: post.blogId.toString(),
      content: post.content,
      extendedLikesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
        newestLikes: getNewestLikes(post.likes),
      },
    };
  }

  async getPostsViewModels(posts: Post[], userId: number | null): Promise<Awaited<PostViewModel>[]> {
    return await Promise.all(posts.map((post) => this.getPostViewModel(post, userId)));
  }

  private async getCommentLikesInfo(comment: Comment, userId: number): Promise<LikesInfoViewModel> {
    let like: LikeComment | null = null;
    if (userId) like = await this.likesCommentsRepo.findLikeOfSpecifiedUser(comment.id, userId);
    const myStatus = like?.status || 'None';

    const { likesCount, dislikesCount } = likesMapper(comment.likes);

    const likesInfo = { likesCount, dislikesCount, myStatus };
    return likesInfo;
  }

  async getCommentViewModel(comment: Comment, userIdForLikeStatus: number | null): Promise<CommentViewModel> {
    const likesInfo = await this.getCommentLikesInfo(comment, userIdForLikeStatus);
    return {
      id: comment.id.toString(),
      createdAt: comment.createdAt.toISOString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId.toString(),
        userLogin: comment.user.login,
      },
      likesInfo,
    };
  }

  async getCommentsViewModels(comments: Comment[], userId: number | null): Promise<Awaited<CommentViewModel>[]> {
    return await Promise.all(comments.map((comment) => this.getCommentViewModel(comment, userId)));
  }

  async getCommentForBloggerModel(comment: Comment, userId: number): Promise<CommentForBloggerViewModel> {
    const likesInfo = await this.getCommentLikesInfo(comment, userId);
    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: { userId: comment.userId.toString(), userLogin: comment.user.login },
      createdAt: comment.createdAt.toISOString(),
      likesInfo,
      postInfo: {
        id: comment.post.id.toString(),
        title: comment.post.title,
        blogName: comment.post.blog.name,
        blogId: comment.post.blogId.toString(),
      },
    };
  }

  async getCommentsForBloggerViewModels(
    comments: Comment[],
    bloggerId: number,
  ): Promise<Awaited<CommentForBloggerViewModel>[]> {
    return await Promise.all(comments.map((comment) => this.getCommentForBloggerModel(comment, bloggerId)));
  }

  getSessionViewModel(session: Session): SessionViewModel {
    return {
      ip: session.ip,
      deviceId: session.deviceId,
      lastActiveDate: session.issuedAt.toISOString(),
      title: session.deviceName,
    };
  }

  getBannedUserInBlogViewModel(bannedUserInBlog: BannedUserInBlog): BannedUserInBlogViewModel {
    return {
      id: bannedUserInBlog.userId.toString(),
      login: bannedUserInBlog.login,
      banInfo: {
        isBanned: true,
        banReason: bannedUserInBlog.banReason,
        banDate: bannedUserInBlog.createdAt.toISOString(),
      },
    };
  }

  getQuizQuestionViewModel(question: QuizQuestion): QuizQuestionViewModel {
    return {
      id: question.id.toString(),
      body: question.body,
      correctAnswers: question.correctAnswers,
      published: question.published,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt ? question.updatedAt.toISOString() : null,
    };
  }

  getGameViewModel(game: Game): GamePairViewModel {
    const firstPlayerProgress: GamePlayerProgressViewModel = {
      answers: game.players[0].answers.map(this.getAnswerViewModel),
      score: game.players[0].score,
      player: { id: game.players[0].userId.toString(), login: game.players[0].user.login },
    };
    const secondPlayerProgress: GamePlayerProgressViewModel =
      game.players.length === 2
        ? {
            answers: game.players[1].answers.map(this.getAnswerViewModel),
            score: game.players[1].score,
            player: { id: game.players[1].userId.toString(), login: game.players[1].user.login },
          }
        : null;
    return {
      id: game.id.toString(),
      firstPlayerProgress,
      secondPlayerProgress,
      status: game.status,
      startGameDate: game.startGameDate ? game.startGameDate.toISOString() : null,
      pairCreatedDate: game.pairCreatedDate.toISOString(),
      finishGameDate: game.finishGameDate ? game.finishGameDate.toISOString() : null,
      questions: game.questions ? game.questions.map((q) => ({ ...q, id: q.id.toString() })) : null,
    };
  }
  getAnswerViewModel(answer: Answer): AnswerViewModel {
    return {
      answerStatus: answer.answerStatus,
      addedAt: answer.addedAt.toISOString(),
      questionId: answer.questionId.toString(),
    };
  }
}
