import { ScreenshotShare } from '@/main/entity';
import { SteamShareLink } from '../SteamShareLink';
import { ApplicationResource } from '@/type/enum/Resource';
import store from '@/main/server/handler/store';
import crypto from 'crypto';

export class ScreenshotShareLink implements SteamShareLink<ScreenshotShare> {
  /**
   * 生成截图分享链接
   * @param {ScreenshotShare} shareData - 分享数据对象，包含截图相关信息
   * @returns {string} 返回生成的分享链接
   * @description 该方法通过以下步骤生成分享链接：
   * 1. 生成一个10位的随机UID作为分享标识
   * 2. 从store中获取服务器配置信息
   * 3. 使用服务器信息和随机UID构建完整的分享链接
   * 4. 将分享数据存储到store中，以随机UID为键
   * 5. 返回生成的分享链接
   */
  shareLinkGenerator(shareData: ScreenshotShare): string {
    const randomUID = this.randomString(10);
    const server = store.get('server');
    const shareLink = ApplicationResource.SHARE_LINK.replace('{domain}', server.ip)
      .replace('{port}', server.port)
      .replace('{uuid}', randomUID);
    store.set(randomUID, shareData);
    return shareLink;
  }

  /**
   * 生成指定长度的随机字符串
   * @param {number} len - 要生成的随机字符串的长度
   * @returns {string} 返回生成的随机字符串
   * @description 该方法使用crypto.randomInt生成随机数，
   * 从预定义的字符集中选取字符组成随机字符串。
   * 字符集包含数字(0-9)、大写字母(A-Z)和小写字母(a-z)。
   * 例如：randomString(5) 可能返回 "A3fB8"
   */
  private randomString(len: number) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let out = '';
    for (let i = 0; i < len; i++) {
      out += chars[crypto.randomInt(chars.length)];
    }
    return out;
  }
}
