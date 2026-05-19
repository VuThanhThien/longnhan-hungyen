import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQueryPerformanceIndexes1779183308427 implements MigrationInterface {
    name = 'AddQueryPerformanceIndexes1779183308427'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_product_review_status"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_category_active_sort_order" ON "category" ("active", "sort_order")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_product_active_category_created_at" ON "product" ("active", "category_id", "created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_product_active_created_at" ON "product" ("active", "created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_product_variant_product_active_sort" ON "product_variant" ("product_id", "active", "sortOrder")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_order_sepay_sweep" ON "order" ("created_at")
            WHERE "sepay_transaction_id" IS NULL
                AND "paymentMethod" = 'bank_transfer'
                AND "paymentStatus" = 'pending'
                AND "orderStatus" = 'pending'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_order_payment_status_created_at" ON "order" ("paymentStatus", "created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_order_status_created_at" ON "order" ("orderStatus", "created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_voucher_usage_voucher_used_at" ON "voucher_usage" ("voucherId", "used_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_voucher_created_at" ON "voucher" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_session_user_id" ON "session" ("user_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_transaction_order_type_status" ON "transaction" ("order_id", "type", "status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_product_review_status_created_at" ON "product_review" ("status", "created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_order_tracking_token_hash_unused" ON "order_tracking_token" ("tokenHash")
            WHERE "usedAt" IS NULL
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_media_folder_created_at" ON "media" ("folder", "created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_article_status_published_at" ON "article" ("status", "published_at")
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_post_user_id"
        `);
        await queryRunner.query(`
            DROP TABLE "post"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "post" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "slug" character varying NOT NULL,
                "description" character varying,
                "content" character varying,
                "user_id" uuid NOT NULL,
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "created_by" character varying NOT NULL,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_by" character varying NOT NULL,
                CONSTRAINT "PK_post_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_post_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_article_status_published_at"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_media_folder_created_at"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_order_tracking_token_hash_unused"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_product_review_status_created_at"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_transaction_order_type_status"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_session_user_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_voucher_created_at"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_voucher_usage_voucher_used_at"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_order_status_created_at"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_order_payment_status_created_at"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_order_sepay_sweep"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_product_variant_product_active_sort"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_product_active_created_at"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_product_active_category_created_at"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_category_active_sort_order"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_product_review_status" ON "product_review" ("status")
        `);
    }

}
