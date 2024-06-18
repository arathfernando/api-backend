import { getRepository, MigrationInterface, QueryRunner } from 'typeorm';
import { Setting } from '../entities';
import { allSettings } from './settings';

export class SEEDDATA1666963157955 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const settings = getRepository(Setting).create(allSettings);

    await getRepository(Setting).save(settings);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "settings"`);
  }
}
