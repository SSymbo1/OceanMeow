import { SteamDataStatistics } from '@/main/service/steam/statistics/impl/SteamDataStatistics';
import { SystemDB } from '@/main/util/SystemDB';
import { LibraryDetail, ScreenDetail } from '@/main/entity';
import { Repository } from 'typeorm';

jest.mock('@/main/util/SystemDB');
jest.mock('@/main/util/Logger', () => ({
  __esModule: true,
  Logger: {
    getInstance: jest.fn(() => ({
      initialize: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    })),
  },
}));

describe('SteamDataStatistics', () => {
  let service: SteamDataStatistics;
  let mockLibRepo: jest.Mocked<Repository<LibraryDetail>>;
  let mockScreenRepo: jest.Mocked<Repository<ScreenDetail>>;
  beforeEach(() => {
    jest.clearAllMocks();
    /* 1. 先创建真正的 jest.fn */
    const getRawOne = jest.fn();
    const findOne = jest.fn();
    /* 2. 组装成链式 mock */
    mockLibRepo = {
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne,
      })),
      findOne,
    } as unknown as jest.Mocked<Repository<LibraryDetail>>;
    mockScreenRepo = {
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne,
      })),
      findOne,
    } as unknown as jest.Mocked<Repository<ScreenDetail>>;

    (SystemDB.getInstance as jest.Mock).mockReturnValue({
      typeROM: {
        getRepository: jest
          .fn()
          .mockImplementation((entity) =>
            entity === LibraryDetail ? mockLibRepo : mockScreenRepo
          ),
      },
    });
    service = new SteamDataStatistics();
  });

  describe('accountDataStatistics', () => {
    it('should return zero statistics when account has no data', async () => {
      const getRawOne = mockLibRepo.createQueryBuilder().getRawOne as jest.Mock;
      getRawOne
        .mockResolvedValueOnce({ totalGames: null })
        .mockResolvedValueOnce({ totalHours: null });
      (mockScreenRepo.createQueryBuilder().getRawOne as jest.Mock).mockResolvedValueOnce({
        totalScreen: null,
      });
      jest
        .spyOn(service, 'gameScreenStatistics')
        .mockResolvedValueOnce({ pictures: [], names: [] });
      const res = await service.accountDataStatistics('acc123');
      expect(res).toEqual({
        totalGames: 0,
        totalHoursPlayed: 0,
        totalScreenshots: 0,
        heroPictures: [],
        appNames: [],
      });
    });

    it('should return correct aggregated values', async () => {
      // 拿出同一个 getRawOne 引用
      const getRawOne = mockLibRepo.createQueryBuilder().getRawOne as jest.Mock;
      getRawOne
        .mockResolvedValueOnce({ totalGames: '42' })
        .mockResolvedValueOnce({ totalHours: '123.5' });
      (mockScreenRepo.createQueryBuilder().getRawOne as jest.Mock).mockResolvedValueOnce({
        totalScreen: '99',
      });
      jest.spyOn(service, 'gameScreenStatistics').mockResolvedValueOnce({
        pictures: ['hero1.jpg', 'hero2.jpg'],
        names: ['Foo', 'Bar'],
      });
      const res = await service.accountDataStatistics('acc123');
      expect(res).toEqual({
        totalGames: 42,
        totalHoursPlayed: 123.5,
        totalScreenshots: 99,
        heroPictures: ['hero1.jpg', 'hero2.jpg'],
        appNames: ['Foo', 'Bar'],
      });
    });
  });

  describe('gameScreenStatistics', () => {
    it('should filter out null games and return unique heroes/names', async () => {
      const mostPlayed = { appHero: 'most.jpg', appName: 'MostPlayed' } as LibraryDetail;
      const mostScreen = { appHero: 'screen.jpg', appName: 'MostScreen' } as LibraryDetail;
      const latestShotGame = null;
      const recentPlayed = { appHero: 'recent.jpg', appName: 'Recent' } as LibraryDetail;
      mockLibRepo.findOne
        .mockResolvedValueOnce(mostPlayed)
        .mockResolvedValueOnce(mostScreen)
        .mockResolvedValueOnce(latestShotGame)
        .mockResolvedValueOnce(recentPlayed);
      mockScreenRepo.findOne.mockResolvedValueOnce({ appId: '100' } as ScreenDetail);
      const res = await service.gameScreenStatistics('acc123');
      expect(res).toEqual({
        pictures: ['most.jpg', 'screen.jpg', 'recent.jpg'],
        names: ['MostPlayed', 'MostScreen', 'Recent'],
      });
    });

    it('should return empty arrays when no games found', async () => {
      mockLibRepo.findOne.mockResolvedValue(null);
      mockScreenRepo.findOne.mockResolvedValue(null);
      const res = await service.gameScreenStatistics('acc123');
      expect(res).toEqual({ pictures: [], names: [] });
    });
  });
});
