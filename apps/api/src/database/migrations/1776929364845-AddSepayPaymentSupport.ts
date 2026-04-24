import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSepayPaymentSupport1776929364845 implements MigrationInterface {
    name = 'AddSepayPaymentSupport1776929364845'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD "sepay_transaction_id" character varying(100)
        `);
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD "sepay_paid_at" TIMESTAMP WITH TIME ZONE
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_order_sepay_transaction_id" ON "order" ("sepay_transaction_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."UQ_order_sepay_transaction_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "order" DROP COLUMN "sepay_paid_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "order" DROP COLUMN "sepay_transaction_id"
        `);
    }

}
