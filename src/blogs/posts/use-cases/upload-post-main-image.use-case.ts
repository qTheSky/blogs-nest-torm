import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepo } from '../../blogs.repo';
import { S3StorageAdapter } from '../../../shared/adapters/s3-storage.adapter';
import { PostsRepo } from '../posts.repo';
import { ImageViewModel } from '../../models/ImageViewModel';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { validateImage } from '../../utils/validate-image';

export class UploadPostMainImageCommand {
  constructor(
    public blogId: number,
    public postId: number,
    public currentUserId: number,
    public mainImage: Express.Multer.File,
  ) {}
}

@CommandHandler(UploadPostMainImageCommand)
export class UploadPostMainImageUseCase implements ICommandHandler<UploadPostMainImageCommand> {
  constructor(private blogsRepo: BlogsRepo, private s3StorageAdapter: S3StorageAdapter, private postsRepo: PostsRepo) {}
  async execute(command: UploadPostMainImageCommand): Promise<{ main: ImageViewModel[] }> {
    const blog = await this.blogsRepo.findById(command.blogId);
    if (!blog) throw new NotFoundException('Blog doesnt exist');
    const post = await this.postsRepo.findPostById(command.postId);
    if (!post) throw new NotFoundException('Post doesnt exist');
    if (post.userId !== command.currentUserId) throw new ForbiddenException('You can`t upload image for not your post');

    const { validatedImage, imageExtension, imageMetaData } = await validateImage(command.mainImage, {
      maxFileSizeKB: 100,
      width: 940,
      height: 432,
    });

    const { url } = await this.s3StorageAdapter.uploadPostMainImage(command.postId, validatedImage, imageExtension);
    const fileData = {
      url: 'https://qthesky0.storage.yandexcloud.net/' + url,
      width: imageMetaData.width,
      height: imageMetaData.height,
      fileSize: imageMetaData.size,
    };

    post.mainImage = { ...fileData, filePath: url };
    await this.postsRepo.save(post);

    return { main: [fileData] };
  }
}
