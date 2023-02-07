import { IsUUID, Validate, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/users.repository';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsConfirmationCodeValidConstraint implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepository) {}
  async validate(code: string) {
    const user = await this.usersRepository.findUserByEmailConfirmationCode(code);
    if (!user) return false;
    return user.isEmailCanBeConfirmed(code);
  }
}

export class ConfirmationCodeModel {
  @Validate(IsConfirmationCodeValidConstraint, { message: 'code is wrong' })
  @IsUUID()
  code: string;
}
