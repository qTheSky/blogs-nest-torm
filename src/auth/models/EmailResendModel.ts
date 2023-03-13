import { IsEmail, Validate, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepo } from '../../users/users.repo';
import { ApiProperty } from '@nestjs/swagger';

@Injectable()
@ValidatorConstraint({ async: true })
export class CheckIsEmailConfirmedConstraint implements ValidatorConstraintInterface {
  constructor(private usersRepo: UsersRepo) {}
  async validate(email: string) {
    const user = await this.usersRepo.findUserByLoginOrEmail(email);
    if (!user) return false;
    if (user.emailConfirmation.isConfirmed) return false;
    return true;
  }
}

export class EmailResendModel {
  @Validate(CheckIsEmailConfirmedConstraint, { message: 'Email already confimed or doesnt exist' })
  @IsEmail()
  @ApiProperty({ description: 'User email', example: 'user@example.com', type: 'string', format: 'email' })
  email: string;
}
