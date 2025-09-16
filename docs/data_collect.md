# Steam数据收集

## 1.需求

- 获取游戏信息，包括id，名称，统计时间，封面缓存
- 获取登录账户信息，包括id，名称，头像缓存
- 获取截图位置以及截图信息

## 2.数据收集匹配

### 2.1 文件匹配

| 文件名                                     | 文件作用                     | 备注 |
| ------------------------------------------ | ---------------------------- | ---- |
| userdata/<用户短id>/760/screenshots.vdf    | 截图与游戏匹配文件           | ---  |
| steamapps/appmanifest\_<游戏id>.acf        | 已安装游戏的游戏配置信息文件 | ---  |
| userdata/<用户短id>/config/localconfig.vdf | 用户详细配置文件             | ---  |
| appcache/librarycache/<游戏id>/            | 游戏封面，图标缓存           | ---  |
| appcache/appinfo.vdf                       | 游戏信息缓存文件             | ---  |

### 2.2 screenshots.vdf

```vdf
    "screenshots"
    {
	    "1145360" 游戏id
	    {
		    "0"
		    {
			    "type"
			    "filename" 截图位置
			    "thumbnail" 缩略图位置
			    "imported"
			    "width" 图片宽度
			    "height" 图片高度
			    "gameid" 游戏id
			    "creation" 截图时间
			    "Permissions"
			    "hscreenshot"
		    }
            ...
        }
        ...
    }
```

### 2.3 appmanifest\_<游戏id>.acf (截取)

```acf
    "AppState"
    {
	    "appid" 游戏id
	    "Universe"
	    "LauncherPath" 启动器位置
	    "name" 游戏名称
        "StateFlags"
	    "installdir" 文件夹名称
	    "LastUpdated" 上次更新日期
	    "LastPlayed" 上次游玩时间
        "LastOwner"	所有者id
    }

```

### 2.4 localconfig.vdf (截取)

```vdf
    "UserLocalConfigStore"
    {
        "friends"
	    {
		    "PersonaName" 用户名称
		    "communitypreferences"
		    "textfilterbannedwords"
		    "textfiltercleanwords"
		    "textfilterwordsrevision"
		    "897973713" 用户短id
		    {
			    "name" 用户名称
			    "NameHistory" 用户历史名称
			    {
				    "0"
			    }
			    "avatar" 用户头像token
		    }
        }
        "Software"
	    {
		    "Valve"
		    {
			    "Steam"
			    {
				    "apps"
				    {
                        "LastPlayed" 上次游玩时间
						"Playtime" 游玩时间（分钟）
                    }
                }
            }
        }
    }
```

### 2.5 appinfo.vdf (截取)

```vdf
	"appId" 游戏id
	"appinfo"
	{
		"appid" 游戏id
		"common"
		{
			"associations" 开发商/发行商
			{
				"name" 厂商名称
				"type" 厂商类型
			}
			"header_image" 游戏详情界面封面
			{
				"english"
				"schinese"
			}
			"library_assets_full" 库界面封面
			{
				"library_capsule" 库界面图标
				{
					"english"
					"schinese"
				}
			}
			"icon" 游戏图标token
			"name" 游戏名称
			"name_localized" 游戏名称（本地化）
			{
				"english"
				"schinese"
			}
			"small_capsule" 游戏启动图标
			{
				"english"
				"schinese"
			}
			"type" 应用种类
		}
		"ufs"
		{
			"savefiles" 游戏存档
			{
				"0"
				{
					"path" 存档路径
					"pattern" 存档文件后缀
					"root"
				}
			}
		}
	}
	"lastUpdated"

```
