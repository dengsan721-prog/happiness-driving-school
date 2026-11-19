# 《幸福驾校》实战班交付手册站点

  这是一个移动端优先的单页面静态站点，采用“一级模块 → 二级模块按钮 → 三级正文”的三级结构。顶部展示幸福驿站 Logo 和主标题，下方用按钮切换“00 使用说明、01 心法、02 流程与标准、03 服务技巧、04 通用模板”五个一级模块；每个一级模块下面的小分区按钮全部换行展示，不横向滑动，点击后只显示对应正文。内容来自现有交付资料的原文梳理，重点保留实战流程、岗位动作、案例和模板；每个内容块都带有复制按钮。

## 本地预览

在本目录运行任意静态服务器，例如：

```
node -e "require('http').createServer((req,res)=>{const fs=require('fs'),p=require('path').join(process.cwd(),req.url==='/'?'index.html':req.url);fs.readFile(p,(e,d)=>{res.statusCode=e?404:200;res.end(e?'Not found':d)})}).listen(4173)"
```

打开 http://localhost:4173/ 。
