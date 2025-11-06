/* eslint-disable @typescript-eslint/no-explicit-any */
import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { SystemImage } from '@/main/util/SystemImage';

jest.mock('sharp', () =>
  jest.fn(() => ({
    webp: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    toFile: jest.fn().mockResolvedValue(undefined),
  }))
);
jest.mock('node:fs', () => ({
  readdirSync: jest.fn(),
  promises: {
    stat: jest.fn(),
    unlink: jest.fn(),
  },
}));

const mockedReaddirSync = readdirSync as jest.MockedFunction<typeof readdirSync>;
const mockedFsStat = fs.stat as jest.MockedFunction<typeof fs.stat>;
const mockedFsUnlink = fs.unlink as jest.MockedFunction<typeof fs.unlink>;
const mockSharpInstance = {
  webp: jest.fn().mockReturnThis(),
  jpeg: jest.fn().mockReturnThis(),
  toFile: jest.fn().mockResolvedValue(undefined),
};
jest.mock('sharp', () => jest.fn(() => mockSharpInstance));

describe('SystemImage', () => {
  beforeEach(() => jest.clearAllMocks());
  describe('imageCompress', () => {
    it('<webp> transform branch', async () => {
      await SystemImage.imageCompress('/tmp/a.png', '/out', 'webp', 80);
      expect(sharp).toHaveBeenCalledWith('/tmp/a.png');
      expect(mockSharpInstance.webp).toHaveBeenCalledWith({ quality: 80 });
      expect(mockSharpInstance.toFile).toHaveBeenCalledWith(join('/out', 'a.webp')); // ✅
    });

    it('<jpeg> transform branch', async () => {
      await SystemImage.imageCompress('/tmp/b.png', '/out', 'jpeg', 90);
      expect(sharp).toHaveBeenCalledWith('/tmp/b.png');
      expect(mockSharpInstance.jpeg).toHaveBeenCalledWith({ quality: 90 });
      expect(mockSharpInstance.toFile).toHaveBeenCalledWith(join('/out', 'b.jpeg')); // ✅
    });
  });

  describe('removeFolderImageByDate', () => {
    beforeEach(() => {
      mockedReaddirSync.mockReturnValue([
        { name: '1.webp', isFile: () => true },
        { name: '2.webp', isFile: () => true },
        { name: '3.webp', isFile: () => true },
      ] as any);
    });

    it('should not delete the picture when file count small then hold count', async () => {
      mockedFsStat.mockResolvedValue({ birthtime: new Date('2023-01-01') } as any);
      await SystemImage.removeFolderImageByDate('/img', 4); // 4 > 3
      expect(mockedFsUnlink).not.toHaveBeenCalled();
    });

    it('should delete the oldest file', async () => {
      mockedFsStat
        .mockResolvedValueOnce({ birthtime: new Date('2023-01-01') } as any)
        .mockResolvedValueOnce({ birthtime: new Date('2023-01-02') } as any)
        .mockResolvedValueOnce({ birthtime: new Date('2023-01-03') } as any);
      await SystemImage.removeFolderImageByDate('/img', 2);
      expect(mockedFsUnlink).toHaveBeenCalledTimes(1);
      expect(mockedFsUnlink).toHaveBeenCalledWith(join('/img', '1.webp'));
    });
  });
});
