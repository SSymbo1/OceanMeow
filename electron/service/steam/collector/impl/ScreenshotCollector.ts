import { SteamDataCollector } from "#/service/steam/collector/SteamDataCollector";
import { Screenshots, SteamAccount } from "#/entity";
import { Steam } from "#/type/steam";
import { SystemDB } from "#/util/SystemDB";
import { SystemIO } from "#/util/SystemIO";
import { join } from "path";

interface VdfData {
    [key: string]: any;
}

export class ScreenshotCollector implements SteamDataCollector<Screenshots> {
    async collect(steamInstallPath: string): Promise<Screenshots[]> {
        const account = await SystemDB.getInstance().typeROM.getRepository(SteamAccount).find({
            select: ['steamId']
        });
        const screenShortRepo = SystemDB.getInstance().typeROM.getRepository(Screenshots);
        const allAccountScreenshot = await Promise.all(
            account.map(id => this.readAccoountScreenshots(
                id.steamId,
                steamInstallPath
            ))
        );
        const screenShorts: Screenshots[] = allAccountScreenshot.flat();
        for (let i = 0; i < screenShorts.length; i += 500) {
            const chunk = screenShorts.slice(i, i + 500);
            await screenShortRepo.save(chunk);
        }
        return screenShorts;
    }

    /**
     * 读取指定Steam账户的截图数据
     * 
     * @description 从Steam的VDF文件中读取指定用户的截图信息，并将其转换为Screenshots实体对象数组。
     * 该方法会解析Steam截图VDF文件，过滤出有效的应用ID和imported为1的截图，然后创建对应的数据库实体。
     * 
     * @param accountID - Steam用户账户ID，用于定位特定用户的截图文件
     * @param steamInstallPath - Steam安装路径，用于构建完整的VDF文件路径
     * 
     * @returns Promise<Screenshots[]> 返回一个Promise，解析为Screenshots实体对象数组
     * 
     * @throws 可能抛出文件读取异常或VDF解析异常
     * 
     * @private
     */
    private async readAccoountScreenshots(
        accountID: string,
        steamInstallPath: string
    ): Promise<Screenshots[]> {
        const screenShortRepo = SystemDB.getInstance()
            .typeROM.getRepository(Screenshots);

        const vdfResult: VdfData = await SystemIO.readSteamVDF(
            join(steamInstallPath, Steam.SCREENSHOT_VDF.replace('{user_id}', accountID)),
            'screenshots'
        );
        return Object.entries(vdfResult)
            .filter(([appID]) => !isNaN(Number(appID)))
            .flatMap(([appID, screenshotMap]) =>
                Object.entries(screenshotMap as Record<string, any>)
                    .filter(([, screenshot]) => screenshot?.imported !== 0)
                    .map(([idx, screenshot]) =>
                        screenShortRepo.create({
                            appId: appID,
                            userId: accountID,
                            screenIndex: Number(idx),
                            type: screenshot?.type,
                            fileName:
                                screenshot?.filename === null
                                    ? ''
                                    : join(
                                        Steam.SCREENSHOT.replace('{user_id}', accountID),
                                        screenshot.filename
                                    ),
                            thumbNail:
                                screenshot?.thumbnail === null
                                    ? ''
                                    : join(
                                        Steam.SCREENSHOT.replace('{user_id}', accountID),
                                        screenshot.thumbnail
                                    ),
                            imported: screenshot?.imported,
                            width: screenshot?.width,
                            height: screenshot?.height,
                            gameId: screenshot?.gameid,
                            creation: screenshot?.creation,
                            permission: screenshot?.Permissions,
                            screenshot: String(screenshot?.hscreenshot)
                        })
                    )
            );
    }

}