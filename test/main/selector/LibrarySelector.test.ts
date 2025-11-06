import { LibrarySelector } from '@/main/service/steam/selector/impl/LibrarySelector';
import { SystemDB } from '@/main/util/SystemDB';
import { ApplicationConfigHolder } from '@/main/service/system/config/impl/ApplicationConfigHolder';

interface MockQueryBuilder {
  where: jest.Mock;
  andWhere: jest.Mock;
  orderBy: jest.Mock;
  getMany: jest.Mock;
}
interface MockRepository {
  createQueryBuilder: jest.Mock<MockQueryBuilder>;
}
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

describe('LibrarySelector', () => {
  let librarySelector: LibrarySelector;
  let mockRepository: MockRepository;
  let mockQueryBuilder: MockQueryBuilder;
  let mockConfigRead: jest.Mock; // 提取配置读取的 mock 函数
  beforeEach(() => {
    jest.clearAllMocks();
    // 初始化 mock 查询构建器
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          steam_short_id: 'test123',
          app_id: '123',
          app_name: 'Test Game',
          app_localized: '测试游戏',
          screenCount: 10,
          timeHour: 100,
          lastPlay: new Date(),
        },
      ]),
    };
    mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };
    // 模拟 SystemDB
    (SystemDB.getInstance as jest.Mock).mockReturnValue({
      typeROM: {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      },
    });
    // 提取配置读取的 mock 函数，方便后续修改返回值
    mockConfigRead = jest.fn().mockResolvedValue({
      librarySort: '0',
      librarySortOrder: true,
    });
    // 模拟 ApplicationConfigHolder，使用统一的 read 方法
    (ApplicationConfigHolder as jest.Mock).mockImplementation(() => ({
      read: mockConfigRead,
    }));
    // 创建测试对象
    librarySelector = new LibrarySelector();
  });

  describe('search', () => {
    it('should search library details without keyword', async () => {
      const result = await librarySelector.search('test123');
      expect(result).toHaveLength(1);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('detail');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('detail.steam_short_id = :id', {
        id: 'test123',
      });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('detail.screenCount', 'ASC');
    });

    it('should search library details with keyword', async () => {
      const result = await librarySelector.search('test123', 'Test');
      expect(result).toHaveLength(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should sort by timeHour when librarySort is 1', async () => {
      // 修改配置返回值：librarySort 为 1
      mockConfigRead.mockResolvedValueOnce({
        librarySort: '1',
        librarySortOrder: true,
      });
      await librarySelector.search('test123');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('detail.timeHour', 'ASC');
    });

    it('should sort by lastPlay when librarySort is neither 0 nor 1', async () => {
      // 修改配置返回值：librarySort 为 2（非 0/1）
      mockConfigRead.mockResolvedValueOnce({
        librarySort: '2',
        librarySortOrder: true,
      });
      await librarySelector.search('test123');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('detail.lastPlay', 'ASC');
    });

    it('should sort in descending order when librarySortOrder is false', async () => {
      // 修改配置返回值：librarySortOrder 为 false（降序）
      mockConfigRead.mockResolvedValueOnce({
        librarySort: '0',
        librarySortOrder: false,
      });
      await librarySelector.search('test123');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('detail.screenCount', 'DESC');
    });
  });
});
