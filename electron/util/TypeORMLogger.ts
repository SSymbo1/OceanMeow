import { Logger as TypeOrmLogger } from 'typeorm';
import { logger } from '#/util/Logger';

export class TypeOrmElectronLogger implements TypeOrmLogger {
    logQuery(query: string, parameters?: any[]) {
        logger.debug(`[SQL] ${query}`, { parameters });
    }

    logQueryError(error: string, query: string, parameters?: any[]) {
        logger.error(`[SQL ERROR] ${error}`, { query, parameters });
    }

    logQuerySlow(time: number, query: string, parameters?: any[]) {
        logger.warn(`[SLOW QUERY] ${time}ms`, { query, parameters });
    }

    logSchemaBuild(message: string) {
        logger.info(`[SCHEMA] ${message}`);
    }

    logMigration(message: string) {
        logger.info(`[MIGRATION] ${message}`);
    }

    log(level: 'log' | 'info' | 'warn', message: string) {
        switch (level) {
            case 'log':
                logger.verbose(`[TYPEORM] ${message}`);
                break;
            case 'info':
                logger.info(`[TYPEORM] ${message}`);
                break;
            case 'warn':
                logger.warn(`[TYPEORM] ${message}`);
                break;
        }
    }
}