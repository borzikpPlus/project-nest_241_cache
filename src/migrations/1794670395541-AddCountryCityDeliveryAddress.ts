import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCountryCityDeliveryAddress1794670395541 implements MigrationInterface {
    name = 'AddCountryCityDeliveryAddress1794670395541'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "country" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "iso2" character varying(2) NOT NULL, "iso3" character varying(3) NOT NULL, CONSTRAINT "UQ_2c5aa339240c0c3ae97fcc9dc4c" UNIQUE ("name"), CONSTRAINT "UQ_b49a3cfa4a8ab50b388f893cd4c" UNIQUE ("iso2"), CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "city" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "country_id" integer NOT NULL, CONSTRAINT "UQ_126779d77483dfdeba4f9c40b72" UNIQUE ("name", "country_id"), CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "delivery_address" ("id" SERIAL NOT NULL, "street" character varying(100) NOT NULL, "house" character varying(20) NOT NULL, "apartment" character varying(20), "postal_code" character varying(10), "city_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "REL_b3f5e44969e03306862ac4616c" UNIQUE ("user_id"), CONSTRAINT "PK_00581098daef1f881bb3d17a0cd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "city" ADD CONSTRAINT "FK_08af2eeb576770524fa05e26f39" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery_address" ADD CONSTRAINT "FK_e2397f5aa5aba7ad8699f23acc9" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery_address" ADD CONSTRAINT "FK_b3f5e44969e03306862ac4616c6" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delivery_address" DROP CONSTRAINT "FK_b3f5e44969e03306862ac4616c6"`);
        await queryRunner.query(`ALTER TABLE "delivery_address" DROP CONSTRAINT "FK_e2397f5aa5aba7ad8699f23acc9"`);
        await queryRunner.query(`ALTER TABLE "city" DROP CONSTRAINT "FK_08af2eeb576770524fa05e26f39"`);
        await queryRunner.query(`DROP TABLE "delivery_address"`);
        await queryRunner.query(`DROP TABLE "city"`);
        await queryRunner.query(`DROP TABLE "country"`);
    }

}
