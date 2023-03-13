import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule, typeOrmOptions } from '../../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { useContainer } from 'class-validator';
// import * as cookieParser from 'cookie-parser'; // dev
import cookieParser from 'cookie-parser'; // deploy

export const getAppAndCleanDB = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [TypeOrmModule.forRoot(typeOrmOptions), AppModule],
  }).compile();
  const app: INestApplication = moduleFixture.createNestApplication();

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: false }));
  app.use(cookieParser());

  await app.init();
  const dataSource = await app.resolve(DataSource);
  await dataSource.query(`
        CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR) RETURNS void AS $$
DECLARE
    statements CURSOR FOR
        SELECT tablename FROM pg_tables
        WHERE tableowner = username AND schemaname = 'public';
BEGIN
    FOR stmt IN statements LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
    END LOOP;
END;
$$ LANGUAGE plpgsql;
SELECT truncate_tables('postgres');
SELECT truncate_tables('neondb'); 
        `);

  return app;
};
