import { User } from '../users/user.schema';
import { UserViewModel } from '../users/models/UserViewModel';
import { Blog } from '../blogs/blog.schema';
import { BlogForSAViewModel, BlogViewModel } from '../blogs/models/BlogViewModel';
import { PostViewModel } from '../posts/models/PostViewModel';
import { Post } from '../posts/post.schema';
import { Comment } from '../posts/comments/comment.schema';
import { CommentForBloggerViewModel, CommentViewModel } from '../posts/comments/models/CommentViewModel';
import { Types } from 'mongoose';
import { LikeComment } from '../posts/comments/likes/likeComment.schema';
import { CommentsService } from '../posts/comments/comments.service';
import { likesMapper } from './utils/likes-mapper';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LikePost, LikePostDocument } from '../posts/likes/likePost.schema';
import { PostsService } from '../posts/posts.service';
import { LikesInfoViewModel, NewestLikes } from './like.types';
import { SessionViewModel } from '../security/models/SessionViewModel';
import { Session } from '../security/session.schema';
import { BannedUserInBlog } from '../blogs/banned-user-in-blog.schema';
import { BannedUserInBlogViewModel } from '../blogs/models/BannedUserInBlogViewModel';
import { PostsRepository } from '../posts/posts.repository';

@Injectable()
export class ViewModelMapper {
  constructor(
    private commentsService: CommentsService,
    private postsService: PostsService,
    private postsRepository: PostsRepository,
  ) {}

  getUserViewModel(user: User): UserViewModel {
    return {
      id: user._id,
      email: user.accountData.email,
      login: user.accountData.login,
      createdAt: user.accountData.createdAt.toISOString(),
      banInfo: {
        isBanned: user.banInfo.isBanned,
        banDate: user.banInfo.banDate?.toISOString() || null,
        banReason: user.banInfo.banReason,
      },
    };
  }

  getBlogForSAViewModel(blog: Blog): BlogForSAViewModel {
    return {
      id: blog._id,
      name: blog.name,
      description: blog.description,
      createdAt: blog.createdAt.toISOString(),
      websiteUrl: blog.websiteUrl,
      blogOwnerInfo: { userId: blog.userId, userLogin: blog.userLogin },
      banInfo: { isBanned: blog.banInfo.isBanned, banDate: blog.banInfo.banDate?.toISOString() || null },
      isMembership: false,
    };
  }

  getBlogViewModel(blog: Blog): BlogViewModel {
    return {
      id: blog._id,
      name: blog.name,
      description: blog.description,
      createdAt: blog.createdAt.toISOString(),
      websiteUrl: blog.websiteUrl,
      isMembership: false,
    };
  }

  async getPostViewModel(post: Post, userId: Types.ObjectId | null): Promise<PostViewModel> {
    let like: LikePostDocument | null = null;
    if (userId) like = await this.postsService.findLikeOfSpecifiedUser(userId, post._id);
    const myStatus = like?.status || 'None';

    const allLikesForPost = await this.postsService.findLikesForPost(post._id);
    const { likesCount, dislikesCount } = likesMapper(allLikesForPost);

    const getNewestLikes = (allLikesForPost: LikePost[]): NewestLikes[] => {
      const newestLikes: NewestLikes[] = [];
      for (let i = 0; i < allLikesForPost.length; i++) {
        if (newestLikes.length === 3) return newestLikes;
        if (allLikesForPost[i].status === 'Like') {
          newestLikes.push({
            addedAt: allLikesForPost[i].addedAt,
            userId: allLikesForPost[i].userId,
            login: allLikesForPost[i].userLogin,
          });
        }
      }
      return newestLikes;
    };

    return {
      id: post._id,
      shortDescription: post.shortDescription,
      title: post.title,
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      blogId: post.blogId,
      content: post.content,
      extendedLikesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
        newestLikes: getNewestLikes(allLikesForPost),
      },
    };
  }

  async getPostsViewModels(posts: Post[], userId: Types.ObjectId | null): Promise<Awaited<PostViewModel>[]> {
    return await Promise.all(posts.map((post) => this.getPostViewModel(post, userId)));
  }

  private async getCommentLikesInfo(commentId: Types.ObjectId, userId: Types.ObjectId): Promise<LikesInfoViewModel> {
    let like: LikeComment | null = null;
    if (userId) like = await this.commentsService.findLikeOfSpecifiedUser(commentId, userId);
    const myStatus = like?.status || 'None';

    const allLikesForComment = await this.commentsService.findLikesForComment(commentId);
    const { likesCount, dislikesCount } = likesMapper(allLikesForComment);

    const likesInfo = { likesCount, dislikesCount, myStatus };
    return likesInfo;
  }

  async getCommentViewModel(comment: Comment, userId: Types.ObjectId | null): Promise<CommentViewModel> {
    const likesInfo = await this.getCommentLikesInfo(comment._id, userId);
    return {
      id: comment._id,
      createdAt: comment.createdAt.toISOString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      likesInfo,
    };
  }

  async getCommentsViewModels(
    comments: Comment[],
    userId: Types.ObjectId | null,
  ): Promise<Awaited<CommentViewModel>[]> {
    return await Promise.all(comments.map((comment) => this.getCommentViewModel(comment, userId)));
  }

  async getCommentForBloggerModel(comment: Comment, userId: Types.ObjectId): Promise<CommentForBloggerViewModel> {
    const post = await this.postsRepository.findById(comment.postId);
    if (!post) throw new NotFoundException();
    const likesInfo = await this.getCommentLikesInfo(comment._id, userId);

    return {
      id: comment._id,
      content: comment.content,
      commentatorInfo: { userId: comment.userId, userLogin: comment.userLogin },
      createdAt: comment.createdAt.toISOString(),
      likesInfo,
      postInfo: {
        id: post._id,
        title: post.title,
        blogName: post.blogName,
        blogId: post.blogId,
      },
    };
  }

  async getCommentsForBloggerViewModels(
    comments: Comment[],
    bloggerId: Types.ObjectId,
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
      id: bannedUserInBlog.userId,
      login: bannedUserInBlog.login,
      banInfo: {
        isBanned: true,
        banReason: bannedUserInBlog.banReason,
        banDate: bannedUserInBlog.banDate.toISOString(),
      },
    };
  }
}
