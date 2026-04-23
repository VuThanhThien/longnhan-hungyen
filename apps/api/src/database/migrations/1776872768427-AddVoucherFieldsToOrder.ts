import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVoucherFieldsToOrder1776872768427 implements MigrationInterface {
    name = 'AddVoucherFieldsToOrder1776872768427'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "voucher_usage" DROP CONSTRAINT "FK_voucher_usage_voucher"
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher_usage" DROP CONSTRAINT "FK_voucher_usage_order"
        `);
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD "discountAmount" integer NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD "voucherCode" character varying(50)
        `);
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD "voucher_id" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD CONSTRAINT "FK_d6ed6a38cc40cae0c9537c5f0c3" FOREIGN KEY ("voucher_id") REFERENCES "voucher"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher_usage"
            ADD CONSTRAINT "FK_a3ee1ba391c85119a7b693d2e6a" FOREIGN KEY ("voucherId") REFERENCES "voucher"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher_usage"
            ADD CONSTRAINT "FK_b4c2714fcac39b33e7b6c42ce52" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "voucher_usage" DROP CONSTRAINT "FK_b4c2714fcac39b33e7b6c42ce52"
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher_usage" DROP CONSTRAINT "FK_a3ee1ba391c85119a7b693d2e6a"
        `);
        await queryRunner.query(`
            ALTER TABLE "order" DROP CONSTRAINT "FK_d6ed6a38cc40cae0c9537c5f0c3"
        `);
        await queryRunner.query(`
            ALTER TABLE "order" DROP COLUMN "voucher_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "order" DROP COLUMN "voucherCode"
        `);
        await queryRunner.query(`
            ALTER TABLE "order" DROP COLUMN "discountAmount"
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher_usage"
            ADD CONSTRAINT "FK_voucher_usage_order" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "voucher_usage"
            ADD CONSTRAINT "FK_voucher_usage_voucher" FOREIGN KEY ("voucherId") REFERENCES "voucher"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
