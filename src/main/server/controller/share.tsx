import { Hono } from 'hono';
import { Brackets } from 'typeorm';
import { SystemDB } from '@/main/util/SystemDB';
import { ScreenDetail } from '@/main/entity';
import { ScreenshotShare } from '@/main/entity';
import { Readable } from 'stream';
import store from '@/main/server/handler/store';
import fs from 'fs';
import path from 'path';

export const share = new Hono();

share.get('/file/:shareLink/:index', async (c) => {
  const shareLink = c.req.param('shareLink');
  const screenIndex = c.req.param('index');
  const shareData = store.get(shareLink);
  const screenRepo = SystemDB.getInstance().typeROM.getRepository(ScreenDetail);
  const screen = await screenRepo
    .createQueryBuilder('detail')
    .where('detail.app_id = :app', { app: shareData.appID })
    .andWhere(
      new Brackets((condition) => {
        condition
          .andWhere('detail.steam_short_id = :account', { account: shareData.steamID })
          .andWhere('detail.screen_index = :index', { index: screenIndex });
      })
    )
    .getOne();
  const stream = fs.createReadStream(path.join(shareData.steamPath, screen?.screenFull ?? ''));
  return new Response(Readable.toWeb(stream) as any, {
    status: 200,
    headers: { 'Content-Type': 'image/jpeg' },
  });
});

share.get('/:shareLink', async (c) => {
  const shareLink = c.req.param('shareLink');
  const shareData: ScreenshotShare = store.get(shareLink);
  return c.html(
    <html lang="en">
      <head>
        <title>Application截图分享</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          {shareData.screenIndex.map((screen) => {
            return (
              <img
                src={`/share/file/${shareLink}/${screen}`}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            );
          })}
        </div>
      </body>
    </html>
  );
});
