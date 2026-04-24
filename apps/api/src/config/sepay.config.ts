import validateConfig from '@/utils/validate-config';
import { registerAs } from '@nestjs/config';
import { IsIn, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { SepayConfig } from './sepay-config.type';

class EnvironmentVariablesValidator {
  @IsIn(['sandbox', 'production'])
  @IsNotEmpty()
  SEPAY_ENV: 'sandbox' | 'production';

  @IsString()
  @IsNotEmpty()
  SEPAY_MERCHANT_ID: string;

  @IsString()
  @IsNotEmpty()
  SEPAY_SECRET_KEY: string;

  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  WEB_PUBLIC_URL: string;

  @IsString()
  @IsNotEmpty()
  SEPAY_IPN_PATH: string;
}

export default registerAs<SepayConfig>('sepay', () => {
  console.info(`Register SepayConfig from environment variables`);

  const env: Record<string, string | undefined> = {
    ...process.env,
    WEB_PUBLIC_URL: process.env.WEB_PUBLIC_URL,
    SEPAY_IPN_PATH: process.env.SEPAY_IPN_PATH ?? '/payments/sepay/ipn',
  };

  validateConfig(env, EnvironmentVariablesValidator);

  return {
    env: env.SEPAY_ENV as SepayConfig['env'],
    merchantId: env.SEPAY_MERCHANT_ID as string,
    secretKey: env.SEPAY_SECRET_KEY as string,
    webBaseUrl: env.WEB_PUBLIC_URL,
    ipnPath: env.SEPAY_IPN_PATH,
  };
});
