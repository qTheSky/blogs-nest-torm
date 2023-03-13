import {
  IsEmail,
  IsString,
  Length,
  Matches,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepo } from '../users.repo';
import { ApiProperty } from '@nestjs/swagger';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsEmailOrLoginUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private usersRepo: UsersRepo) {}

  async validate(loginOrEmail: string) {
    const user = await this.usersRepo.findUserByLoginOrEmail(loginOrEmail);
    return !user;
  }
}

export class CreateUserModel {
  @Validate(IsEmailOrLoginUniqueConstraint, { message: 'Email already exist' })
  @IsEmail()
  @ApiProperty({ description: 'User email', example: 'user@example.com', type: 'string', format: 'email' })
  email: string;
  @Validate(IsEmailOrLoginUniqueConstraint, { message: 'Login already exist' })
  @Length(3, 10)
  @Matches('[a-zA-Z0-9_-]*$')
  @IsString()
  @ApiProperty({ description: 'User name', example: 'John', type: 'string', minLength: 3, maxLength: 10 })
  login: string;
  @Length(6, 20)
  @IsString()
  @ApiProperty({ description: 'User password', example: 'string', type: 'string', minLength: 6, maxLength: 20 })
  password: string;
}
