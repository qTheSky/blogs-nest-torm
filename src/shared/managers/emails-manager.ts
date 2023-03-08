import { EmailAdapter } from '../adapters/email.adapter';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../users/entities/user.entity';

@Injectable()
export class EmailsManager {
  constructor(private emailAdapter: EmailAdapter) {}
  async sendEmailConfirmationMessage(user: UserEntity) {
    await this.emailAdapter.sendEmail(
      user.email,
      'email confirmation',
      ` <h1>Thank for your registration</h1>
                     <p>To finish registration please follow the link below:
                        <a href='https://localhost:3000/confirm-email?code=${user.emailConfirmation.confirmationCode}'>complete registration</a>
                        ${user.emailConfirmation.confirmationCode}
                      </p>`,
    );
  }
  // async sendPasswordConfirmationCode(user: UserDocument) {
  //   await emailAdapter.sendEmail(
  //     user.accountData.email,
  //     'password recovery',
  //     ` <h1>Password recovery</h1>
  //                    <p>To finish password recovery please follow the link below:
  //                       <a href='https://somesite.com/password-recovery?recoveryCode=${user.passwordRecovery?.confirmationCode}'>recovery password</a>
  //                       ${user.passwordRecovery?.confirmationCode}
  //                     </p>`,
  //   );
  // }
}
