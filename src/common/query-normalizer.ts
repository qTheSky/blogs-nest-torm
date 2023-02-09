import { QueryUserModel } from '../users/models/QueryUserModel';
import { QueryBlogModel } from '../blogs/models/QueryBlogModel';
import { QueryPostModel } from '../posts/models/QueryPostModel';
import { QueryCommentModel } from '../posts/comments/models/QueryCommentModel';
import { BannedUserInBlogQueryModel } from '../blogs/models/BannedUserInBlogQueryModel';

export class QueryNormalizer {
  normalizeUsersQuery(query: QueryUserModel): NormalizedUsersQuery {
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
      searchEmailTerm: query.searchEmailTerm || '',
      searchLoginTerm: query.searchLoginTerm || '',
      sortBy: 'createdAt',
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
}

export type NormalizedUsersQuery = {
  pageNumber: number;
  pageSize: number;
  sortBy: 'createdAt'; // createdAt
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
