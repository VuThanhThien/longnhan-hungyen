import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Inserts `category` rows from distinct legacy `product.category` values and sets
 * `product.category_id`. NOT NULL on `category_id` is deferred until API uses
 * `categoryId` on create/update (Phase 3).
 */
export class BackfillProductCategoryIds1776353600000 implements MigrationInterface {
  name = 'BackfillProductCategoryIds1776353600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$
            DECLARE
              r RECORD;
              s text;
              ord int := 0;
            BEGIN
              FOR r IN SELECT DISTINCT trim(both FROM category) AS raw FROM product ORDER BY 1
              LOOP
                s := COALESCE(
                  NULLIF(
                    trim(both '-' FROM lower(regexp_replace(r.raw, '[^a-z0-9]+', '-', 'gi'))),
                    ''
                  ),
                  'other'
                );
                IF NOT EXISTS (SELECT 1 FROM category WHERE slug = s) THEN
                  INSERT INTO category (id, slug, name, sort_order, active)
                  VALUES (uuid_generate_v4(), s, r.raw, ord, true);
                  ord := ord + 1;
                END IF;
              END LOOP;
            END $$
        `);

    await queryRunner.query(`
            UPDATE product AS p
            SET category_id = c.id
            FROM category AS c
            WHERE c.slug = COALESCE(
              NULLIF(
                trim(both '-' FROM lower(regexp_replace(trim(both FROM p.category), '[^a-z0-9]+', '-', 'gi'))),
                ''
              ),
              'other'
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE "product" SET "category_id" = NULL
        `);
    await queryRunner.query(`
            DELETE FROM "category"
        `);
  }
}
