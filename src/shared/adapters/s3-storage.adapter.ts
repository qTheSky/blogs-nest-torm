import { Injectable } from '@nestjs/common';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class S3StorageAdapter {
  s3Client: S3Client;
  bucketName = 'qthesky0'; // it should be in the environment

  constructor() {
    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: 'https://storage.yandexcloud.net',
      credentials: {
        secretAccessKey: 'YCPLC2aUHxpnFlAiNtkbnnCNNgWWUtNYpZKxH9qn',
        accessKeyId: 'YCAJEsLV7QyB4VzfV6gOAFySi',
      },
    });
  }

  async uploadBlogMainImage(blogId: number, image: Express.Multer.File, imageExtension: string) {
    const key = `blogs/${blogId}/images/main/${blogId}blog_main${imageExtension}`;
    const bucketParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: image.buffer,
      ContentType: `image/${imageExtension}`,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(bucketParams));
      return {
        url: key,
      };
    } catch (exception) {
      console.error(exception);
      throw exception;
    }
  }

  async uploadBlogWallpaper(blogId: number, image: Express.Multer.File, imageExtension: string) {
    const key = `blogs/${blogId}/images/wallpaper/${blogId}blog_wallpaper${imageExtension}`;
    const bucketParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: image.buffer,
      ContentType: `image/${imageExtension}`,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(bucketParams));
      return {
        url: key,
      };
    } catch (exception) {
      console.error(exception);
      throw exception;
    }
  }

  async deleteFile(filePath: string) {
    const bucketParams = { Bucket: this.bucketName, Key: filePath };

    try {
      await this.s3Client.send(new DeleteObjectCommand(bucketParams));
    } catch (exception) {
      console.error(exception);
      throw exception;
    }
  }

  async uploadPostMainImage(postId: number, image: Express.Multer.File, imageExtension: string) {
    const key = `posts/${postId}/images/main/${postId}post_main${imageExtension}`;
    const bucketParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: image.buffer,
      ContentType: `image/${imageExtension}`,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(bucketParams));
      return {
        url: key,
      };
    } catch (exception) {
      console.error(exception);
      throw exception;
    }
  }
}
