import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepo } from '../../blogs.repo';
import { S3StorageAdapter } from '../../../shared/adapters/s3-storage.adapter';
import { validateImage } from '../../utils/validate-image';
import { UploadedImageViewModel } from '../../models/ImageViewModel';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UploadedImageInDB } from '../../../shared/types/UploadedImageDBType';

export class UploadMainImageCommand {
  constructor(public currentUserId: number, public blogId: number, public mainImage: Express.Multer.File) {}
}

@CommandHandler(UploadMainImageCommand)
export class UploadMainImageUseCase implements ICommandHandler<UploadMainImageCommand> {
  constructor(private blogsRepo: BlogsRepo, private s3StorageAdapter: S3StorageAdapter) {}
  async execute(command: UploadMainImageCommand): Promise<UploadedImageViewModel> {
    const blog = await this.blogsRepo.findById(command.blogId);
    if (!blog) throw new NotFoundException('Blog doesnt exist');
    if (blog.userId !== command.currentUserId) throw new ForbiddenException('You cant upload image for not your blog');

    const { validatedImage, imageExtension, imageMetaData } = await validateImage(command.mainImage, {
      maxFileSizeKB: 100,
      height: 156,
      width: 156,
    });
    const { url } = await this.s3StorageAdapter.uploadBlogMainImage(command.blogId, validatedImage, imageExtension);
    const fileData = {
      url: 'https://qthesky0.storage.yandexcloud.net/' + url,
      width: imageMetaData.width,
      height: imageMetaData.height,
      fileSize: imageMetaData.size,
    };

    blog.mainImage = { ...fileData, filePath: url } as UploadedImageInDB;
    await this.blogsRepo.save(blog);

    return { main: [fileData], wallpaper: null };
  }
}
