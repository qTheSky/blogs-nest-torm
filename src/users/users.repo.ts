import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepo {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async create(dto: { login: string; email: string; passwordHash: string; isConfirmedEmail: boolean }): Promise<User> {
    const newUser = User.create(dto.login, dto.email, dto.passwordHash, dto.isConfirmedEmail);
    return await this.usersRepository.save(newUser);
  }

  async save(user: User) {
    return this.usersRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  findUserByEmailConfirmationCode(code: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.emailConfirmation', 'UserEmailConfirmation')
      .where('UserEmailConfirmation.confirmationCode = :code', { code: code })
      .getOne();
  }

  findUserById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findUserByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    return this.usersRepository.findOneBy([{ login: loginOrEmail }, { email: loginOrEmail }]);
  }
}
