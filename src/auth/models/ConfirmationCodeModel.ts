import { IsUUID, Validate, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepo } from '../../users/users.repo';
import { ApiProperty } from '@nestjs/swagger';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsConfirmationCodeValidConstraint implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepo) {}
  async validate(code: string) {
    const user = await this.usersRepository.findUserByEmailConfirmationCode(code);
    if (!user) return false;
    return user.isEmailCanBeConfirmed(code);
  }
}

export class ConfirmationCodeModel {
  @Validate(IsConfirmationCodeValidConstraint, { message: 'code is wrong' })
  @IsUUID()
  @ApiProperty({
    description: 'Confirmation code',
    example: 'someUUIDdsajkdsa-dsad-as-das-ddsa',
    type: 'string',
    format: 'email',
  })
  code: string;
}
