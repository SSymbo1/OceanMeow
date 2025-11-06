import fs from 'node:fs';
import path from 'node:path';
import { SystemIO } from '@/main/util/SystemIO';
import { ApplicationResource } from '@/type/enum/Resource';
import { ExceptionMessage } from '@/type/enum/Message';
import { logger } from '@/main/util/Logger';
import * as vkvb from 'valve-key-values-binary';
import * as vdf from '@node-steam/vdf';

/* -------------------- mock 依赖 -------------------- */
jest.mock('electron-log', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));
jest.mock('@/main/util/Logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));
jest.mock('electron', () => ({
  app: {
    isPackaged: false,
  },
}));
jest.mock('valve-key-values-binary', () => ({
  __esModule: true,
  default: {
    parse: jest.fn(),
  },
}));
jest.mock('@node-steam/vdf', () => ({
  parse: jest.fn(),
}));

/* -------------------- 工具函数 -------------------- */
const createTmpDir = () => fs.mkdtempSync(path.join(__dirname, 'tmp-'));
const cleanup = (dir: string) => fs.rmSync(dir, { recursive: true, force: true });

/* -------------------- 测试 -------------------- */
describe('main/util/SystemIO', () => {
  afterEach(() => jest.clearAllMocks());

  /* readFile ---------------------------------------------------------- */
  describe('readFile', () => {
    it('should return file content', async () => {
      const tmp = createTmpDir();
      const file = path.join(tmp, 'a.txt');
      fs.writeFileSync(file, 'hello');
      await expect(SystemIO.readFile(file)).resolves.toBe('hello');
      cleanup(tmp);
    });

    it('should log and return empty string when thow exception', async () => {
      const res = await SystemIO.readFile('/not/exist');
      expect(res).toBe('');
      expect(logger.error).toHaveBeenCalledWith(
        'Application IO Exception: ',
        expect.objectContaining({ message: expect.stringContaining('ENOENT') })
      );
    });
  });

  /* readApplicationConfig --------------------------------------------- */
  describe('readApplicationConfig', () => {
    it('should return correct key when run in dev mod', async () => {
      const tmp = createTmpDir();
      const configFile = path.join(tmp, ApplicationResource.CONFIG_FILE);
      fs.writeFileSync(configFile, JSON.stringify({ foo: 'bar' }));
      const originalJoin = path.join;
      jest
        .spyOn(path, 'join')
        .mockImplementation((...args) =>
          args.includes(ApplicationResource.CONFIG_FILE) ? configFile : originalJoin(...args)
        );

      await expect(SystemIO.readApplicationConfig('foo')).resolves.toBe('bar');
      cleanup(tmp);
      jest.restoreAllMocks();
    });

    it('should log and return <undefined> when throw exception', async () => {
      jest.spyOn(SystemIO, 'readFile').mockResolvedValueOnce('');
      await expect(SystemIO.readApplicationConfig('any')).resolves.toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith(ExceptionMessage.VDF_EXCEPTION, expect.any(Error));
    });
  });

  /* writeApplicationConfig -------------------------------------------- */
  describe('writeApplicationConfig', () => {
    it('should write file and sync save', () => {
      const tmp = createTmpDir();
      const configFile = path.join(tmp, ApplicationResource.CONFIG_FILE);
      const originalJoin = path.join;
      jest
        .spyOn(path, 'join')
        .mockImplementation((...args) =>
          args.includes(ApplicationResource.CONFIG_FILE) ? configFile : originalJoin(...args)
        );
      SystemIO.writeApplicationConfig({ foo: 'baz' });
      const content = fs.readFileSync(configFile, 'utf-8');
      expect(content).toBe(JSON.stringify({ foo: 'baz' }, null, 2));
      cleanup(tmp);
      jest.restoreAllMocks();
    });
  });

  /* readSteamVDF ------------------------------------------------------ */
  describe('readSteamVDF', () => {
    it('should parse currectly and return specified key', async () => {
      jest.spyOn(SystemIO, 'readFile').mockResolvedValueOnce('"shortcuts"{}');
      (vdf.parse as jest.Mock).mockReturnValueOnce({ shortcuts: { 1: 2 } });

      const res = await SystemIO.readSteamVDF('/fake.vdf', 'shortcuts');
      expect(res).toEqual({ 1: 2 });
    });

    it('should return <null> when read file fail', async () => {
      // 模拟readFile返回空内容（表示读取失败）
      jest.spyOn(SystemIO, 'readFile').mockResolvedValueOnce('');
      const res = await SystemIO.readSteamVDF('/fake.vdf');
      expect(res).toBeNull();
    });

    it('should log and return <null> when parse fail', async () => {
      jest.spyOn(SystemIO, 'readFile').mockResolvedValueOnce('bad');
      (vdf.parse as jest.Mock).mockImplementation(() => {
        throw new Error('bad vdf');
      });
      await expect(SystemIO.readSteamVDF('/fake.vdf')).resolves.toBeNull();
      expect(logger.error).toHaveBeenCalledWith(ExceptionMessage.VDF_EXCEPTION, expect.any(Error));
    });
  });

  /* readSteamAppinfoVDF ----------------------------------------------- */
  describe('readSteamAppinfoVDF', () => {
    it('should parse binary VDF file and return transformed json', async () => {
      const fakeBuffer = Buffer.from('fake');
      jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(fakeBuffer);
      const mockParse = { toJSON: () => ({ shortcuts: [] }) };
      (vkvb.default.parse as jest.Mock).mockReturnValueOnce(mockParse);
      const res = await SystemIO.readSteamAppinfoVDF('/appinfo.vdf');
      expect(res).toEqual({ shortcuts: [] });
    });

    it('should return <null> when read fail', async () => {
      // 使用try/catch确保错误被捕获并返回null
      jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
        throw new Error('enoent');
      });
      const res = await SystemIO.readSteamAppinfoVDF('/no');
      expect(res).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(ExceptionMessage.VDF_EXCEPTION, expect.any(Error));
    });
  });

  /* getFilePath ------------------------------------------------------- */
  describe('getFilePath', () => {
    it('should return target relative path', async () => {
      const tmp = createTmpDir();
      const sub = path.join(tmp, 'a', 'b');
      fs.mkdirSync(sub, { recursive: true });
      const target = path.join(sub, 'find.me');
      fs.writeFileSync(target, '');
      const rel = await SystemIO.getFilePath(tmp, 'find.me');
      expect(rel).toBe(path.join('a', 'b', 'find.me'));
      cleanup(tmp);
    });

    it('should try and turn the fallback file name', async () => {
      const tmp = createTmpDir();
      fs.writeFileSync(path.join(tmp, 'fallback.txt'), '');
      const rel = await SystemIO.getFilePath(tmp, 'notfound.txt', 'fallback.txt');
      expect(rel).toBe('fallback.txt');
      cleanup(tmp);
    });

    it('should return <null> when target folder unreached', async () => {
      const rel = await SystemIO.getFilePath('/no', 'any');
      expect(rel).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        'Application IO Exception: ',
        expect.objectContaining({ message: expect.stringContaining('ENOENT') })
      );
    });
  });
});
