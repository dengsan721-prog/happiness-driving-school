# 《幸福驾校》实战班交付手册站点

  这是一个移动端优先的单页面静态站点，采用“主模块 → 小模块按钮 → 对应正文”的结构。顶部展示幸福驿站 Logo 和主标题，下方一行展示“说明、心法、流程、技巧、模板”五个入口；各入口下方的小模块按钮自动换行，点击后只显示对应正文。“说明”中的五个主题也各自成为带序号的小模块。内容来自现有交付资料的原文梳理，重点保留实战流程、岗位动作、案例和模板；每个内容块都带有复制按钮。

## 本地预览

在本目录运行任意静态服务器，例如：

```
node -e "require('http').createServer((req,res)=>{const fs=require('fs'),p=require('path').join(process.cwd(),req.url==='/'?'index.html':req.url);fs.readFile(p,(e,d)=>{res.statusCode=e?404:200;res.end(e?'Not found':d)})}).listen(4173)"
```

打开 http://localhost:4173/ 。
