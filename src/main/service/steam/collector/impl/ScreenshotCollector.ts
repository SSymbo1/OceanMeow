import { SteamDataCollector } from '@/main/service/steam/collector/SteamDataCollector';
import { Screenshots, SteamAccount } from '@/main/entity';
import { SteamResource } from '@/type/enum/Resource';
import { SystemDB } from '@/main/util/SystemDB';
import { SystemIO } from '@/main/util/SystemIO';
import { join } from 'node:path';
import pLimit from 'p-limit';

interface VdfData {
  [key: string]: any;
}

export class ScreenshotCollector implements SteamDataCollector<Screenshots> {
  /**
   * 收集所有Steam账户的截图并保存到数据库
   * @param {string} steamInstallPath - Steam安装路径
   * @returns {Promise<Screenshots[]>} 返回所有收集到的截图对象数组
   * @throws {Error} 当数据库操作失败时可能抛出错误
   * @example
   * const screenshots = await collector.collect('C:\\Program Files (x86)\\Steam');
   * console.log(`共收集了 ${screenshots.length} 张截图`);
   * @remarks
   * 该方法会执行以下操作：
   * 1. 从数据库获取所有Steam账户的ID
   * 2. 使用pLimit限制并发数(10)读取每个账户的截图
   * 3. 将所有截图数据扁平化处理
   * 4. 分批(每批500条)保存截图数据到数据库
   * 5. 返回所有收集到的截图对象
   */
  async collect(steamInstallPath: string): Promise<Screenshots[]> {
    const limit = pLimit(10);
    const account = await SystemDB.getInstance()
      .typeROM.getRepository(SteamAccount)
      .find({
        select: ['steamId'],
      });
    const screenShotRepo = SystemDB.getInstance().typeROM.getRepository(Screenshots);
    const allAccountScreenshot = await Promise.all(
      account.map((id) =>
        limit(async () => this.readAccountScreenshots(id.steamId, steamInstallPath))
      )
    );
    const screenShots: Screenshots[] = allAccountScreenshot.flat();
    for (let i = 0; i < screenShots.length; i += 500) {
      const chunk = screenShots.slice(i, i + 500);
      await screenShotRepo.save(chunk);
    }
    return screenShots;
  }

  /**
   * 读取指定账户的Steam截图信息
   * @private 私有方法，仅限类内部使用
   * @async 异步方法，返回Promise
   * @param {string} accountID - Steam账户ID
   * @param {string} steamInstallPath - Steam安装路径
   * @returns {Promise<Screenshots[]>} 返回截图信息数组
   * @description 该方法执行以下步骤：
   * 1. 从数据库获取截图仓库实例
   * 2. 读取Steam VDF文件中的截图数据
   * 3. 过滤并处理截图信息，创建截图实体
   * 4. 返回处理后的截图信息数组
   * @throws {Error} 当读取VDF文件或处理数据时可能出现错误
   */
  private async readAccountScreenshots(
    accountID: string,
    steamInstallPath: string
  ): Promise<Screenshots[]> {
    const screenShotRepo = SystemDB.getInstance().typeROM.getRepository(Screenshots);
    const vdfResult: VdfData = await SystemIO.readSteamVDF(
      join(steamInstallPath, SteamResource.SCREENSHOT_VDF.replace('{user_id}', accountID)),
      'screenshots'
    );
    return Object.entries(vdfResult)
      .filter(([appID]) => !isNaN(Number(appID)))
      .flatMap(([appID, screenshotMap]) =>
        Object.entries(screenshotMap as Record<string, any>)
          .filter(([, screenshot]) => screenshot?.imported !== 0)
          .map(([idx, screenshot]) =>
            screenShotRepo.create({
              appId: appID,
              userId: accountID,
              screenIndex: Number(idx),
              type: screenshot?.type,
              fileName:
                screenshot?.filename === null
                  ? ''
                  : join(
                      SteamResource.SCREENSHOT.replace('{user_id}', accountID),
                      screenshot.filename
                    ),
              thumbNail:
                screenshot?.thumbnail === null
                  ? ''
                  : join(
                      SteamResource.SCREENSHOT.replace('{user_id}', accountID),
                      screenshot.thumbnail
                    ),
              imported: screenshot?.imported,
              width: screenshot?.width,
              height: screenshot?.height,
              gameId: screenshot?.gameid,
              creation: screenshot?.creation,
              permission: screenshot?.Permissions,
              screenshot: String(screenshot?.hscreenshot),
            })
          )
      );
  }
}
