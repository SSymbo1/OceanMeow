import { LocalContext } from '@/main/service/steam/context/impl/LocalContext';
import { SystemRegedit } from '@/main/util/SystemRegedit';
import { HKLM } from 'winreg';
import { execSync } from 'child_process';
import fs from 'node:fs';

/* ------------------ 类型安全的 mock ------------------ */
jest.mock('@/main/util/SystemRegedit', () => ({
  SystemRegedit: {
    getRegValue: jest.fn<Promise<string | null>, [string, string, string]>(),
  },
}));
jest.mock('node:fs', () => ({
  existsSync: jest.fn<boolean, [string]>(),
}));
jest.mock('child_process', () => ({
  execSync: jest.fn<Buffer, [string, { encoding: BufferEncoding; stdio: 'pipe' }]>(),
}));

/* ------------------ 工具类型 ------------------ */
const mockRegedit = SystemRegedit as jest.Mocked<typeof SystemRegedit>;
const mockFs = fs as jest.Mocked<typeof fs>;
const mockExec = execSync as jest.MockedFunction<typeof execSync>;

/* ------------------ 测试套件 ------------------ */
describe('LocalContext', () => {
  let ctx: LocalContext;
  beforeEach(() => {
    jest.clearAllMocks();
    ctx = new LocalContext();
  });
  describe('regGetSteamInstallPath', () => {
    it('should return path when reading the registry successfully', async () => {
      const steamPath = 'C:\\Program Files (x86)\\Steam';
      mockRegedit.getRegValue.mockResolvedValue(steamPath);
      const res = await ctx.regGetSteamInstallPath();
      expect(mockRegedit.getRegValue).toHaveBeenCalledWith(
        HKLM,
        '\\Software\\Wow6432Node\\Valve\\Steam',
        'InstallPath'
      );
      expect(res).toBe(steamPath);
    });

    it('should return null when the registry has no value', async () => {
      mockRegedit.getRegValue.mockResolvedValue(null);
      const res = await ctx.regGetSteamInstallPath();
      expect(res).toBeNull();
    });
  });

  describe('validateSteamInstallPath', () => {
    const steamPath = 'D:\\Steam';
    it('should return true when all files exist and the signature is valid', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockExec.mockReturnValue('Valid');
      const res = ctx.validateSteamInstallPath(steamPath);
      expect(mockFs.existsSync).toHaveBeenCalledTimes(3);
      expect(mockExec).toHaveBeenCalledTimes(3);
      expect(res).toBe(true);
    });

    it('should return false immediately when any file is missing', () => {
      mockFs.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(false); // 第二文件不存在
      const res = ctx.validateSteamInstallPath(steamPath);
      expect(mockFs.existsSync).toHaveBeenCalledTimes(2); // 提前退出
      expect(mockExec).not.toHaveBeenCalled();
      expect(res).toBe(false);
    });

    it('should return false when signature invalided', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockExec.mockReturnValue(Buffer.from('HashMismatch'));
      const res = ctx.validateSteamInstallPath(steamPath);
      expect(res).toBe(false);
    });

    it('should return false when PowerShell throw exception', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockExec.mockImplementation(() => {
        throw new Error('PS error');
      });
      const res = ctx.validateSteamInstallPath(steamPath);
      expect(res).toBe(false);
    });
  });
});
