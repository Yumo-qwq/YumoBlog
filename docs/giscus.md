# giscus 评论配置

友链页使用 Fluid 的 giscus 组件，配置集中在 `_config.fluid.yml` 的 `giscus` 段。
文章评论保持关闭；需要启用时，将 `post.comments.enable` 设为 `true` 即可，
默认评论类型已一并设为 `giscus`。

## 一次性启用

1. 在公开仓库 [Yumo-qwq/YumoBlog 的设置](https://github.com/Yumo-qwq/YumoBlog/settings)
   中开启 Discussions。
2. [安装 giscus App](https://github.com/apps/giscus)，只授权 `Yumo-qwq/YumoBlog`。
3. 打开 [giscus 配置页](https://giscus.app/zh-CN)，输入 `Yumo-qwq/YumoBlog`，
   选择 `Announcements` 分类。将生成的 `data-repo-id`、`data-category-id` 分别填入
   `_config.fluid.yml` 的 `repo-id`、`category-id`。如果选择其他分类，也要同步 `category`。
4. 执行 `npm run build`，检查 `/links/` 后再按现有方式部署博客。
5. 把根目录的 `giscus.json` 提交到评论仓库的默认分支。该文件由 giscus 从 GitHub
   读取，只有本地文件或部署后的同名静态文件不会启用这些高级设置。

尚未填写真实 ID 时，页面会显示评论暂不可用，不会向 giscus 发送无效配置。
不需要在博客中添加 GitHub Token、OAuth Client Secret 或数据库。

## 已接入的能力

| 能力 | 配置或使用方式 |
| --- | --- |
| GitHub 登录、发表评论、回复、编辑和删除自己的评论 | giscus 官方组件提供，受登录状态和 GitHub 权限约束 |
| Markdown 编辑与预览、代码高亮、表格、链接、图片和数学公式 | 使用组件内置编辑器；图片使用图片 URL，附件可前往 GitHub 讨论页上传 |
| 主讨论和评论上的反应、评论赞同、分页、排序和自动更新 | 使用组件原生交互；`reactions-enabled` 控制主讨论反应 |
| 讨论自动创建和页面隔离 | 默认 `mapping: pathname`，首次评论或反应时创建讨论 |
| 严格匹配 | `strict: 1`，避免相近标题关联到其他页面 |
| 分类内搜索 | 设置 `category`；清空它可以跨分类搜索，`category-id` 仍用于创建讨论 |
| 评论输入框位置 | `input-position: top` 或 `bottom` |
| 多语言 | 修改 `lang`，默认 `zh-CN` |
| 懒加载 | `loading: lazy`；也支持 `eager` |
| 深浅色联动 | `theme-light`、`theme-dark` 随 Fluid 的切换按钮更新 |
| 固定、系统偏好或自定义主题 | 设置 `theme` 覆盖自动切换；可填内置主题名、`preferred_color_scheme` 或完整 HTTPS CSS URL |
| 讨论和访问者元数据 | `emit-metadata: 1`，通过官方 `message` 事件接收 |
| 自托管服务 | 修改 `host`；主题消息使用 iframe 实际来源 |
| 来源限制、默认排序 | 根目录 `giscus.json` 的 `origins`、`originsRegex`、`defaultCommentOrder` |
| 动态修改配置 | 使用官方 `postMessage` 的 `setConfig` 接口 |
| 审核、隐藏、锁定和关闭讨论等管理操作 | 在 GitHub Discussions 中操作，受维护者权限和 GitHub 功能约束 |

其中互斥的选项只能选择一种，例如映射方式和输入框位置。
仅为友链页切换组件，不会把既有 Issues 自动转换为 Discussions。

## 页面映射方式

`mapping` 支持官方全部六种方式：

- `pathname`：按路径匹配，默认使用，换域名不会改变讨论归属。
- `url`：按完整页面 URL 匹配。
- `title`：按页面 `<title>` 匹配。
- `og:title`：按页面 Open Graph 标题匹配。
- `specific`：在 `term` 中填写固定讨论标题。
- `number`：在 `term` 中填写已有讨论编号，不需要分类 ID，也不会自动创建讨论。

修改映射方式可能让页面关联到另一条讨论；既有数据仍保留在 GitHub。

## 元数据和动态配置

giscus 官方脚本负责 iframe 高度、会话和登录状态。业务代码需要读取元数据时，
同时验证来源和 iframe，避免处理其他窗口发送的消息：

```js
window.addEventListener('message', function(event) {
  var frame = document.querySelector('iframe.giscus-frame');
  if (!frame || event.source !== frame.contentWindow) return;
  if (event.origin !== new URL(frame.src).origin) return;
  var data = event.data && event.data.giscus;
  if (!data || !data.discussion) return;
  // data.discussion 包含 URL、反应数、评论数、回复数等；data.viewer 是当前访问者。
});
```

讨论首次创建后才会发送讨论元数据。更改显示配置可以直接使用官方接口：

```js
var frame = document.querySelector('iframe.giscus-frame');
if (frame) {
  frame.contentWindow.postMessage({
    giscus: { setConfig: { inputPosition: 'bottom', reactionsEnabled: true } }
  }, new URL(frame.src).origin);
}
```

若要指定新讨论中的回链地址，可通过 Fluid 的 `custom_head` 添加：

```yaml
custom_head: '<meta name="giscus:backlink" content="https://www.yumo.blog/links/">'
```

该设置会作用于所有页面，只有确实希望所有评论使用同一个回链时才全局设置；
需要按页面设置时使用 Fluid 的 `head` 注入点。

## 从 Utterances 迁移已有评论

需要保留旧评论时，在 GitHub 将对应 Issue 转换为 Discussion，并确认标题与映射值一致。
启用 `strict: 1` 后，还需在讨论正文添加标题的 SHA-1，例如：

```html
<!-- sha1: 此处为讨论标题的真实 SHA-1 -->
```

新讨论由 giscus 自动添加该值。不要删除旧 Issue 来重新建立评论。

## 核对

- 未登录可以阅读评论，发表评论和反应需要 GitHub 登录及授权。
- 首次还没有讨论时的“找不到讨论”并不表示配置失败；首次评论或反应后才创建讨论。
- 第三方脚本加载失败时提供 GitHub 讨论区入口；未启用 JavaScript 时也能使用该入口。
- 本地验证可检查渲染、主题切换和参数；真实发帖、管理权限与 GitHub 授权需要实际账户验证。
- giscus 仍依赖 GitHub 和 giscus 服务的网络连通性。
- 如果 `https://giscus.app/client.js` 出现 TLS 握手失败或连接被关闭，需先恢复当前网络或代理
  到该域名的 HTTPS 连通性，再检查评论显示、登录和发帖。页面会保留 GitHub 讨论区入口。

官方资料：[配置页](https://giscus.app/zh-CN)、
[高级用法](https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md)、
[官方客户端](https://github.com/giscus/giscus/blob/main/client.ts)。
