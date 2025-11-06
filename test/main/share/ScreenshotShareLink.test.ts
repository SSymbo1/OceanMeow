import { ScreenshotShareLink } from '@/main/service/steam/share/impl/ScreenshotShareLink';
import { ScreenshotShare } from '@/main/entity';
import store from '@/main/server/handler/store';
import { ApplicationResource } from '@/type/enum/Resource';

jest.mock('@/main/server/handler/store', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

describe('ScreenshotShareLink', () => {
  let instance: ScreenshotShareLink;
  beforeEach(() => {
    jest.clearAllMocks();
    instance = new ScreenshotShareLink();
    (store.get as jest.Mock).mockReturnValue({
      ip: '127.0.0.1',
      port: '8080',
    });
  });

  describe('shareLinkGenerator', () => {
    it('should generate a valid share link and store the data', () => {
      const shareData = new ScreenshotShare();
      Object.assign(shareData, {
        appID: '12345',
        steamID: '76561198000000000',
        steamPath: 'C:/steam',
        screenIndex: ['1', '2'],
        timeStamp: '2025-11-05T12:00:00Z',
      });
      const link = instance.shareLinkGenerator(shareData);
      expect(store.get).toHaveBeenCalledWith('server');
      expect(store.set).toHaveBeenCalledTimes(1);
      const [key, value] = (store.set as jest.Mock).mock.calls[0];
      expect(value).toEqual(shareData);
      expect(key).toMatch(/^[a-zA-Z0-9]{10}$/);
      const expectedLink = ApplicationResource.SHARE_LINK.replace('{domain}', '127.0.0.1')
        .replace('{port}', '8080')
        .replace('{uuid}', key);
      expect(link).toBe(expectedLink);
    });
  });

  describe('randomString', () => {
    it('should return a string of the correct length', () => {
      const len = 15;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (instance as any).randomString(len);
      expect(result).toHaveLength(len);
    });

    it('should only contain valid characters', () => {
      const len = 100;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (instance as any).randomString(len);
      const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      expect(result).toMatch(new RegExp(`^[${validChars}]+$`));
    });
  });
});
