import { IsEmail, Validate, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/users.repository';

@Injectable()
@ValidatorConstraint({ async: true })
export class CheckIsEmailConfirmedConstraint implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepository) {}
  async validate(email: string) {
    const user = await this.usersRepository.findUserByLoginOrEmail(email);
    if (!user) return false;
    if (user.emailConfirmation.isConfirmed) return false;
    return true;
  }
}

export class EmailResendModel {
  @Validate(CheckIsEmailConfirmedConstraint, { message: 'Email already confimed or doesnt exist' })
  @IsEmail()
  email: string;
}
