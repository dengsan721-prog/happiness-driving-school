# 《幸福驾校》实战班交付手册站点

这是一个独立的静态站点，参考了幸福学院市场服务手册的“工作台 + 主流程 + 镜子库 + 场景查阅”结构，但内容为《幸福驾校》线上实战班交付资料的独立整理，视觉使用青绿色与暖橙色。

## 本地预览

在本目录运行任意静态服务器即可，例如：

```
node -e "require('http').createServer((req,res)=>{const fs=require('fs'),p=require('path').join(process.cwd(),req.url==='/'?'index.html':req.url);fs.readFile(p,(e,d)=>{res.statusCode=e?404:200;res.end(e?'Not found':d)})}).listen(4173)"
```

然后打开 http://localhost:4173/ 。

## 页面

- `index.html`：工作台首页，含四级角色、主流程入口、案例镜子库和搜索。
- `manual.html`：由完整手册内容生成的全文页。
- `styles.css`：青绿色视觉系统与响应式布局。
- `app.js`：工作台切换、场景搜索、复制按钮。
