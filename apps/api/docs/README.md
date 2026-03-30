# Long Nhan Hung Yen E-commerce API Documentation

This is the NestJS backend API for the Long Nhan Hung Yen longan e-commerce platform. It provides RESTful endpoints for product management, orders, articles, media uploads, and admin dashboard functionality.

## Detail Documentation

- [Setup & Development](development.md)
- [Architecture](architecture.md)
- [API Reference](api.md)
- [Database](database.md)
- [Security](security.md)
- [Testing](testing.md)
- [Deployment](deployment.md)
- [Technologies](technologies.md)
- [Troubleshooting](troubleshooting.md)
- Convention
  - [Naming cheatsheet](conventions/naming-cheatsheet.md)
  - [TypeScript Style Guide and Coding Conventions](conventions/styleguide.md)
  - [Clean code Typescript](conventions/clean-code-typescript.md)
  - [Branch conventions](conventions/branch-conventions.md)
  - [Commit conventions](conventions/commit-conventions.md)
  - [Linting & formatting](conventions/linting-and-formatting.md)

## Core Features

- [x] **E-commerce Modules**: Products, Orders, Articles, Media management
- [x] **Admin Dashboard**: Statistics and monitoring endpoints
- [x] **Database**: TypeORM with PostgreSQL
- [x] **Migrations**: Auto-generated via TypeORM CLI
- [x] **Seeding**: Sample data via typeorm-extension
- [x] **Authentication**: JWT-based with email sign-in/up
- [x] **Media Uploads**: Cloudinary integration
- [x] **Pagination**: Offset and Cursor support
- [x] **Internationalization**: Multi-language support (I18N)
- [x] **API Documentation**: Swagger at `/api-docs`
- [x] **Testing**: Unit and E2E tests with Jest
- [x] **Code Quality**: ESLint + Prettier formatting
- [x] **Docker**: Local and production configurations
- [x] **CI/CD**: GitHub Actions

## References

- [TypeScript](https://www.typescriptlang.org/)
- [NestJS](https://docs.nestjs.com/)
- [NestJS I18n](https://nestjs-i18n.com/)
- [TypeORM](https://typeorm.io/)
- [TypeORM Extension](https://typeorm-extension.tada5hi.net/)
- [Nodemailer](https://nodemailer.com/)
- [NestJS Mailer](https://nest-modules.github.io/mailer/)
- [Jest](https://jestjs.io/)
- [PNPM](https://pnpm.io/)
- [ESLint](https://eslint.org/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Prettier](https://prettier.io/)
- [Husky](https://typicode.github.io/husky/)
- [Lint Staged](https://github.com/lint-staged/lint-staged)
- [Commitlint](https://commitlint.js.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Commitizen](https://commitizen-tools.github.io/commitizen/)
- [Renovate](https://docs.renovatebot.com/)
