// test/main/db/TypeOrmElectronLogger.test.ts
import { TypeOrmElectronLogger } from '@/main/util/TypeORMLogger';
import { logger } from '@/main/util/Logger';

/* --------------  mock  -------------- */
jest.mock('@/main/util/Logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    verbose: jest.fn(),
  },
}));

/* --------------  suites -------------- */
describe('TypeOrmElectronLogger', () => {
  let sut: TypeOrmElectronLogger;

  beforeEach(() => {
    sut = new TypeOrmElectronLogger();
    jest.clearAllMocks();
  });

  describe('#logQuery', () => {
    it('should log SQL with parameters', () => {
      const query = 'SELECT 1';
      const parameters = [42];
      sut.logQuery(query, parameters);
      expect(logger.debug).toHaveBeenCalledWith('[SQL] SELECT 1', { parameters });
    });

    it('should log SQL without parameters', () => {
      sut.logQuery('UPDATE foo');
      expect(logger.debug).toHaveBeenCalledWith('[SQL] UPDATE foo', { parameters: undefined });
    });
  });

  describe('#logQueryError', () => {
    it('should log error context', () => {
      sut.logQueryError('syntax error', 'SELECT *', ['a']);
      expect(logger.error).toHaveBeenCalledWith('[SQL ERROR] syntax error', {
        query: 'SELECT *',
        parameters: ['a'],
      });
    });
  });

  describe('#logQuerySlow', () => {
    it('should warn when query exceeds threshold', () => {
      sut.logQuerySlow(1500, 'SELECT * FROM big_table', []);
      expect(logger.warn).toHaveBeenCalledWith('[SLOW QUERY] 1500ms', {
        query: 'SELECT * FROM big_table',
        parameters: [],
      });
    });
  });

  describe('#logSchemaBuild', () => {
    it('should info schema message', () => {
      sut.logSchemaBuild('Table foo created');
      expect(logger.info).toHaveBeenCalledWith('[SCHEMA] Table foo created');
    });
  });

  describe('#logMigration', () => {
    it('should info migration message', () => {
      sut.logMigration('Migration 001 up');
      expect(logger.info).toHaveBeenCalledWith('[MIGRATION] Migration 001 up');
    });
  });

  describe('#log', () => {
    it.each([
      { level: 'log' as const, spy: logger.verbose, prefix: '[TYPEORM]' },
      { level: 'info' as const, spy: logger.info, prefix: '[TYPEORM]' },
      { level: 'warn' as const, spy: logger.warn, prefix: '[TYPEORM]' },
    ])('should handle level $level', ({ level, spy, prefix }) => {
      sut.log(level, 'hello');
      expect(spy).toHaveBeenCalledWith(`${prefix} hello`);
    });
  });
});
