import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepo {
  constructor(@InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>) {}

  async create(dto: {
    login: string;
    email: string;
    passwordHash: string;
    isConfirmedEmail: boolean;
  }): Promise<UserEntity> {
    const newUser = UserEntity.create(dto.login, dto.email, dto.passwordHash, dto.isConfirmedEmail);
    return await this.usersRepository.save(newUser);
  }

  async save(user: UserEntity) {
    return this.usersRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  findUserByEmailConfirmationCode(code: string): Promise<UserEntity | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.emailConfirmation', 'UserEmailConfirmation')
      .where('UserEmailConfirmation.confirmationCode = :code', { code: code })
      .getOne();
  }

  findUserById(id: number): Promise<UserEntity | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findUserByLoginOrEmail(loginOrEmail: string): Promise<UserEntity | null> {
    return this.usersRepository.findOneBy([{ login: loginOrEmail }, { email: loginOrEmail }]);
  }

  findUserByPasswordRecoveryCode(code: string): Promise<UserEntity | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.passwordRecovery', 'passwordRecovery')
      .where('passwordRecovery.recoveryCode = :code', { code: code })
      .getOne();
  }
}
