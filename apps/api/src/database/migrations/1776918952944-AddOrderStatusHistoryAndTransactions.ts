import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderStatusHistoryAndTransactions1776918952944 implements MigrationInterface {
    name = 'AddOrderStatusHistoryAndTransactions1776918952944'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transaction_type_enum" AS ENUM('payment', 'refund', 'adjustment', 'fee')`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_method_enum" AS ENUM('cod', 'bank_transfer', 'cash', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_direction_enum" AS ENUM('in', 'out')`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_status_enum" AS ENUM('pending', 'completed', 'failed', 'voided')`);
        await queryRunner.query(`CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "type" "public"."transaction_type_enum" NOT NULL, "method" "public"."transaction_method_enum", "amount" integer NOT NULL, "direction" "public"."transaction_direction_enum" NOT NULL, "status" "public"."transaction_status_enum" NOT NULL DEFAULT 'completed', "reference_no" character varying(100), "reference_note" text, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_by_admin_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_transaction_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_transaction_occurred" ON "transaction" ("occurred_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_transaction_method" ON "transaction" ("method") `);
        await queryRunner.query(`CREATE INDEX "IDX_transaction_status" ON "transaction" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_transaction_type" ON "transaction" ("type") `);
        await queryRunner.query(`CREATE INDEX "IDX_transaction_order_occurred" ON "transaction" ("order_id", "occurred_at") `);
        await queryRunner.query(`CREATE TYPE "public"."order_status_history_from_status_enum" AS ENUM('pending', 'confirmed', 'shipping', 'delivered', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_history_to_status_enum" AS ENUM('pending', 'confirmed', 'shipping', 'delivered', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_history_actor_type_enum" AS ENUM('system', 'admin', 'customer')`);
        await queryRunner.query(`CREATE TABLE "order_status_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "from_status" "public"."order_status_history_from_status_enum", "to_status" "public"."order_status_history_to_status_enum" NOT NULL, "actor_type" "public"."order_status_history_actor_type_enum" NOT NULL, "actor_id" uuid, "note" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_order_status_history_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_order_status_history_order_created" ON "order_status_history" ("order_id", "created_at") `);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_9011283056620f5eaa7ad74cef6" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_e493da3fe6f60f539aef8b40e98" FOREIGN KEY ("created_by_admin_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ADD CONSTRAINT "FK_1ca7d5228cf9dc589b60243933c" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ADD CONSTRAINT "FK_bc9c2854c4f4988218d7cb230ef" FOREIGN KEY ("actor_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);

        // --- Backfill: seed status history for existing orders (manual, per plan §7) ---
        await queryRunner.query(`INSERT INTO "order_status_history" ("id", "order_id", "from_status", "to_status", "actor_type", "actor_id", "created_at") SELECT uuid_generate_v4(), "id", NULL, "orderStatus"::text::"public"."order_status_history_to_status_enum", 'system', NULL, "created_at" FROM "order"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverse backfill first so CASCADE doesn't matter on row count
        await queryRunner.query(`DELETE FROM "order_status_history"`);
        await queryRunner.query(`ALTER TABLE "order_status_history" DROP CONSTRAINT "FK_bc9c2854c4f4988218d7cb230ef"`);
        await queryRunner.query(`ALTER TABLE "order_status_history" DROP CONSTRAINT "FK_1ca7d5228cf9dc589b60243933c"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_e493da3fe6f60f539aef8b40e98"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_9011283056620f5eaa7ad74cef6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_order_status_history_order_created"`);
        await queryRunner.query(`DROP TABLE "order_status_history"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_history_actor_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_history_to_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_history_from_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_transaction_order_occurred"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_transaction_type"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_transaction_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_transaction_method"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_transaction_occurred"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_direction_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_type_enum"`);
    }

}
