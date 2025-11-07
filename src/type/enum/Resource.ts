export enum ApplicationResource {
  FILE_ROOT = 'public',
  CACHE = 'cache',
  THUMB = 'thumb',
  IMAGE = 'image',
  DB_FILE = 'sud.db',
  CONFIG_FILE = 'application.json',
  FIREWALL_RULE = 'Application_Share_Port{port}',
  SHARE_LINK = 'http://{domain}:{port}/share/{uuid}',
}
export enum SteamResource {
  APPLICATION_VDF = '/appcache/appinfo.vdf',
  SCREENSHOT_VDF = '/userdata/{user_id}/760/screenshots.vdf',
  LOCAL_CONFIG_VDF = '/userdata/{user_id}/config/localconfig.vdf',
  LOGIN_USER_VDF = '/config/loginusers.vdf',
  INSTALLED_APPS_ACF = '/steamapps/appmanifest_{game_id}.acf',
  SCREENSHOT = '/userdata/{user_id}/760/remote/',
  AVATAR_CACHE = '/config/avatarcache',
  LIBRARY_COVER_CAP = '/appcache/librarycache',
  GAME_ACHIEVEMENT = '/appcache/stats/UserGameStats_{user_id}_{game_id}.bin',
  USER_GAME_ACHIEVEMENT = '/appcache/stats/UserGameStatsSchema_{game_id}.bin',
  LIB_PIC_FILE = 'library_600x900.jpg',
  LIB_PIC_FILE_LOCAL = 'library_600x900_schinese.jpg',
  LIB_PIC_FILE_CAP = 'library_capsule.jpg',
  LIB_PIC_FILE_CAP_LOCAL = 'library_capsule_schinese.jpg',
  LIB_PIC_HERO = 'library_hero.jpg',
  LIB_PIC_HERO_LOCAL = 'library_hero_schinese.jpg',
  LIB_PIC_LOGO = 'logo.png',
  LIB_PIC_LOGO_LOCAL = 'logo_schinese.png',
  ID_CONVERT = '76561197960265728',
}
export enum SteamGameSave {
  /**
   * 用户文档目录存档
   * 对应路径模板：<Documents>/<GamePath>
   * 解析逻辑：替换 p::WIN_DOCUMENTS 占位符为系统 Documents 路径
   * {documents_dir}：系统「文档」目录（如 C:/Users/<用户名>/Documents）
   */
  Documents = '{documents_dir}/{game_path}',

  /**
   * AppData/Roaming 目录存档
   * 对应路径模板：<AppData/Roaming>/<GamePath>
   * 解析逻辑：替换 p::WIN_APP_DATA 占位符为 %APPDATA%
   * {appdata_roaming}：%APPDATA% 路径（如 C:/Users/<用户名>/AppData/Roaming）
   */
  AppDataRoaming = '{appdata_roaming}/{game_path}',

  /**
   * AppData/Local 目录存档
   * 对应路径模板：<AppData/Local>/<GamePath>
   * 解析逻辑：替换 p::WIN_LOCAL_APP_DATA 占位符为 %LOCALAPPDATA%
   * {appdata_local}：%LOCALAPPDATA% 路径（如 C:/Users/<用户名>/AppData/Local）
   */
  AppDataLocal = '{appdata_local}/{game_path}',

  /**
   * AppData/LocalLow 目录存档
   * 对应路径模板：<AppData/LocalLow>/<GamePath>
   * 解析逻辑：替换 p::WIN_LOCAL_APP_DATA_LOW 占位符为 %LOCALAPPDATA%/Low
   */
  AppDataLocalLow = '{appdata_local_low}/{game_path}',

  /**
   *  Saved Games 目录存档
   * 对应路径模板：<SavedGames>/<GamePath>
   * 解析逻辑：通过 CommonPath::SavedGames 获取系统 Saved Games 路径
   * {saved_games_dir}：系统「保存的游戏」目录（如 C:/Users/<用户名>/Saved Games）
   */
  SavedGames = '{saved_games_dir}/{game_path}',

  /**
   * 游戏安装目录内存档
   * 对应路径模板：<GameInstallDir>/<RelativePath>
   * 解析逻辑：替换 p::BASE 占位符为游戏完整安装目录
   * {game_install_dir}：游戏安装根目录（如 C:/Steam/steamapps/common/<游戏名>）
   * {relative_path}：游戏安装目录内的相对路径（如 saves/）
   */
  InstallDir = '{game_install_dir}/{relative_path}',

  /**
   * 虚拟存储目录存档（权限兼容）
   * 对应路径模板：<VirtualStore>/<OriginalPath>
   * 解析逻辑：通过正则匹配 Program Files 路径并替换为 VirtualStore 路径
   * {virtual_store_dir}：虚拟存储目录（如 C:/Users/<用户名>/AppData/Local/VirtualStore）
   * {original_path}：原始受权限限制的路径（如 Program Files/<游戏名>/saves）
   */
  VirtualStore = '{virtual_store_dir}/{original_path}',

  /**
   * 公共文档目录存档
   * 对应路径模板：<Public>/<GamePath>
   * 解析逻辑：替换 p::WIN_PUBLIC 占位符为系统 Public 目录
   * {public_dir}：公共文档目录（如 C:/Users/Public）
   */
  PublicDocuments = '{public_dir}/{game_path}',

  /**
   * ProgramData 目录存档
   * 对应路径模板：<ProgramData>/<GamePath>
   * 解析逻辑：替换 p::WIN_PROGRAM_DATA 占位符为 C:/ProgramData
   * {program_data}：系统 ProgramData 目录（C:/ProgramData）
   */
  ProgramData = '{program_data}/{game_path}',
}
