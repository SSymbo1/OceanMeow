import type { SteamStatistics } from '@/type/electron/entity';
import { steamStore } from '../pinia/store/steam';

export async function homeStatistics(): Promise<SteamStatistics> {
  if (steamStore().accountId !== '') {
    return await window.electronAPI.homeStatisticsData(steamStore().accountId);
  } else {
    return {
      totalGames: 0,
      totalHoursPlayed: 0,
      totalScreenshots: 0,
      heroPictures: [],
      appNames: [],
    } as SteamStatistics;
  }
}
