# Cloudflare Pages 部署指南

## 部署步骤

### 1. 注册/登录 Cloudflare
- 打开 https://dash.cloudflare.com/sign-up
- 用邮箱注册（无需实名认证）

### 2. 创建 Pages 项目
1. 登录后点击左侧菜单 **Pages**
2. 点击 **Create a project**
3. 选择 **Upload assets**（直接上传文件）

### 3. 上传文件
1. 将本文件夹打包成 zip
2. 在 Cloudflare Pages 拖拽上传
3. 项目名填写：`shen-suan-zi`
4. 点击 **Deploy**

### 4. 获取访问地址
部署完成后，你会得到一个类似这样的网址：
```
https://shen-suan-zi.pages.dev
```

## 自定义域名（可选）
- 在 Pages 项目设置中添加自定义域名
- 支持免费二级域名：xxx.pages.dev

## 更新网站
- 重新打包上传即可
- 或者绑定 GitHub 自动部署
