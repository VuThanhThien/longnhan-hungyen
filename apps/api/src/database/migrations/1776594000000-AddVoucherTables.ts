import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVoucherTables1776594000000 implements MigrationInterface {
  name = 'AddVoucherTables1776594000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."voucher_discounttype_enum" AS ENUM('percentage', 'fixed')
    `);

    await queryRunner.query(`
      CREATE TABLE "voucher" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(50) NOT NULL,
        "description" character varying(255),
        "discountType" "public"."voucher_discounttype_enum" NOT NULL,
        "discountValue" integer NOT NULL,
        "minOrderAmount" integer,
        "maxUses" integer,
        "usedCount" integer NOT NULL DEFAULT '0',
        "isActive" boolean NOT NULL DEFAULT true,
        "expiresAt" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_voucher_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_voucher_code" ON "voucher" ("code")
    `);

    await queryRunner.query(`
      CREATE TABLE "voucher_usage" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "voucherId" uuid NOT NULL,
        "orderId" uuid NOT NULL,
        "phone" character varying(20) NOT NULL,
        "discountAmount" integer NOT NULL,
        "used_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_voucher_usage_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_voucher_usage_voucher_phone"
        ON "voucher_usage" ("voucherId", "phone")
    `);

    await queryRunner.query(`
      ALTER TABLE "voucher_usage"
        ADD CONSTRAINT "FK_voucher_usage_voucher"
        FOREIGN KEY ("voucherId") REFERENCES "voucher"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "voucher_usage"
        ADD CONSTRAINT "FK_voucher_usage_order"
        FOREIGN KEY ("orderId") REFERENCES "order"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "voucher_usage" DROP CONSTRAINT "FK_voucher_usage_order"
    `);
    await queryRunner.query(`
      ALTER TABLE "voucher_usage" DROP CONSTRAINT "FK_voucher_usage_voucher"
    `);
    await queryRunner.query(`DROP INDEX "UQ_voucher_usage_voucher_phone"`);
    await queryRunner.query(`DROP TABLE "voucher_usage"`);
    await queryRunner.query(`DROP INDEX "UQ_voucher_code"`);
    await queryRunner.query(`DROP TABLE "voucher"`);
    await queryRunner.query(`DROP TYPE "public"."voucher_discounttype_enum"`);
  }
}
