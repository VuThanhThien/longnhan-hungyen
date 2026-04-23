import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderVoucherIdIndex1776873851947 implements MigrationInterface {
    name = 'AddOrderVoucherIdIndex1776873851947'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX "IDX_order_voucher_id" ON "order" ("voucher_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_order_voucher_id"
        `);
    }

}
