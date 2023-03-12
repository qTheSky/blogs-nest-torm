import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import path from 'path';

export const validateImage = async (
  image: Express.Multer.File,
  validateRules: { width: number; height: number; maxFileSizeKB: number },
): Promise<{ validatedImage: Express.Multer.File; imageExtension: string; imageMetaData: sharp.Metadata }> => {
  if (!image) throw new BadRequestException([{ field: 'file', message: 'no file' }]);

  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image.png'];
  console.log(image.mimetype);
  if (!allowedMimeTypes.includes(image.mimetype)) {
    throw new BadRequestException([{ field: 'file', message: 'file must be png, jpg or jpeg' }]);
  }

  const imageMetaData = await sharp(image.buffer).metadata();

  if (
    imageMetaData.size > validateRules.maxFileSizeKB * 1000 ||
    imageMetaData.width !== validateRules.width ||
    imageMetaData.height !== validateRules.height
  ) {
    throw new BadRequestException([
      {
        field: 'file',
        message: `image should be ${validateRules.width}x${validateRules.height} resolution and max size ${validateRules.maxFileSizeKB}kb`,
      },
    ]);
  }

  const imageExtension = path.extname(image.originalname); // png jpg or jpeg
  return { validatedImage: image, imageExtension, imageMetaData };
};
