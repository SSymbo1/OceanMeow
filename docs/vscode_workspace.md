### vscode工作区设置

如果vscode工作区不识别tailwindcss或者eslint和prettier工作不正常，可以尝试以下设置：

在.vscode文件夹下创建settings.json文件，添加以下内容：

```json
{
  "tailwindCSS.experimental.configFile": null,
  "tailwindCSS.includeLanguages": {
    "html": "html",
    "javascript": "javascript",
    "css": "css"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "editor.quickSuggestions": {
    "strings": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.useFlatConfig": true,
  "eslint.validate": ["javascript", "typescript", "typescriptreact", "vue"],
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  "typescript.tsdk": "node_modules\\typescript\\lib"
}
```
