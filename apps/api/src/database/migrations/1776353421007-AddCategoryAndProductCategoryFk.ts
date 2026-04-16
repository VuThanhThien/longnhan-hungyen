import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryAndProductCategoryFk1776353421007 implements MigrationInterface {
  name = 'AddCategoryAndProductCategoryFk1776353421007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "category" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "slug" character varying(255) NOT NULL,
                "name" character varying(255) NOT NULL,
                "sort_order" integer NOT NULL DEFAULT '0',
                "active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_category_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_category_slug" ON "category" ("slug")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_category_active" ON "category" ("active")
        `);
    await queryRunner.query(`
            ALTER TABLE "product"
            ADD "category_id" uuid
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_product_category_id" ON "product" ("category_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "product"
            ADD CONSTRAINT "FK_0dce9bc93c2d2c399982d04bef1" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "product" DROP CONSTRAINT "FK_0dce9bc93c2d2c399982d04bef1"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_product_category_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "product" DROP COLUMN "category_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_category_active"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."UQ_category_slug"
        `);
    await queryRunner.query(`
            DROP TABLE "category"
        `);
  }
}
