import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserForBlogModel } from '../../models/BanUserForBlogModel';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepo } from '../../blogs.repo';
import { BannedUsersInBlogRepo } from '../../banned-users-in-blog.repo';
import { UsersRepo } from '../../../users/users.repo';

export class BanUserForBlogCommand {
  constructor(
    public currentUserId: number,
    public banUserForBlogModel: BanUserForBlogModel,
    public userIdForBan: number,
  ) {}
}

@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCase implements ICommandHandler<BanUserForBlogCommand> {
  constructor(
    private blogsRepo: BlogsRepo,
    private bannedUsersInBlogRepo: BannedUsersInBlogRepo,
    private usersRepo: UsersRepo,
  ) {}
  async execute(command: BanUserForBlogCommand): Promise<void> {
    const { blogId, isBanned, banReason } = command.banUserForBlogModel;
    const blog = await this.blogsRepo.get(+blogId);
    if (!blog) throw new NotFoundException();
    if (blog.userId !== command.currentUserId || blog.userId === command.userIdForBan) throw new ForbiddenException();
    const user = await this.usersRepo.findUserById(command.userIdForBan);
    if (!user) throw new NotFoundException();
    const bannedUser = await this.bannedUsersInBlogRepo.findBannedUser(blog.id, user.id);
    if (!bannedUser && isBanned === true) {
      await this.bannedUsersInBlogRepo.create(blog, user, banReason);
      return;
    }
    if (bannedUser && isBanned === false) {
      await this.bannedUsersInBlogRepo.deleteBannedUser(blog.id, user.id);
      return;
    }
  }
}
