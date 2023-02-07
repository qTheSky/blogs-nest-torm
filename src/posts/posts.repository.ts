import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModel } from './post.schema';
import { CreatePostModel } from './models/CreatePostModel';
import { Types } from 'mongoose';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModel) {}

  async create(userId: Types.ObjectId, createPostModel: CreatePostModel, blogName: string): Promise<Post> {
    const post = this.PostModel.createPost(
      this.PostModel,
      userId,
      createPostModel.blogId,
      blogName,
      createPostModel.title,
      createPostModel.shortDescription,
      createPostModel.content,
    );
    return await post.save();
  }

  async save(post: PostDocument): Promise<PostDocument> {
    return await post.save();
  }

  async get(id: Types.ObjectId): Promise<PostDocument | null> {
    return this.PostModel.findById(id);
  }

  async findById(_id: Types.ObjectId): Promise<PostDocument | null> {
    return this.PostModel.findOne({ _id, isBlogBanned: { $ne: true } });
  }

  async deletePost(id): Promise<boolean> {
    const post = await this.get(id);
    if (!post) throw new NotFoundException('Post doesnt exist');
    await post.delete();
    return true;
  }
  async findAllPostsOfBlog(blogId: Types.ObjectId): Promise<PostDocument[]> {
    return this.PostModel.find({ blogId });
  }
}
