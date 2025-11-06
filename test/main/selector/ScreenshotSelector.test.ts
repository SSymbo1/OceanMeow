import { ScreenshotSelector } from '@/main/service/steam/selector/impl/ScreenshotSelector';
import { SystemDB } from '@/main/util/SystemDB';
import { ApplicationConfigHolder } from '@/main/service/system/config/impl/ApplicationConfigHolder';
import { ScreenDetail } from '@/main/entity';

interface MockQueryBuilder {
  where: jest.Mock;
  andWhere: jest.Mock;
  orderBy: jest.Mock;
  getMany: jest.Mock;
}
interface MockRepository {
  createQueryBuilder: jest.Mock<MockQueryBuilder>;
}
interface MockConfigHolder {
  read: jest.Mock;
}
// Mock dependencies
jest.mock('electron', () => ({
  app: {
    isPackaged: false,
  },
}));
jest.mock('valve-key-values-binary', () => ({
  default: jest.fn(),
}));
jest.mock('@/main/util/SystemDB');
jest.mock('@/main/service/system/config/impl/ApplicationConfigHolder');

describe('ScreenshotSelector', () => {
  let selector: ScreenshotSelector;
  let mockRepository: MockRepository;
  let mockQueryBuilder: MockQueryBuilder;
  let mockConfigHolder: MockConfigHolder;
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    // Setup mock query builder
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };
    // Setup mock repository
    mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };
    // Setup mock SystemDB
    (SystemDB.getInstance as jest.Mock).mockReturnValue({
      typeROM: {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      },
    });
    // Setup mock ApplicationConfigHolder
    mockConfigHolder = {
      read: jest.fn().mockResolvedValue({ screenSortOrder: true }),
    };
    (ApplicationConfigHolder as jest.Mock).mockImplementation(() => mockConfigHolder);
    selector = new ScreenshotSelector();
  });

  describe('search', () => {
    it('should search screenshots without keyword', async () => {
      const account = 'testAccount';
      const appID = 'testAppID';
      const expectedResult = [new ScreenDetail()];
      mockQueryBuilder.getMany.mockResolvedValue(expectedResult);
      const result = await selector.search(account, appID);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('detail');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('detail.steam_short_id = :id', {
        id: account,
      });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('detail.screen_creation', 'ASC');
      expect(result).toEqual(expectedResult);
    });

    it('should search screenshots with keyword', async () => {
      const account = 'testAccount';
      const appID = 'testAppID';
      const keyword = '2023-01-01';
      const expectedResult = [new ScreenDetail()];
      mockQueryBuilder.getMany.mockResolvedValue(expectedResult);
      const result = await selector.search(account, appID, keyword);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('detail');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('detail.steam_short_id = :id', {
        id: account,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('detail.screen_creation', 'ASC');
      expect(result).toEqual(expectedResult);
    });

    it('should handle DESC order when screenSortOrder is false', async () => {
      const account = 'testAccount';
      const appID = 'testAppID';
      const expectedResult = [new ScreenDetail()];
      mockConfigHolder.read.mockResolvedValue({ screenSortOrder: false });
      mockQueryBuilder.getMany.mockResolvedValue(expectedResult);
      await selector.search(account, appID);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('detail.screen_creation', 'DESC');
    });

    it('should handle empty result', async () => {
      const account = 'testAccount';
      const appID = 'testAppID';
      mockQueryBuilder.getMany.mockResolvedValue([]);
      const result = await selector.search(account, appID);
      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const account = 'testAccount';
      const appID = 'testAppID';
      const error = new Error('Database error');
      mockQueryBuilder.getMany.mockRejectedValue(error);
      await expect(selector.search(account, appID)).rejects.toThrow('Database error');
    });
  });
});
