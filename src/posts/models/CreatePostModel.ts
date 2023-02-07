import { Types } from 'mongoose';
import { CreatePostByBlogIdInParamsModel } from './CreatePostByBlogIdInParamsModel';
import { IsMongoId, Validate, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../blogs/blogs.repository';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsBlogExistConstraint implements ValidatorConstraintInterface {
  constructor(private blogsRepository: BlogsRepository) {}
  async validate(id: Types.ObjectId) {
    const blog = await this.blogsRepository.get(id);
    return !!blog;
  }
}

export class CreatePostModel extends CreatePostByBlogIdInParamsModel {
  @Validate(IsBlogExistConstraint, { message: 'Blog doesnt exist' })
  @IsMongoId()
  blogId: Types.ObjectId;
}
