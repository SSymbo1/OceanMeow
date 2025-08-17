import { protocol, net } from 'electron';
import { pathToFileURL } from 'url';

export function rendererLoadFileProtocol() {
  protocol.handle('load', (request) => {
    const rawPath = request.url.replace(/^load:\/\//, '');
    const decodedPath = decodeURIComponent(rawPath);
    const fixedPath = decodedPath.replace(/^([A-Za-z])\//, '$1:/');
    const fileUrl = pathToFileURL(fixedPath).toString();
    return net.fetch(fileUrl);
  });
}
