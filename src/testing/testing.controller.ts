import { Controller, Delete, HttpCode } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('testing')
export class TestingController {
  constructor(
    // @InjectConnection() private readonly connection: Connection,
    private dataSource: DataSource,
  ) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteEntireDataInDb() {
    try {
      // await this.connection.db.dropDatabase();
      await this.dataSource.query(`
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
SELECT truncate_tables('fqidihfj');
SELECT truncate_tables('qTheSky'); 
SELECT truncate_tables('neondb'); 
        `);
      return;
    } catch (e) {
      console.log(e);
    }
  }
}
