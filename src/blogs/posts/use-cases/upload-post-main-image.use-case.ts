import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../../shared/adapters/s3-storage.adapter';
import { PostsRepo } from '../posts.repo';
import { ImageViewModel } from '../../models/ImageViewModel';
import { validateImage } from '../../utils/validate-image';
import sharp from 'sharp';
import { ViewModelMapper } from '../../../shared/view-model-mapper';
import { PostsService } from '../posts.service';

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
  constructor(
    private s3StorageAdapter: S3StorageAdapter,
    private postsRepo: PostsRepo,
    private viewModelMapper: ViewModelMapper,
    private postsService: PostsService,
  ) {}
  async execute(command: UploadPostMainImageCommand): Promise<{ main: ImageViewModel[] }> {
    const post = await this.postsService.validateExistPostAndOwnByUser(
      command.blogId,
      command.postId,
      command.currentUserId,
    );

    const { validatedImage, imageExtension } = await validateImage(command.mainImage, {
      maxFileSizeKB: 100,
      width: 940,
      height: 432,
    });

    const imagesBuffersToUpload: { size: 'SMALL' | 'MEDIUM' | 'LARGE'; buffer: Buffer }[] = [];

    imagesBuffersToUpload.push({ size: 'LARGE', buffer: validatedImage.buffer });
    const middleBuffer = await sharp(validatedImage.buffer).resize({ width: 300, height: 180 }).toBuffer();
    imagesBuffersToUpload.push({ size: 'MEDIUM', buffer: middleBuffer });
    const smallBuffer = await sharp(validatedImage.buffer).resize({ width: 149, height: 96 }).toBuffer();
    imagesBuffersToUpload.push({ size: 'SMALL', buffer: smallBuffer });

    post.mainImages = [];
    for (let i = 0; i < imagesBuffersToUpload.length; i++) {
      const { url } = await this.s3StorageAdapter.uploadPostMainImage(
        command.postId,
        validatedImage.buffer,
        imageExtension,
        imagesBuffersToUpload[i].size,
      );
      const metadata = await sharp(imagesBuffersToUpload[i].buffer).metadata();
      const fileData = {
        url: 'https://qthesky0.storage.yandexcloud.net/' + url,
        width: metadata.width,
        height: metadata.height,
        fileSize: metadata.size,
      };
      post.mainImages.push({ ...fileData, filePath: url });
    }
    await this.postsRepo.save(post);

    return { main: post.mainImages.map(this.viewModelMapper.getImageViewModel) };
  }
}
