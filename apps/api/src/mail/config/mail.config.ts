import { registerAs } from '@nestjs/config';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { MailConfig } from './mail-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty()
  BREVO_API_KEY: string;

  @IsEmail()
  MAIL_DEFAULT_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  MAIL_DEFAULT_NAME: string;
}

export default registerAs<MailConfig>('mail', () => {
  console.info(`Register MailConfig from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    brevoApiKey: process.env.BREVO_API_KEY!,
    defaultEmail: process.env.MAIL_DEFAULT_EMAIL!,
    defaultName: process.env.MAIL_DEFAULT_NAME!,
  };
});
