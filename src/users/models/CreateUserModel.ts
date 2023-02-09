import { IsEmail, Length, Matches, Validate, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepo } from '../users.repo';

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
  email: string;
  @Validate(IsEmailOrLoginUniqueConstraint, { message: 'Login already exist' })
  @Length(3, 10)
  @Matches('[a-zA-Z0-9_-]*$')
  login: string;
  @Length(6, 20)
  password: string;
}
