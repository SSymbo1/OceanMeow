import Registry from 'winreg';
import { logger } from '@/main/util/Logger';

export class SystemRegedit {
  public static async getRegValue(
    hive: string,
    keyPath: string,
    namePath: string
  ): Promise<string | null> {
    return new Promise((resolve) => {
      const reg = new Registry({
        hive: hive,
        key: keyPath,
      });
      reg.get(namePath, (error, result) => {
        if (error) {
          logger.error('', error.message);
          resolve(null);
        } else {
          resolve(result.value);
        }
      });
    });
  }
}
