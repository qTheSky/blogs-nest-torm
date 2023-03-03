import { QueryUserModel } from '../users/models/QueryUserModel';
import { QueryBlogModel } from '../blogs/models/QueryBlogModel';
import { QueryPostModel } from '../blogs/posts/models/QueryPostModel';
import { QueryCommentModel } from '../blogs/posts/comments/models/QueryCommentModel';
import { BannedUserInBlogQueryModel } from '../blogs/models/BannedUserInBlogQueryModel';
import { QueryQuizModel } from '../super-admin/models/quiz/QueryQuizModel';
import { GameQueryModel } from '../quiz/models/GameQueryModel';

export class QueryNormalizer {
  normalizeUsersQuery(query: QueryUserModel): NormalizedUsersQuery {
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
      searchEmailTerm: query.searchEmailTerm || '',
      searchLoginTerm: query.searchLoginTerm || '',
      sortBy: query.sortBy || 'createdAt',
      sortDirection: query.sortDirection || 'desc',
      banStatus: query.banStatus || 'all',
    };
  }

  normalizeBlogsQuery(query: QueryBlogModel): NormalizedBlogsQuery {
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
      searchNameTerm: query.searchNameTerm || '',
      sortBy: query.sortBy || 'createdAt',
      sortDirection: query.sortDirection || 'desc',
    };
  }

  normalizePostsQuery(query: QueryPostModel): NormalizedPostsQuery {
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
      sortBy: query.sortBy || 'createdAt',
      sortDirection: query.sortDirection || 'desc',
    };
  }

  normalizeCommentsQuery(query: QueryCommentModel): NormalizedCommentsQuery {
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
      sortBy: query.sortBy || 'createdAt',
      sortDirection: query.sortDirection || 'desc',
    };
  }

  normalizeBannedUsersInBlogQuery(query: BannedUserInBlogQueryModel): NormalizedBannedUsersInBlogQuery {
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
      sortBy: query.sortBy || 'createdAt',
      sortDirection: query.sortDirection || 'desc',
      searchLoginTerm: query.searchLoginTerm || '',
    };
  }

  normalizeQuizQuestionsQuery(query: QueryQuizModel): NormalizedQuizQuestionsQuery {
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
      bodySearchTerm: query.bodySearchTerm || '',
      sortBy: query.sortBy || 'createdAt',
      sortDirection: query.sortDirection || 'desc',
      publishedStatus: query.publishedStatus || 'all',
    };
  }
  normalizeQuizGamesQuery(query: GameQueryModel): NormalizedQuizGamesQuery {
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
      sortBy: query.sortBy || 'pairCreatedDate',
      sortDirection: query.sortDirection || 'desc',
    };
  }
}

export type NormalizedUsersQuery = {
  pageNumber: number;
  pageSize: number;
  sortBy: string; // createdAt
  sortDirection: string;
  searchLoginTerm: string;
  searchEmailTerm: string;
  banStatus: string; //'all' | 'banned' | 'notBanned';
};

export type NormalizedBlogsQuery = {
  searchNameTerm: string;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
};

export type NormalizedPostsQuery = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
};

export type NormalizedCommentsQuery = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
};
export type NormalizedBannedUsersInBlogQuery = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
  searchLoginTerm: string;
};
export type NormalizedQuizQuestionsQuery = {
  bodySearchTerm: string;
  publishedStatus: string; // all published notPublished
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
};
export type NormalizedQuizGamesQuery = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
};
