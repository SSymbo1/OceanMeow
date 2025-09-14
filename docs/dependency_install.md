### 运行pnpm install可能出现的问题

#### 1. better-sqlite3

在Windows开发环境下，项目依赖的sqlite3驱动在 install 后需要在本地进行 gyp 编译，这需要你的开发环境具有 Python 环境并且需要 Windows 10 SDK 和 C++ 编译相关工具，否则在 gyp 编译过程中会报错。其中 SDK 和 C++ 编译工具可以通过 Visual Studio 安装，注意不要选择 Windows 11 SDK，否则会报错。

#### 2. 依赖安装后可能需要允许编译

pnpm 在 install 完成后可能不会自动编译，需要手动执行 pnpm approve-builds 允许一些依赖编译，例如 Electron，better-sqlite3。执行命令后会在项目根目录生成 pnpm-workspace.yaml 文件。