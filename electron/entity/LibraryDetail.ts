import { ViewEntity, ViewColumn } from "typeorm";

@ViewEntity({
    name: "account_library_view",
    expression: "SELECT * FROM account_library_view"
})
export class LibraryDetail {
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
    @ViewColumn({ name: 'app_pic' })
    appPicture: string = ''
    @ViewColumn({ name: 'app_hero' })
    appHero: string = ''
    @ViewColumn({ name: 'app_logo' })
    appLogo: string = ''
    @ViewColumn({ name: 'play_time_minute' })
    timeMinute: number = 0
    @ViewColumn({ name: 'play_time_hour' })
    timeHour: number = 0
    @ViewColumn({ name: 'last_play' })
    lastPlay: string = ''
    @ViewColumn({ name: 'app_type' })
    type: string = ''
    @ViewColumn({ name: 'app_del' })
    del: string = ''
}