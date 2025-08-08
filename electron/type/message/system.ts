export enum System {
    APP_RUN = "Application start successfully!",
    SYSTEM_IO_ERROR = "System IO error:",
    SEQUELIZE_EXIST = "exist a living sequelize connection!",
    SEQUELIZE_NOT_EXIST = "call SystemDB.initDB() first!",
    SEQUELIZE_CONNECT_ERROR = "database connection error:",
    READ_CONFIG_ERROR = "read config file error:",
    STEAM_REGEDIT_ERROR = "read steam install path from registry error!",
    STEAM_REGEDIT_SUCCESS = "read steam install path from registry successfully!",
    VDF_READ_ERROR = "read vdf file error:",
    COLLECT_DATA = "Application collect data count:",
}