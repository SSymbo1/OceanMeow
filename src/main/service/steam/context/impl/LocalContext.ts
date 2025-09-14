import { SteamContext } from '@/main/service/steam/context/SteamContext';
import { SystemRegedit } from '@/main/util/SystemRegedit';
import { HKLM } from 'winreg';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// 这个也只支持windows平台后续需要扩展跨平台
export class LocalContext implements SteamContext {
  private readonly steamRegeditPath = {
    hive: HKLM,
    keyPath: '\\Software\\Wow6432Node\\Valve\\Steam',
    valueName: 'InstallPath',
  };
  private readonly steamValidateFile = {
    exe: 'steam.exe',
    client: 'steamclient.dll',
    dll: 'tier0_s.dll',
  };

  regGetSteamInstallPath(): Promise<string | null> {
    return SystemRegedit.getRegValue(
      this.steamRegeditPath.hive,
      this.steamRegeditPath.keyPath,
      this.steamRegeditPath.valueName
    );
  }
  validateSteamInstallPath(steamPath: string): boolean {
    for (const file of Object.values(this.steamValidateFile)) {
      const full = path.join(steamPath, file);
      if (!fs.existsSync(full)) return false;
    }
    try {
      for (const file of Object.values(this.steamValidateFile)) {
        const full = path.join(steamPath, file);
        const ps = execSync(
          `powershell -NoProfile -Command "Get-AuthenticodeSignature -LiteralPath '${full}' | Select-Object -ExpandProperty Status"`,
          { encoding: 'utf8', stdio: 'pipe' }
        ).trim();
        if (ps !== 'Valid') return false;
      }
    } catch {
      return false;
    }
    return true;
  }
}
