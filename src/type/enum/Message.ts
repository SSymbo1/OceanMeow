export enum CommonMessage {
  APPLICATION_START = 'Application Start Successfully At PID: {pid}',
  APPLICATION_CLOSE = 'Application Release Resource And Close',
  SERVER_START = 'Web Server Start At http://{domain}:{port}',
  SERVER_CLOSE = 'Web Server Stopped',
  HANDLE_FIREWALL = 'Application Exit For Handle Firewall Rule',
  FIREWALL_RULE_EXIST = 'Firewall Rule: {rule} Exist Skip Create',
  FIREWALL_RULE_CREATE = 'Firewall Rule: {rule} Add Successfully',
}
export enum ExceptionMessage {
  IO_EXCEPTION = 'Application IO Exception: ',
  DB_EXCEPTION = 'Application Database Or ORM Exception: ',
  CONFIG_EXCEPTION = 'Application Config Exception: ',
  REGEDIT_EXCEPTION = 'Application Regedit Exception: ',
  VDF_EXCEPTION = 'Application VDF Exception: ',
  DUMP_EXCEPTION = 'Application Dump Exception: ',
  INC_EXCEPTION = 'Application Inc Exception: ',
  FIREWALL_ADD_EXCEPTION = 'Application Firewall Rule Add Exception: ',
  FILE_NOT_EXIST_EXCEPTION = 'File: {file} Not Exist',
  PERMISSION_REQUEST_FAIL = 'Permission Request Fail: ',
}
export enum AlertMessage {
  DB_CONNECTION_EXIST_ALERT = 'Exist Living Database Connection Skip Instantiation',
  DB_CONNECTION_NOT_EXIST_ALERT = 'Living Database Connection Not Found',
}
export enum ExchangeMessage {
  CONFIRM = '确认',
  CANCEL = '取消',
  SET_FAIL = '配置失败',
  SELECT_FILE = '请选择文件',
  SELECT_LOCATION = '请选择位置',
  ASK_FIREWALL_PERMISSION_TITLE = '防火墙配置',
  ASK_FIREWALL_PERMISSION_MESSAGE = '需要管理员权限以配置防火墙入站规则',
  ASK_FIREWALL_PERMISSION_DETAIL = '应用需要在防火墙中开放入站端口 {port} 以用于在局域网中提供网络服务，如局域网内分享截图功能。\n点击"确认"将以管理员权限完成此操作。\n此操作可能会出现用户账户控制(UAC)警告，或被某些杀毒软件拦截。请在弹出的窗口中允许本次操作。',
  ASK_FIREWALL_PERMISSION_DENIED = '您取消了防火墙配置。网络服务功能可能无法正常工作。',
  PERMISSION_REQUEST_FAIL = '权限请求失败',
  ADD_FIREWALL_RULE_FAIL = '添加防火墙规则时出错，请尝试手动以管理员身份运行应用。',
  PERMISSION_REQUEST_FAIL_DETAIL = '无法自动配置防火墙规则。请手动以管理员身份运行应用一次，或参考帮助文档手动配置防火墙。',
}
