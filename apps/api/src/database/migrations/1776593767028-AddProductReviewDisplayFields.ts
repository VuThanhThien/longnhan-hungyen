import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductReviewDisplayFields1776593767028 implements MigrationInterface {
    name = 'AddProductReviewDisplayFields1776593767028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "product_review"
            ADD "is_anonymous" boolean NOT NULL DEFAULT false
        `);
        await queryRunner.query(`
            ALTER TABLE "product_review"
            ADD "variant_label_snapshot" character varying(255)
        `);
        await queryRunner.query(`
            ALTER TABLE "product_review"
            ADD "public_reviewer_label" character varying(120)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "product_review" DROP COLUMN "public_reviewer_label"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_review" DROP COLUMN "variant_label_snapshot"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_review" DROP COLUMN "is_anonymous"
        `);
    }

}
