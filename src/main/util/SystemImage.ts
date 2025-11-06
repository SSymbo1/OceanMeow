import sharp from 'sharp';
import { parse, join } from 'node:path';
import { readdirSync, promises as fs } from 'node:fs';

export class SystemImage {
  public static async imageCompress(
    originFile: string,
    outputFolder: string,
    imageType: 'webp' | 'jpeg',
    quality: number
  ): Promise<void> {
    const image = sharp(originFile);
    const { name } = parse(originFile);
    if (imageType === 'webp') {
      await image.webp({ quality: quality }).toFile(join(join(outputFolder, `${name}.webp`)));
    } else if (imageType === 'jpeg') {
      await image.jpeg({ quality: quality }).toFile(join(outputFolder, `${name}.jpeg`));
    }
  }

  public static async removeFolderImageByDate(folder: string, hold: number): Promise<void> {
    const files = readdirSync(folder, { withFileTypes: true })
      .filter((file) => file.isFile())
      .map((file) => join(folder, file.name));
    if (files.length + 1 <= hold) return;
    const sorted = await Promise.all(
      files.map(async (file) => ({
        path: file,
        birthtime: (await fs.stat(file)).birthtime,
      }))
    ).then((arr) => arr.sort((fir, sec) => fir.birthtime.getTime() - sec.birthtime.getTime()));
    await fs.unlink(sorted[0].path);
  }
}
