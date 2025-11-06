// import { LibraryCollector } from '@/main/service/steam/collector/impl/LibraryCollector';
// import { SystemDB } from '@/main/util/SystemDB';
// import { SystemIO } from '@/main/util/SystemIO';
// import { Steam } from '@/type/enum/steam';
import { Library, LibraryTime, SteamAccount } from '@/main/entity';
// import fs from 'fs';
// import pLimit from 'p-limit';

const libraryRepoCreate = jest.fn();
const libraryRepoSave = jest.fn();
const libraryTimeRepoSave = jest.fn();
jest.mock('@/main/util/SystemDB', () => ({
  SystemDB: {
    getInstance: () => ({
      typeROM: {
        getRepository: (entity: unknown) => {
          if (entity === Library) return { create: libraryRepoCreate, save: libraryRepoSave };
          if (entity === LibraryTime) return { save: libraryTimeRepoSave };
          if (entity === SteamAccount) return { find: jest.fn() };
          return {};
        },
      },
    }),
  },
}));
jest.mock('@/main/util/SystemIO', () => ({
  SystemIO: { readSteamVDF: jest.fn(), readSteamAppinfoVDF: jest.fn(), getFilePath: jest.fn() },
}));
jest.mock('fs');
jest.mock(
  'p-limit',
  () =>
    () =>
    <T>(fn: () => Promise<T>) =>
      fn()
);
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: (...args: string[]) => args.join('/'),
}));
jest.mock('@/type/enum/resource', () => ({
  SteamResource: {
    LOCAL_CONFIG_VDF: '/userdata/{user_id}/config/localconfig.vdf',
    LIBRARY_COVER_CAP: '/appcache/librarycache',
    APPLICATION_VDF: '/appcache/appinfo.vdf',
    LIB_PIC_FILE: 'library_600x900.jpg',
    LIB_PIC_FILE_LOCAL: 'library_600x900_schinese.jpg',
    LIB_PIC_FILE_CAP: 'library_capsule.jpg',
    LIB_PIC_FILE_CAP_LOCAL: 'library_capsule_schinese.jpg',
    LIB_PIC_HERO: 'library_hero.jpg',
    LIB_PIC_HERO_LOCAL: 'library_hero_schinese.jpg',
    LIB_PIC_LOGO: 'logo.png',
    LIB_PIC_LOGO_LOCAL: 'logo_schinese.png',
  },
}));

describe('LibraryCollector', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('read normal localconfig.vdf,appinfo.vdf and transform to typeORM entity for save', async () => {});
  it('read empty localconfig.vdf,appinfo.vdf and transform to typeORM entity for save', async () => {});
  it('read huge(5000,100k) localconfig.vdf,appinfo.vdf and transform to typeORM entity for save', async () => {});
});
