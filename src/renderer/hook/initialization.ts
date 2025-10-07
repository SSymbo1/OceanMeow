import { steamStore } from '@/renderer/pinia/store/steam';
import { configStore } from '@/renderer/pinia/store/config';
import { libraryStore } from '@/renderer/pinia/store/library';

export async function applicationRendererInit(): Promise<boolean> {
  let loading = false;
  const [common, library] = await Promise.all([
    window.electronAPI.readApplicationConfig('common'),
    window.electronAPI.readApplicationConfig('library'),
  ]);
  configStore().$state = { ...common };
  libraryStore().$state = { ...library };
  const steamInstallPath = await window.electronAPI.steamRegInstallPath();
  if (steamInstallPath) {
    steamStore().installPath = steamInstallPath;
    await window.electronAPI.collectAccountData(steamInstallPath);
    await Promise.all([
      window.electronAPI.collectLibraryData(steamInstallPath),
      window.electronAPI.collectScreenshotData(steamInstallPath),
    ]);
    loading = true;
  }
  return loading;
}
