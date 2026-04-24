import mailConfig from './mail.config';

describe('MailConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.BREVO_API_KEY = 'xkeysib-test-key-123';
    process.env.MAIL_DEFAULT_EMAIL = 'default@example.com';
    process.env.MAIL_DEFAULT_NAME = 'Default Name';
  });

  beforeAll(() => {
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
  });

  it('should return the mail configuration', async () => {
    const config = await mailConfig();

    expect(config.brevoApiKey).toBe('xkeysib-test-key-123');
    expect(config.defaultEmail).toBe('default@example.com');
    expect(config.defaultName).toBe('Default Name');
  });

  describe('brevoApiKey', () => {
    it('should throw an error if BREVO_API_KEY is an empty string', async () => {
      process.env.BREVO_API_KEY = '';
      await expect(async () => await mailConfig()).rejects.toThrow(Error);
    });

    it('should throw an error if BREVO_API_KEY is not set', async () => {
      delete process.env.BREVO_API_KEY;
      await expect(async () => await mailConfig()).rejects.toThrow(Error);
    });
  });

  describe('defaultEmail', () => {
    it('should throw an error if MAIL_DEFAULT_EMAIL is not a valid email', async () => {
      process.env.MAIL_DEFAULT_EMAIL = 'invalid-email';
      await expect(async () => await mailConfig()).rejects.toThrow(Error);
    });

    it('should throw an error if MAIL_DEFAULT_EMAIL is an empty string', async () => {
      process.env.MAIL_DEFAULT_EMAIL = '';
      await expect(async () => await mailConfig()).rejects.toThrow(Error);
    });

    it('should throw an error if MAIL_DEFAULT_EMAIL is not set', async () => {
      delete process.env.MAIL_DEFAULT_EMAIL;
      await expect(async () => await mailConfig()).rejects.toThrow(Error);
    });
  });

  describe('defaultName', () => {
    it('should throw an error if MAIL_DEFAULT_NAME is an empty string', async () => {
      process.env.MAIL_DEFAULT_NAME = '';
      await expect(async () => await mailConfig()).rejects.toThrow(Error);
    });

    it('should throw an error if MAIL_DEFAULT_NAME is not set', async () => {
      delete process.env.MAIL_DEFAULT_NAME;
      await expect(async () => await mailConfig()).rejects.toThrow(Error);
    });
  });
});
