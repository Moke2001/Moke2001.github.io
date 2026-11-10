# 访客 IP 记录

网站继续由 GitHub Pages 托管. 公开网页只向 Cloudflare Worker 提交当前页面路径, Worker 从 Cloudflare 的 `CF-Connecting-IP` 请求头取得 IP, 并把记录写入私有 D1 数据库. 浏览器不接触数据库凭据, Worker 也不提供公开读取记录的接口.

## 记录范围

- 字段为 IP, 页面路径, 首次与最后访问时间(UTC), 访问次数.
- 同一 IP, 同一页面, 同一 UTC 分钟内的访问合并为一行, `visit_count` 累计.
- 默认保留 30 天, 每天自动清理, 可通过 `RETENTION_DAYS` 设置为 1 至 90 天.
- 记录当前首页, 学术成果, 开源项目, 量子云及详情页. 首页分屏与语言切换不重复记录, URL 查询参数及留言内容不会发送.
- 旧版 `papers/` 和 `packages/` 独立 HTML 尚未接入此脚本.
- 请求被浏览器拦截, 网络失败或后台不可用时, 不影响网站浏览. 因此这些记录不是完整的服务器访问日志.

## 当前配置

正式收集端点为 `https://eureka-studio-visitor-log.eureka-studio-visitor-log.workers.dev/visit`, 数据库名为 `eureka-studio-visitors`. 日常更新在本目录执行 `npm run db:migrate` 和 `npm run deploy`, 不要重复创建已有数据库.

## 首次部署到其他账号

在本目录执行. 所有 Cloudflare 操作都使用你自己的账号, 不需要把密码或令牌写进网站或 GitHub 仓库.

```bash
npm ci
npx wrangler login --device --browser=false --scopes account:read user:read workers_scripts:write d1:write
npx wrangler d1 create eureka-studio-visitors --binding DB --update-config
```

确认 `wrangler.toml` 中的 `database_id` 已替换为返回的真实数据库 UUID, 再执行:

```bash
npm run db:migrate
npm test
npm run deploy
```

把部署输出的 HTTPS Worker 地址加上 `/visit`, 填入根目录 `index.html` 的 `visitor-tracker.js` 标签的 `data-endpoint` 属性, 然后按原来的 GitHub Pages 工作流发布网站. `data-endpoint` 为空时不发送任何记录请求. Worker 地址是公开的收集接口, 不是管理凭据.

若账号尚未开通 Workers 的 `workers.dev` 子域名, 先按 Cloudflare 的官方提示完成开通.

## 查看记录

在 [Cloudflare 控制台](https://dash.cloudflare.com/) 打开 `Storage & databases > D1 SQL database > eureka-studio-visitors`, 在 `Tables` 查看 `visits`, 或在 `Console` 执行 `queries/recent.sql`. 这些操作要求登录数据库所属的 Cloudflare 账号.

也可以在已登录 Wrangler 的本机执行:

```bash
npm run logs
```

这会显示最近 100 条记录. 时间按 UTC 保存. 查询时如需北京时间, 可使用 SQLite 的 `datetime(first_seen_utc, '+8 hours')`. 不要把查询结果或数据库导出文件提交到公开仓库.

## 本地验证

```bash
npm test
npm run db:local
npm run dev -- --var ALLOWED_ORIGIN:http://127.0.0.1:4173
```

本地预览不会向正式服务发送记录. 若要联调, 临时把 tracker 的端点设置为 `http://127.0.0.1:8787/visit`. 正式网站只接受 HTTPS 端点, 正式 Worker 的 `ALLOWED_ORIGIN` 保持为 `https://moke2001.github.io`.

本地 `.wrangler/` 数据库及认证文件不会进入 Git. GitHub Pages 的发布清单只发布网站静态资产, 不会发布这个目录.

## 官方文档

- [GitHub Pages 静态托管](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Cloudflare 访客 IP 请求头](https://developers.cloudflare.com/fundamentals/reference/http-headers/#cf-connecting-ip)
- [D1 数据库入门及控制台](https://developers.cloudflare.com/d1/get-started/)
- [Wrangler 官方账号授权](https://developers.cloudflare.com/workers/wrangler/commands/general/#login)
