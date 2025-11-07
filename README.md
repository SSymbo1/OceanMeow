<div align="center">
	<h1>OceanMeow</h1>
	<img src="./src/renderer/assets/icon/logo.svg" width="150" />
	<div align="center">

**中文** | [**English**](./docs/README_en.md)

</div>
	<strong>对Steam游戏截图，存档进行集中管理的应用</strong>
    <br/><br/>
    <img src='./docs/image/application_library.png' width="500" />
</div>

## 📖 介绍

OceanMeow 是一个基于 Electron + Vue3 的桌面应用，用于集中管理 Steam 游戏的截图和存档。它可以帮助用户更好地管理和分享 Steam 游戏的截图，同时提供账户数据统计等功能。

## 🔨 本地构建

### 依赖安装

```bash
pnpm install
```

### 项目初始化

```bash
pnpm run project:init
```

### 开发环境运行

```bash
pnpm run dev:eletron
```

### 构建

```bash
pnpm run build:eletron
```

本地构建相关问题请参考[构建相关问题](./docs/dependency_install.md)，如果你使用 VS Code 进行开发并遇到工作区相关问题，请参考[VS Code 工作区配置](./docs/vscode_workspace.md)设置该项目的工作区。

## 💡 功能

- [x] 本地 Steam 游戏截图导出
- [x] 本地 Steam 游戏截图局域网内跨设备分享
- [x] 本地 Steam 游戏数据统计
- [x] 多 Steam 账户切换
- [x] 自动检索 Steam 安装路径
- [x] 个性化设置
- [x] 托盘应用
- [ ] 本地 Steam 游戏成就统计
- [ ] 本地 Steam 游戏存档管理
- [ ] 多语言支持

## 🎨 页面截图

![主页](./docs/image/application_home.png)

![游戏详情页面](./docs/image/application_game.png)

![设置页面](./docs/image/application_config.png)

![关于页面](./docs/image/application_about.png)

## 🚫 免责声明

[免责声明](./DISCLAIMER.txt)
