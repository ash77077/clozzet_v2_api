import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserEmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    temporaryPassword: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316, #fb923c); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
        </div>

        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px;">Hi <strong>${firstName}</strong>,</p>
          <p style="color: #374151; font-size: 15px; line-height: 1.6;">
            Your password has been reset by an administrator. Use the temporary password below to sign in.
            You will be asked to set a new password immediately after logging in.
          </p>

          <div style="background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Temporary Password</p>
            <p style="margin: 0; font-family: monospace; font-size: 26px; font-weight: 700; letter-spacing: 3px; color: #111827;">${temporaryPassword}</p>
          </div>

          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 14px; margin-bottom: 24px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⚠️ Important:</strong> This password is temporary. You must change it on next login. Do not share it with anyone.
            </p>
          </div>

          <p style="color: #6b7280; font-size: 13px; margin: 0;">
            If you did not request this reset, please contact your administrator immediately.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} CLOZZET. All rights reserved.
          </p>
        </div>
      </div>
    `;

    await this.mailerService.sendMail({
      to,
      subject: 'Your CLOZZET password has been reset',
      html,
    });
  }

  async sendWelcomeEmail(
    to: string,
    firstName: string,
    temporaryPassword: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316, #fb923c); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to CLOZZET</h1>
        </div>

        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px;">Hi <strong>${firstName}</strong>,</p>
          <p style="color: #374151; font-size: 15px; line-height: 1.6;">
            Your account has been created. Use the temporary password below to sign in for the first time.
            You will be asked to set a new password immediately after logging in.
          </p>

          <div style="background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Temporary Password</p>
            <p style="margin: 0; font-family: monospace; font-size: 26px; font-weight: 700; letter-spacing: 3px; color: #111827;">${temporaryPassword}</p>
          </div>

          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 14px; margin-bottom: 24px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⚠️ Important:</strong> This password is temporary. You must change it on first login. Do not share it with anyone.
            </p>
          </div>

          <p style="color: #6b7280; font-size: 13px; margin: 0;">
            If you did not expect this email, please contact your administrator.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} CLOZZET. All rights reserved.
          </p>
        </div>
      </div>
    `;

    await this.mailerService.sendMail({
      to,
      subject: 'Your CLOZZET account is ready',
      html,
    });
  }
}
