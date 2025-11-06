import { SystemRegedit } from '@/main/util/SystemRegedit';
import Registry from 'winreg';
import { logger } from '@/main/util/Logger';

/* --------------  mock  -------------- */
jest.mock('winreg', () => {
  return jest.fn().mockImplementation((opts: ConstructorParameters<typeof Registry>[0]) => {
    void opts.hive;
    void opts.key;
    return {
      get: jest.fn((_name: string, cb: (err?: Error, result?: { value: string }) => void) => {
        cb(undefined, { value: '' });
      }),
    };
  });
});
jest.mock('@/main/util/Logger', () => ({
  logger: { error: jest.fn() },
}));

/* --------------  suites -------------- */
describe('SystemRegedit', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('#getRegValue', () => {
    const hive = 'HKLM';
    const keyPath = '\\SOFTWARE\\Foo';
    const namePath = 'Bar';

    it('should return value when key exists', async () => {
      const expected = 'baz';
      (Registry as unknown as jest.Mock).mockImplementationOnce(() => ({
        get: (_: string, cb: (err?: Error, result?: { value: string }) => void) =>
          cb(undefined, { value: expected }),
      }));
      const result = await SystemRegedit.getRegValue(hive, keyPath, namePath);
      expect(result).toBe(expected);
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should return null and log when registry access fails', async () => {
      const errMsg = 'Access denied';
      (Registry as unknown as jest.Mock).mockImplementationOnce(() => ({
        get: (_: string, cb: (err?: Error, result?: { value: string }) => void) =>
          cb(new Error(errMsg)),
      }));
      const result = await SystemRegedit.getRegValue(hive, keyPath, namePath);
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('', errMsg);
    });

    it('should construct Registry with correct hive and key', async () => {
      const RegistryMock = Registry as unknown as jest.Mock;
      RegistryMock.mockImplementation(() => ({
        get: (_: string, cb: (err?: Error, result?: { value: string }) => void) =>
          cb(undefined, { value: 'ok' }),
      }));
      await SystemRegedit.getRegValue(hive, keyPath, namePath);
      expect(RegistryMock).toHaveBeenCalledWith({ hive, key: keyPath });
    });
  });
});
