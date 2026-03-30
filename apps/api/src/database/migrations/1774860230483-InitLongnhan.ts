import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitLongnhan1774860230483 implements MigrationInterface {
  name = 'InitLongnhan1774860230483';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
            CREATE TABLE "session" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "hash" character varying(255) NOT NULL,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "created_by" character varying NOT NULL,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_by" character varying NOT NULL,
                CONSTRAINT "PK_session_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "username" character varying(50),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "bio" character varying NOT NULL DEFAULT '',
                "image" character varying NOT NULL DEFAULT '',
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "created_by" character varying NOT NULL,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_by" character varying NOT NULL,
                CONSTRAINT "PK_user_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_user_username" ON "user" ("username")
            WHERE "deleted_at" IS NULL
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_user_email" ON "user" ("email")
            WHERE "deleted_at" IS NULL
        `);
    await queryRunner.query(`
            CREATE TABLE "product_variant" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "label" character varying(100) NOT NULL,
                "weightG" integer,
                "price" integer NOT NULL,
                "stock" integer NOT NULL DEFAULT '0',
                "skuCode" character varying(50),
                "active" boolean NOT NULL DEFAULT true,
                "sortOrder" integer NOT NULL DEFAULT '0',
                "product_id" uuid NOT NULL,
                CONSTRAINT "PK_product_variant_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_product_variant_product_id" ON "product_variant" ("product_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "product" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "slug" character varying(255) NOT NULL,
                "description" text,
                "basePrice" integer NOT NULL DEFAULT '0',
                "images" text,
                "featuredImageUrl" character varying(255),
                "category" character varying(50) NOT NULL DEFAULT 'other',
                "videoUrl" character varying(255),
                "active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_8cfaf4a1e80806d58e3dbe69224" UNIQUE ("slug"),
                CONSTRAINT "PK_product_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_product_slug" ON "product" ("slug")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_product_active" ON "product" ("active")
        `);
    await queryRunner.query(`
            CREATE TABLE "order_item" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "variantSnapshot" jsonb NOT NULL,
                "qty" integer NOT NULL,
                "unitPrice" integer NOT NULL,
                "subtotal" integer NOT NULL,
                "order_id" uuid NOT NULL,
                "variant_id" uuid,
                CONSTRAINT "PK_order_item_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_order_item_order_id" ON "order_item" ("order_id")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."order_paymentmethod_enum" AS ENUM('cod', 'bank_transfer')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."order_paymentstatus_enum" AS ENUM('pending', 'paid', 'failed')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."order_orderstatus_enum" AS ENUM(
                'pending',
                'confirmed',
                'shipping',
                'delivered',
                'cancelled'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "order" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "code" character varying(20) NOT NULL,
                "customerName" character varying(100) NOT NULL,
                "phone" character varying(20) NOT NULL,
                "email" character varying(255),
                "address" text NOT NULL,
                "province" character varying(100),
                "total" integer NOT NULL,
                "paymentMethod" "public"."order_paymentmethod_enum" NOT NULL DEFAULT 'cod',
                "paymentStatus" "public"."order_paymentstatus_enum" NOT NULL DEFAULT 'pending',
                "orderStatus" "public"."order_orderstatus_enum" NOT NULL DEFAULT 'pending',
                "notes" text,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_729b3eea7ce540930dbb7069498" UNIQUE ("code"),
                CONSTRAINT "PK_order_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_order_code" ON "order" ("code")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_order_payment_status" ON "order" ("paymentStatus")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_order_status" ON "order" ("orderStatus")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_order_created_at" ON "order" ("created_at")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."media_resourcetype_enum" AS ENUM('image', 'video', 'raw')
        `);
    await queryRunner.query(`
            CREATE TABLE "media" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "cloudinaryPublicId" character varying(255) NOT NULL,
                "url" character varying(1000) NOT NULL,
                "filename" character varying(255),
                "resourceType" "public"."media_resourcetype_enum" NOT NULL DEFAULT 'image',
                "folder" character varying(100),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_media_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."article_status_enum" AS ENUM('draft', 'published')
        `);
    await queryRunner.query(`
            CREATE TABLE "article" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(255) NOT NULL,
                "slug" character varying(255) NOT NULL,
                "excerpt" text,
                "contentHtml" text NOT NULL,
                "featuredImageUrl" character varying(255),
                "metaTitle" character varying(255),
                "metaDescription" text,
                "tags" text,
                "status" "public"."article_status_enum" NOT NULL DEFAULT 'draft',
                "published_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_0ab85f4be07b22d79906671d72f" UNIQUE ("slug"),
                CONSTRAINT "PK_article_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_article_slug" ON "article" ("slug")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_article_status" ON "article" ("status")
        `);
    await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_post_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD CONSTRAINT "FK_session_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "product_variant"
            ADD CONSTRAINT "FK_ca67dd080aac5ecf99609960cd2" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "order_item"
            ADD CONSTRAINT "FK_e9674a6053adbaa1057848cddfa" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "order_item"
            ADD CONSTRAINT "FK_6312e502a3cc8068671253bdbaf" FOREIGN KEY ("variant_id") REFERENCES "product_variant"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "order_item" DROP CONSTRAINT "FK_6312e502a3cc8068671253bdbaf"
        `);
    await queryRunner.query(`
            ALTER TABLE "order_item" DROP CONSTRAINT "FK_e9674a6053adbaa1057848cddfa"
        `);
    await queryRunner.query(`
            ALTER TABLE "product_variant" DROP CONSTRAINT "FK_ca67dd080aac5ecf99609960cd2"
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP CONSTRAINT "FK_session_user"
        `);
    await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_post_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_article_status"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."UQ_article_slug"
        `);
    await queryRunner.query(`
            DROP TABLE "article"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."article_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "media"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."media_resourcetype_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_order_created_at"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_order_status"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_order_payment_status"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."UQ_order_code"
        `);
    await queryRunner.query(`
            DROP TABLE "order"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."order_orderstatus_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."order_paymentstatus_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."order_paymentmethod_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_order_item_order_id"
        `);
    await queryRunner.query(`
            DROP TABLE "order_item"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_product_active"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."UQ_product_slug"
        `);
    await queryRunner.query(`
            DROP TABLE "product"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_product_variant_product_id"
        `);
    await queryRunner.query(`
            DROP TABLE "product_variant"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."UQ_user_email"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."UQ_user_username"
        `);
    await queryRunner.query(`
            DROP TABLE "user"
        `);
    await queryRunner.query(`
            DROP TABLE "session"
        `);
    await queryRunner.query(`
            DROP TABLE "post"
        `);
  }
}
