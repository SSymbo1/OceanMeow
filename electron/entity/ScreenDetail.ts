import { ViewEntity, ViewColumn } from "typeorm";

@ViewEntity({
    name: "account_screenshot_view",
    expression: "SELECT * FROM account_screenshot_view"
})
export class ScreenDetail {
    @ViewColumn({ name: 'steam_long_id' })
    longId: string = ''
    @ViewColumn({ name: 'steam_short_id' })
    shortId: string = ''
    @ViewColumn({ name: 'login_name' })
    loginName: string = ''
    @ViewColumn({ name: 'user_name' })
    userName: string = ''
    @ViewColumn({ name: 'app_id' })
    appId: string = ''
    @ViewColumn({ name: 'app_name' })
    appName: string = ''
    @ViewColumn({ name: 'app_localized' })
    appLocalized: string = ''
    @ViewColumn({ name: 'screen_index' })
    screenIndex: number = 0
    @ViewColumn({ name: 'screen_image' })
    screenFull: string = ''
    @ViewColumn({ name: 'screen_thumb' })
    screenThumb: string = ''
    @ViewColumn({ name: 'screen_width' })
    width: number = 0
    @ViewColumn({ name: 'screen_height' })
    height: number = 0
    @ViewColumn({ name: 'screen_creation' })
    creation: string = ''
    @ViewColumn({ name: 'app_del' })
    del: string = ''
}