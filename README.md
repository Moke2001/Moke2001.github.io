# Eureka Studio

Eureka Studio个人工作室主页. 使用原生HTML, CSS和JavaScript, 无需安装依赖或执行构建, 可部署到GitHub Pages. 代码仓库为https://github.com/Moke2001/Moke2001.github.io, 使用GitHub Pages发布.

## 本地预览

在本目录执行:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

浏览器打开[本地主页](http://127.0.0.1:4173/). 按`Ctrl+C`停止预览服务.

页面使用相对资源路径和哈希路由(hash routing), 同时适用于GitHub用户主页和项目子目录:

| 页面 | 路由 |
| --- | --- |
| 首页 | `#/` |
| 科研成果 | `#/research` |
| 开源项目 | `#/projects` |
| 量子云平台 | `#/quantum` |

## 文件与内容维护

| 文件 | 用途 |
| --- | --- |
| `index.html` | 页面入口和基础结构 |
| `styles.css` | 包豪斯(Bauhaus)风格布局, 配色和响应式样式 |
| `app.js` | 导航, 中英切换和页面交互 |
| `data/content.js` | `window.STUDIO_CONTENT`内容配置 |
| `assets/` | 网站使用的Logo, 图像与字体 |
| `.github/workflows/pages.yml` | GitHub Pages部署工作流 |
| `.nojekyll` | 静态站点标记 |

更新正式内容时修改`data/content.js`. 当前已录入5篇论文和1个开源项目ExtendedStim. 5篇论文均提供arXiv公开PDF, LaTeX源文件, 摘要页和SciRate链接, 并按日期从新到旧排列. 最新论文为[arXiv:2611.06469v1](https://arxiv.org/abs/2611.06469v1). ExtendedStim的仓库入口为[GitHub正式仓库](https://github.com/Moke2001/ExtendedStim), ZIP入口指向该仓库实际的`master`分支.

内容配置采用以下结构. 需要双语的文本使用`{ zh: '中文', en: 'English' }`, 论文题目, 作者和摘要保留原英文.

| 字段 | 说明 |
| --- | --- |
| `person` | 姓名, 出生年月, 邮箱, QQ, 微信, 双语地址和`education`教育经历 |
| `researchContext` | 双语工作室理念正文 |
| `principles` | 五项理念卡片, 每项包含`index`, 双语`title`和双语`description` |
| `publications` | 科研成果数组, 每项包含唯一`id`, `title`, `authors`, `abstract`, `abstractKind`, 双语`field`, `date`和可选`status` |
| `publications`中的链接 | `pdf`, `latex`, `scirate`, `arxiv`, 未提供时留空字符串 |
| `projects` | 开源项目数组, 每项包含唯一`id`, `title`, 双语`summary`, 双语`field`, `date`, `github`和`zip` |
| 成果或项目的补充正文 | 双语`motivation`, `value`, `innovation`, 留空时不展示对应章节 |

`abstractKind: 'summary'`表示依据公开论文记录整理的忠实英文概述, 页面明确标记为`Abstract summary`; 目前除最新论文外的4篇使用此值. `abstractKind: 'original'`表示作者提供的原始摘要, 最新论文仍保留从作者截图转录的文本. 不应把概述改标为原始摘要. 新增条目时保持`id`唯一且稳定, 以免既有详情链接失效. 文件链接支持`https://`地址或以`assets/`开头的相对路径.

网站支持中文和英文切换. 切换选择保存在当前浏览器, 语言内容由`data/content.js`和`app.js`中的界面词典共同维护.

反馈功能把内容保存在访问者当前浏览器的本地存储(localStorage)中, 不会自动发送给工作室, 也不会对其他访问者可见. 邮件入口通过`mailto:`打开默认邮件应用并生成草稿, 需要访问者自行发送. 本站没有留言后端, 公共留言墙或云端收件箱.

## 访客IP记录

访客记录由独立的Cloudflare Worker和私有D1数据库提供, 网站入口仍为GitHub Pages. 部署, 查询及保留期限见[访客记录说明](visitor-log/README.md). 页面通过`assets/visitor-tracker.js`上报规范化路径, IP由Cloudflare服务端取得. `index.html`中该脚本的`data-endpoint`为空时功能关闭, 填入已部署的Worker `/visit` 地址后启用. 数据库和认证文件不随网站发布.

## 部署到GitHub Pages

1. 在GitHub新建一个仓库, 将本目录的网站文件和`.github/workflows/pages.yml`上传到仓库的`main`分支. 用户主页仓库通常命名为`<用户名>.github.io`, 项目站点可使用其他仓库名.
2. 打开仓库的`Settings > Pages`. 在`Build and deployment > Source`选择`GitHub Actions`.
3. 打开`Actions`, 运行`Deploy Eureka Studio to GitHub Pages`, 或向`main`分支推送一次更新以触发部署. 如果默认分支名称不同, 同步修改工作流的`on.push.branches`.
4. 等待工作流完成. 发布地址会显示在该次工作流的`github-pages`部署环境及`Settings > Pages`中.

工作流打包`index.html`, `styles.css`, `app.js`, `data/content.js`, `.nojekyll`及`assets/`内允许发布的资源, 并保留仓库已有的`papers/`和`packages/`静态页面及旧版样式和脚本. 资源清单包含常用网页图像, 字体, 资源许可证, PDF, ZIP, TeX, BibTeX及`tar.gz`等论文和项目下载文件. 后续可把公开论文附件放入`assets/publications/`, 再填写相应的内容链接. 提供的源设计PDF存放在发布目录之外; README, 本地检查产物及其他开发文件不会进入网站发布包. 新增其他类型资源时, 请同步更新工作流的发布清单.

工作流使用GitHub提供的`GITHUB_TOKEN`, 权限仅为`contents: read`, `pages: write`及`id-token: write`, 无需额外配置个人访问令牌. 同一时间仅执行一个Pages部署, 已开始的部署会正常完成.

部署步骤依据[GitHub官方发布来源配置](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)及[GitHub官方自定义Pages工作流文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## 设计来源

页面依据提供的`Homepage.pdf`设计稿和Eureka Studio Logo制作, 并参考[包豪斯网站模板](https://luoqianshi.github.io/beautiful_web_template/templates/Bauhaus/Bauhaus.html)的几何构图与色彩语言.

图标来自[Tabler Icons](https://tabler.io/icons), 采用MIT许可证, 归属信息保留在`assets/icons/LICENSE`. 英文字体Outfit及中文字体Noto Sans SC已本地化到`assets/fonts/`, 网站不依赖外部字体服务. 两款字体采用SIL开放字体许可证(SIL Open Font License, OFL)1.1, 原始归属和许可条款分别保存在`assets/fonts/Outfit-OFL.txt`和`assets/fonts/NotoSansSC-OFL.txt`.

README不属于网页内容, 许可证作为资源归属文件随资源保留, 均不在网页界面中展示.

已有论文和开源项目的静态详情页及图像保留原路径. 旧首页锚点`#home`, `#profile`, `#latest`分别兼容到新首页, 联系信息和学术成果列表.
