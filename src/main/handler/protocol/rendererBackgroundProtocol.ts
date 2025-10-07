import { protocol, net, app } from 'electron';
import { pathToFileURL } from 'url';
import { ApplicationResource } from '@/type/enum/Resource';
import { join } from 'path';

export function rendererBackgroundProtocol() {
  protocol.handle('background', (request) => {
    const fileName = request.url.replace(/^background:\/\//, '');
    const baseFolder = app.isPackaged
      ? join(process.resourcesPath, ApplicationResource.CACHE, ApplicationResource.IMAGE)
      : join(
          process.cwd(),
          ApplicationResource.FILE_ROOT,
          ApplicationResource.CACHE,
          ApplicationResource.IMAGE
        );
    const absPath = join(baseFolder, fileName);
    const fileUrl = pathToFileURL(absPath).toString();
    return net.fetch(fileUrl);
  });
}
