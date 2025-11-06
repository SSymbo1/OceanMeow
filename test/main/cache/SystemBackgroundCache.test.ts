import { SystemBackgroundCache } from '@/main/service/system/cache/impl/SystemBackgroundCache';
import { ApplicationConfigHolder } from '@/main/service/system/config/impl/ApplicationConfigHolder';
import { BackgroundImage } from '@/main/entity';
import { app } from 'electron';
import { mkdirSync, readdirSync } from 'node:fs';
import { SystemImage } from '@/main/util/SystemImage';
import { join } from 'node:path';

/* ------------------ 依赖 Mock ------------------ */
interface ProcessWithResources extends NodeJS.Process {
  resourcesPath: string;
}
jest.mock('electron', () => ({
  app: {
    isPackaged: false, // 测试用开发路径
  },
}));
jest.mock('node:fs', () => ({
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(),
}));
jest.mock('valve-key-values-binary', () => ({
  default: jest.fn(),
}));
jest.mock('@/main/service/system/config/impl/ApplicationConfigHolder');
jest.mock('@/main/util/SystemImage');
beforeEach(() => {
  jest.clearAllMocks();
  (app.isPackaged as boolean) = false;
  /* 补上 Electron 专属的 resourcesPath */
  (process as ProcessWithResources).resourcesPath = '/mock/resources';
  (readdirSync as jest.Mock).mockReturnValue(mockImages);
  (ApplicationConfigHolder.prototype.read as jest.Mock).mockResolvedValue({
    homeBackground: 'old.webp',
  });
  (ApplicationConfigHolder.prototype.write as jest.Mock).mockResolvedValue(undefined);
  (SystemImage.removeFolderImageByDate as jest.Mock).mockResolvedValue(undefined);
  (SystemImage.imageCompress as jest.Mock).mockResolvedValue(undefined);
});

/* ------------------ 工具函数 ------------------ */
const mockImages = ['a.webp', 'b.webp'];
beforeEach(() => {
  jest.clearAllMocks();
  (app.isPackaged as boolean) = false; // 默认走开发分支
  (readdirSync as jest.Mock).mockReturnValue(mockImages);
  (ApplicationConfigHolder.prototype.read as jest.Mock).mockResolvedValue({
    homeBackground: 'old.webp',
  });
  (ApplicationConfigHolder.prototype.write as jest.Mock).mockResolvedValue(undefined);
  (SystemImage.removeFolderImageByDate as jest.Mock).mockResolvedValue(undefined);
  (SystemImage.imageCompress as jest.Mock).mockResolvedValue(undefined);
});

/* ------------------ 测试开始 ------------------ */
describe('SystemBackgroundCache', () => {
  let cache: SystemBackgroundCache;
  beforeEach(() => {
    cache = new SystemBackgroundCache();
  });
  describe('initApplicationCacheFolder', () => {
    it('should create <thumb> and <image> folder (recursion search)', async () => {
      await cache.initApplicationCacheFolder();
      expect(mkdirSync).toHaveBeenCalledTimes(2);
      expect(mkdirSync).toHaveBeenCalledWith(expect.stringContaining('thumb'), { recursive: true });
      expect(mkdirSync).toHaveBeenCalledWith(expect.stringContaining('image'), { recursive: true });
    });
  });

  describe('readApplicationCacheFiles', () => {
    it('should be read and mapped to <BackgroundImage> which in <thumb> folder when no file name is transferred', async () => {
      const res = await cache.readApplicationCacheFiles();
      expect(readdirSync).toHaveBeenCalledWith(cache.THUMB_PATH);
      expect(res).toHaveLength(2);
      expect(res[0]).toMatchObject<BackgroundImage>({
        fileName: 'a.webp',
        thumbName: 'a.webp',
        filePath: expect.stringContaining('image'),
        thumbPath: expect.stringContaining('thumb'),
      });
    });

    it('should only process a single file name when it is passed in', async () => {
      const res = await cache.readApplicationCacheFiles('single.webp');
      expect(readdirSync).not.toHaveBeenCalled();
      expect(res).toHaveLength(1);
      expect(res[0].fileName).toBe('single.webp');
    });
  });

  describe('writeApplicationCacheFiles', () => {
    const fakeFile = '/tmp/upload/origin.png';
    it('the old graph 3 days ago should be cleaned, compressed and written to thumb+image, and the configuration should be updated at the same time', async () => {
      const name = await cache.writeApplicationCacheFiles(fakeFile);
      // 清理旧图
      expect(SystemImage.removeFolderImageByDate).toHaveBeenCalledTimes(2);
      expect(SystemImage.removeFolderImageByDate).toHaveBeenCalledWith(cache.THUMB_PATH, 3);
      expect(SystemImage.removeFolderImageByDate).toHaveBeenCalledWith(cache.IMAGE_PATH, 3);
      // 压缩
      expect(SystemImage.imageCompress).toHaveBeenCalledTimes(2);
      expect(SystemImage.imageCompress).toHaveBeenCalledWith(fakeFile, cache.THUMB_PATH, 'webp', 1);
      expect(SystemImage.imageCompress).toHaveBeenCalledWith(
        fakeFile,
        cache.IMAGE_PATH,
        'webp',
        15
      );
      // 配置更新
      expect(ApplicationConfigHolder.prototype.write).toHaveBeenCalledWith({
        common: {
          homeBackground: 'origin.png',
        },
      });
      // 返回值
      expect(name).toBe('origin.webp');
    });
  });

  describe('path branch - packed resource path', () => {
    it('should use <process.resourcesPath> after packaging', () => {
      (app.isPackaged as boolean) = true;
      const prodCache = new SystemBackgroundCache();
      expect(prodCache.THUMB_PATH).toBe(join(process.resourcesPath, 'cache', 'thumb'));
      expect(prodCache.IMAGE_PATH).toBe(join(process.resourcesPath, 'cache', 'image'));
    });
  });
});
