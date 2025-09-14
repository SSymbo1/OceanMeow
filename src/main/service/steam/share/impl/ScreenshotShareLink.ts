import { ScreenshotShare } from '@/main/entity';
import { SteamShareLink } from '../SteamShareLink';
import { ApplicationResource } from '@/type/enum/Resource';
import store from '@/main/server/handler/store';
import crypto from 'crypto';

export class ScreenshotShareLink implements SteamShareLink<ScreenshotShare> {
  shareLinkGenerator(shareData: ScreenshotShare): string {
    const randomUID = this.randomString(10);
    const server = store.get('server');
    const shareLink = ApplicationResource.SHARE_LINK.replace('{domain}', server.ip)
      .replace('{port}', server.port)
      .replace('{uuid}', randomUID);
    store.set(randomUID, shareData);
    return shareLink;
  }
  private randomString(len: number) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let out = '';
    for (let i = 0; i < len; i++) {
      out += chars[crypto.randomInt(chars.length)];
    }
    return out;
  }
}
