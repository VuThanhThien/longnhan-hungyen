import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductsAddSummaryDescriptionHtml1775640660642 implements MigrationInterface {
  name = 'ProductsAddSummaryDescriptionHtml1775640660642';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "product"
            ADD "summary" text
        `);
    await queryRunner.query(`
            ALTER TABLE "product"
            ADD "descriptionHtml" text
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "product" DROP COLUMN "descriptionHtml"
        `);
    await queryRunner.query(`
            ALTER TABLE "product" DROP COLUMN "summary"
        `);
  }
}
