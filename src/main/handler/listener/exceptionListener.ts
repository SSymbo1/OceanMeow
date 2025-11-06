import { logger } from '@/main/util/Logger';

export function uncaughtExceptionListener() {
  process.on('uncaughtException', (error) => {
    logger.error('', error);
  });
}
export function unhandledRejectionListener() {
  process.on('unhandledRejection', (error) => {
    logger.error('', error);
  });
}
