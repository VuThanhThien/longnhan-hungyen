import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceProduct1776334504912 implements MigrationInterface {
  name = 'EnhanceProduct1776334504912';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."product_review_status_enum" AS ENUM('pending', 'published', 'rejected')
        `);
    await queryRunner.query(`
            CREATE TABLE "product_review" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "product_id" uuid NOT NULL,
                "order_id" uuid NOT NULL,
                "rating" smallint NOT NULL,
                "comment" text,
                "status" "public"."product_review_status_enum" NOT NULL DEFAULT 'pending',
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_product_review_order_product" UNIQUE ("order_id", "product_id"),
                CONSTRAINT "PK_product_review_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_product_review_status" ON "product_review" ("status")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_product_review_product_status_created_at" ON "product_review" ("product_id", "status", "created_at")
        `);
    await queryRunner.query(`
            CREATE TABLE "order_tracking_token" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "orderId" uuid NOT NULL,
                "tokenHash" character varying(64) NOT NULL,
                "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                "usedAt" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_2ea787bdb3ab0ba76c5ed809084" UNIQUE ("tokenHash"),
                CONSTRAINT "PK_order_tracking_token_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_order_tracking_token_order_id" ON "order_tracking_token" ("orderId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_order_tracking_token_hash" ON "order_tracking_token" ("tokenHash")
        `);
    await queryRunner.query(`
            ALTER TABLE "product_review"
            ADD CONSTRAINT "FK_d7608150bffea47ff5caec8f265" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "product_review"
            ADD CONSTRAINT "FK_72bebe79c74646c24a7f336f758" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "order_tracking_token"
            ADD CONSTRAINT "FK_24e8673d60642cf7283be75bda1" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "order_tracking_token" DROP CONSTRAINT "FK_24e8673d60642cf7283be75bda1"
        `);
    await queryRunner.query(`
            ALTER TABLE "product_review" DROP CONSTRAINT "FK_72bebe79c74646c24a7f336f758"
        `);
    await queryRunner.query(`
            ALTER TABLE "product_review" DROP CONSTRAINT "FK_d7608150bffea47ff5caec8f265"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_order_tracking_token_hash"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_order_tracking_token_order_id"
        `);
    await queryRunner.query(`
            DROP TABLE "order_tracking_token"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_product_review_product_status_created_at"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_product_review_status"
        `);
    await queryRunner.query(`
            DROP TABLE "product_review"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."product_review_status_enum"
        `);
  }
}
