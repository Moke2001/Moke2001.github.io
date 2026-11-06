'use strict';

(() => {
  const content = window.STUDIO_CONTENT;
  const main = document.querySelector('#main');
  const siteFooter = document.querySelector('.site-footer');
  const icon = (name, cls = '') => `<img class="icon ${cls}" src="assets/icons/${name}.svg" alt="" width="24" height="24" decoding="async">`;
  const escape = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  let language = 'zh';
  let comments = [];
  let currentView = '';
  let disposeView = () => {};
  let sectionObserver;
  let toastTimer;
  try { language = localStorage.getItem('eureka-language') === 'en' ? 'en' : 'zh'; } catch (_) { /* Storage is optional. */ }
  try {
    const saved = JSON.parse(localStorage.getItem('eureka-feedback') || '[]');
    if (Array.isArray(saved)) comments = saved.filter(c => c && typeof c.name === 'string' && c.name.length <= 40 && typeof c.message === 'string' && c.message.length <= 1200 && typeof c.id === 'string' && Number.isFinite(c.time) && Number.isFinite(new Date(c.time).getTime())).slice(-20);
  } catch (_) { /* Invalid or blocked storage starts empty. */ }

  const dictionary = {
    zh: {
      navHome: '首页', navResearch: '学术成果', navProjects: '开源项目', navQuantum: '量子云', contactUs: '联系我们', footerLine: '保持好奇. 让想法发生.', startConversation: '开始一场对话',
      eyebrow: '独立探索 / 开放科学', heroLine1: '迈向全新', heroLine2: '学术范式', heroBody: '以好奇心为起点, 在量子世界寻找新的可能.\n让研究开放, 让思想相遇.', exploreResearch: '探索学术成果', discover: '向下探索', visualLabel: '一间关于想法的工作室', visualCaption: '从一个问题, 到一种可能.', quantumInfo: '量子信息', quantumManyBody: '量子多体', visionKicker: 'OUR PHILOSOPHY', visionTitle: 'Eureka的基本愿景.', visionSub: '以人工智能(AI)与人类智能的协同, 探索更高效的学术范式.', contextTitle: '面向AI成为基础设施的时代.', feedbackKicker: 'IDEAS IN CONVERSATION', feedbackTitle: '让不同的声音,\n成为新的灵感.', feedbackSub: '一个问题, 一条建议, 或一个尚未成形的想法. 我们都愿意倾听.', localComments: '本机留言', emptyCommentsTitle: '对话, 从你开始.', emptyCommentsBody: '欢迎对我们的研究与理念提出建议或质疑, 也欢迎聊聊合作的可能.', feedbackNote: '留言仅保存在当前浏览器, 不会公开发布. 保存后可通过邮件发送给我们.', formTitle: '留下你的想法', nameLabel: '怎么称呼你', namePlaceholder: '你的名字或昵称', messageLabel: '想说些什么', messagePlaceholder: '分享一个问题, 建议, 或合作想法...', saveFeedback: '保存留言', savedFeedback: '已保存到当前浏览器.', sendEmail: '通过邮件发送', deleteFeedback: '删除', storageFailed: '浏览器无法保存. 你仍可通过邮件发送.', messageLength: '请将留言控制在1至1200个字符.', nameLength: '请输入1至40个字符的称呼.',
      contactKicker: 'THE PERSON BEHIND EUREKA', contactTitle: '你好, 我是墨克.', contactIntro: '一名保持好奇的物理学研究者.\n关注量子信息, 量子多体与科学研究的新可能.', born: '2001.12生', education: '学习与探索', present: '至今', getInTouch: '让我们保持联系', copy: '复制', copied: '已复制', copyFailed: '无法自动复制, 请选中文字复制.', address: '地址', title: '标题', abstract: 'Abstract', abstractSummary: 'Abstract summary', backResearch: '返回学术成果', backProjects: '返回开源项目', researchKicker: 'SELECTED RESEARCH', researchTitle: '探索, 有迹可循.', researchIntro: '从量子纠错到物理实验. 在这里分享我们的问题, 方法与研究成果.', papers: '篇论文', searchPlaceholder: '搜索标题, 作者或研究领域', searchLabel: '搜索学术成果', noMatches: '没有找到匹配的成果.', allResearch: '清除搜索', manuscript: '手稿', projectsKicker: 'BUILT TO BE SHARED', projectsTitle: '开放工具,\n连接更多可能.', projectsIntro: '将研究中的想法变成可使用, 可检验, 可继续发展的工具.', projectsUnit: '个开源项目', projectsEmpty: '新的工具正在酝酿.', projectsEmptyBody: '开源项目将在这里分享.', viewProject: '了解项目', viewResearch: '阅读研究', motivation: '研究动机', value: '研究价值', innovation: '创新之处', source: 'LaTeX源文件', pdf: '阅读PDF', github: '查看GitHub', zip: '下载ZIP', noDownloads: '公开附件尚未提供.', quantumKicker: 'THE NEXT CHAPTER', comingSoon: '敬请期待', quantumTitle: '量子云', quantumBody: '新的探索正在酝酿.\n期待在这里, 与你见面.', backHome: '返回首页', notifyUs: '联系工作室', notFound: '这个页面还未被发现.', notFoundBody: '不妨回到首页, 开启一次新的探索.', manuscriptNote: '摘要由作者提供.', paperSourceNote: '摘要概述依据arXiv公开记录整理.', mailSubject: 'Eureka Studio网站反馈', emailIntro: '你好, Eureka Studio:', emailName: '称呼', researchCount: '项研究', searchResult: '项结果', menuOpen: '打开菜单', menuClose: '关闭菜单'
    },
    en: {
      navHome: 'Home', navResearch: 'Research', navProjects: 'Open Source', navQuantum: 'Quantum Cloud', contactUs: 'Contact us', footerLine: 'Stay curious. Make ideas happen.', startConversation: 'Start a conversation',
      eyebrow: 'INDEPENDENT INQUIRY / OPEN SCIENCE', heroLine1: 'Toward a new', heroLine2: 'research paradigm', heroBody: 'Start with curiosity. Explore new possibilities in the quantum world.\nKeep research open, and let ideas meet.', exploreResearch: 'Explore our research', discover: 'SCROLL TO EXPLORE', visualLabel: 'A STUDIO FOR IDEAS', visualCaption: 'From a question to a possibility.', quantumInfo: 'Quantum Information', quantumManyBody: 'Quantum Many-Body', visionKicker: 'OUR PHILOSOPHY', visionTitle: 'Our vision for Eureka.', visionSub: 'Bringing AI capabilities and human intelligence together for a more efficient research paradigm.', contextTitle: 'An era of AI as infrastructure.', feedbackKicker: 'IDEAS IN CONVERSATION', feedbackTitle: 'Different voices.\nNew inspiration.', feedbackSub: 'A question, a suggestion, or an idea still taking shape. We would love to hear it.', localComments: 'LOCAL MESSAGES', emptyCommentsTitle: 'It starts with a conversation.', emptyCommentsBody: 'Share your thoughts on our research, ask a critical question, or explore a collaboration.', feedbackNote: 'Messages stay in this browser and are not published. After saving, you can send your message by email.', formTitle: 'Leave a thought', nameLabel: 'Your name', namePlaceholder: 'Name or nickname', messageLabel: 'What is on your mind?', messagePlaceholder: 'A question, a suggestion, or a collaboration idea...', saveFeedback: 'Save message', savedFeedback: 'Saved in this browser.', sendEmail: 'Send by email', deleteFeedback: 'Delete', storageFailed: 'Browser storage is unavailable. You can still send your message by email.', messageLength: 'Please enter between 1 and 1,200 characters.', nameLength: 'Please enter a name of 1 to 40 characters.',
      contactKicker: 'THE PERSON BEHIND EUREKA', contactTitle: 'Hello, I am Mooke.', contactIntro: 'A curious researcher in physics.\nExploring quantum information, quantum many-body physics, and new possibilities in science.', born: 'Born December 2001', education: 'LEARNING & EXPLORING', present: 'Present', getInTouch: 'Let us keep in touch', copy: 'Copy', copied: 'Copied', copyFailed: 'Copy is unavailable. Please select and copy the text.', address: 'Address', title: 'Title', abstract: 'Abstract', abstractSummary: 'Abstract summary', backResearch: 'Back to research', backProjects: 'Back to projects', researchKicker: 'SELECTED RESEARCH', researchTitle: 'Ideas, put into practice.', researchIntro: 'From quantum error correction to physics experiments. Sharing the questions, methods, and results behind our work.', papers: 'PAPERS', searchPlaceholder: 'Search titles, authors, or research fields', searchLabel: 'Search research', noMatches: 'No research matches your search.', allResearch: 'Clear search', manuscript: 'Manuscript', projectsKicker: 'BUILT TO BE SHARED', projectsTitle: 'Open tools.\nMore possibilities.', projectsIntro: 'Turning research ideas into tools that can be used, tested, and developed further.', projectsUnit: 'OPEN SOURCE PROJECT', projectsEmpty: 'New tools are taking shape.', projectsEmptyBody: 'Our open source projects will be shared here.', viewProject: 'Explore project', viewResearch: 'Read the research', motivation: 'Motivation', value: 'Value', innovation: 'Innovation', source: 'LaTeX source', pdf: 'Read PDF', github: 'View on GitHub', zip: 'Download ZIP', noDownloads: 'Public attachments have not been provided yet.', quantumKicker: 'THE NEXT CHAPTER', comingSoon: 'COMING SOON', quantumTitle: 'Quantum Cloud', quantumBody: 'A new exploration is taking shape.\nWe look forward to seeing you here.', backHome: 'Back to home', notifyUs: 'Contact the studio', notFound: 'This page is waiting to be discovered.', notFoundBody: 'Head back home and begin a new exploration.', manuscriptNote: 'Abstract supplied by the author.', paperSourceNote: 'Abstract summary based on the public arXiv record.', mailSubject: 'Eureka Studio website feedback', emailIntro: 'Hello, Eureka Studio,', emailName: 'Name', researchCount: 'RESEARCH WORKS', searchResult: 'RESULTS', menuOpen: 'Open menu', menuClose: 'Close menu'
    }
  };
  const t = key => dictionary[language][key] || key;
  const local = value => typeof value === 'object' && value !== null ? (value[language] || value.zh || value.en || '') : (value || '');
  const lines = text => escape(text).replace(/\n/g, '<br>');
  const label = (number, text) => `<div class="section-label"><span>${number}</span>${escape(text)}</div>`;
  const button = (href, text, style = '', name = 'arrow-up-right') => `<a class="button ${style}" href="${escape(href)}">${escape(text)}${icon(name)}</a>`;
  const safeUrl = url => {
    if (typeof url !== 'string' || !url.trim()) return '';
    if (/^(https:\/\/|assets\/)/i.test(url)) return url;
    return '';
  };
  function toast(message) {
    const element = document.querySelector('#toast');
    element.textContent = message;
    element.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('visible'), 3500);
  }
  function updateShell() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelector('#language-toggle').setAttribute('aria-label', language === 'zh' ? 'Switch to English' : '切换为中文');
    document.querySelector('.language-zh').classList.toggle('selected', language === 'zh');
    document.querySelector('.language-en').classList.toggle('selected', language === 'en');
    document.querySelector('#site-nav').setAttribute('aria-label', language === 'zh' ? '主导航' : 'Main navigation');
  }
  function setMenu(open) {
    document.querySelector('#menu-toggle').setAttribute('aria-expanded', String(open));
    document.querySelector('#menu-toggle').setAttribute('aria-label', t(open ? 'menuClose' : 'menuOpen'));
    document.querySelector('#menu-toggle img').src = `assets/icons/${open ? 'x' : 'menu-2'}.svg`;
    document.querySelector('#site-nav').classList.toggle('is-open', open);
  }
  function home() {
    const person = content.person;
    return `<div class="home-page">
      <section class="home-section hero" id="intro" aria-labelledby="hero-title">
        <canvas class="hero-grid" aria-hidden="true"></canvas>
        <div class="hero-inner container">
          <div class="hero-copy"><div class="eyebrow"><span class="status-mark" aria-hidden="true"></span>${t('eyebrow')}</div>
          <h1 id="hero-title"><span class="hero-eureka">Eureka<span class="hero-dash">-</span></span><span class="hero-heading">${t('heroLine1')}${language === 'en' ? ' ' : ''}<span class="blue">${t('heroLine2')}</span><span class="red">.</span></span></h1>
          <p class="hero-description">${lines(t('heroBody'))}</p><div class="hero-buttons">${button('#/research', t('exploreResearch'), 'button-blue')}${button('#/?section=contact', t('contactUs'), 'button-outline')}</div></div>
          <div class="hero-art"><div class="art-meta"><span>EUREKA STUDIO</span><span>EST. 2026</span></div><div class="logo-stage"><img src="assets/eureka-studio.png" alt="Eureka Studio. A human hand and a robotic hand reaching toward a bell." width="1254" height="1254" fetchpriority="high"></div><div class="art-bottom"><span>${t('visualCaption')}</span><span class="art-plus" aria-hidden="true">+</span></div><span class="art-sticker">${t('visualLabel')}</span></div>
        </div>
        <div class="research-fields"><div><span class="field-no">01</span><strong>${t('quantumInfo')}</strong><span class="field-en">QUANTUM INFORMATION</span></div><div><span class="field-no">02</span><strong>${t('quantumManyBody')}</strong><span class="field-en">QUANTUM MANY-BODY</span></div><div><span class="field-no">03</span><strong>AI4Sci</strong><span class="field-en">AI FOR SCIENCE</span></div></div>
      </section>
      <section class="home-section vision-section" id="vision" aria-labelledby="vision-title"><div class="container section-content">${label('02', t('visionKicker'))}<div class="section-heading"><h2 id="vision-title">${lines(t('visionTitle'))}</h2><p>${t('visionSub')}</p></div><div class="principles">${content.principles.map((p, i) => `<article class="principle principle-${i}"><div class="principle-top"><span>${p.index}</span>${icon(['cpu', 'focus-2', 'world', 'circles-relation', 'atom'][i])}</div><h3>${escape(local(p.title))}</h3><p>${escape(local(p.description))}</p></article>`).join('')}</div><div class="research-context"><h3>${t('contextTitle')}</h3><p>${escape(local(content.researchContext))}</p></div></div></section>
      <section class="home-section feedback-section" id="feedback" aria-labelledby="feedback-title"><div class="container section-content">${label('03', t('feedbackKicker'))}<div class="section-heading"><h2 id="feedback-title">${lines(t('feedbackTitle'))}</h2><p>${t('feedbackSub')}</p></div><div class="feedback-layout"><div class="conversation"><div class="small-heading">${t('localComments')}<span id="comment-count">${String(comments.length).padStart(2, '0')}</span></div><div id="comments-list">${commentsMarkup()}</div></div><form id="feedback-form" class="feedback-form"><h3>${t('formTitle')}${icon('message')}</h3><label for="feedback-name">${t('nameLabel')}</label><input id="feedback-name" name="name" required maxlength="40" autocomplete="nickname" placeholder="${t('namePlaceholder')}"><label for="feedback-message">${t('messageLabel')}</label><textarea id="feedback-message" name="message" required maxlength="1200" rows="4" placeholder="${t('messagePlaceholder')}"></textarea><div class="form-bottom"><span id="character-count">0 / 1200</span><button class="button button-blue" type="submit">${t('saveFeedback')}${icon('arrow-up-right')}</button></div><p id="form-status" role="status"></p></form></div></div></section>
      <section class="home-section contact-section" id="contact" aria-labelledby="contact-title"><div class="container section-content">${label('04', t('contactKicker'))}<div class="contact-layout"><div class="contact-about"><h2 id="contact-title">${t('contactTitle')}</h2><p class="contact-intro">${lines(t('contactIntro'))}</p><h3 class="small-heading">${t('education')}</h3><ol class="education-list">${person.education.map(e => `<li><span>${escape(language === 'en' ? e.period.replace('至今', 'Present') : e.period)}</span><strong>${escape(local(e.institution))}</strong></li>`).join('')}</ol></div><div class="contact-card"><div class="contact-card-heading"><h3>${t('getInTouch')}</h3>${icon('arrow-up-right')}</div><a class="contact-email" href="mailto:${escape(person.email)}">${escape(person.email)}${icon('arrow-up-right')}</a><div class="contact-row"><span>QQ</span><strong>${escape(person.qq)}</strong><button type="button" class="copy-button" data-copy="${escape(person.qq)}" aria-label="${t('copy')} QQ">${icon('copy')}</button></div><div class="contact-row"><span>WeChat</span><strong>${escape(person.wechat)}</strong><button type="button" class="copy-button" data-copy="${escape(person.wechat)}" aria-label="${t('copy')} WeChat">${icon('copy')}</button></div><div class="contact-address"><span>${t('address')}</span><p>${escape(local(person.address))}</p></div><div class="contact-signature">LET'S THINK TOGETHER.</div></div></div></div></section>
      <nav class="section-dots" aria-label="${language === 'zh' ? '首页分屏' : 'Home sections'}">${['intro', 'vision', 'feedback', 'contact'].map((id, i) => `<a href="#/?section=${id}" data-section="${id}" aria-label="${['01', '02', '03', '04'][i]} ${[t('navHome'), t('visionKicker'), t('localComments'), t('contactUs')][i]}"><span>0${i + 1}</span></a>`).join('')}</nav>
    </div>`;
  }
  function commentsMarkup() {
    if (!comments.length) return `<div class="comments-empty">${icon('message')}<h3>${t('emptyCommentsTitle')}</h3><p>${t('emptyCommentsBody')}</p><span class="conversation-rule" aria-hidden="true"></span></div>`;
    return [...comments].reverse().map(c => `<article class="comment"><div class="comment-heading"><strong>${escape(c.name)}</strong><time datetime="${new Date(c.time).toISOString()}">${new Date(c.time).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-GB')}</time></div><p>${escape(c.message)}</p><div class="comment-actions"><a href="${escape(feedbackMail(c))}">${t('sendEmail')}${icon('arrow-up-right')}</a><button type="button" data-delete-comment="${escape(c.id)}">${t('deleteFeedback')}</button></div></article>`).join('');
  }
  function feedbackMail(comment) {
    const body = `${t('emailIntro')}\n\n${comment.message}\n\n${t('emailName')}: ${comment.name}`;
    return `mailto:${content.person.email}?subject=${encodeURIComponent(t('mailSubject'))}&body=${encodeURIComponent(body)}`;
  }
  function paperCard(p, index) {
    return `<a class="paper-card" href="#/research/${encodeURIComponent(p.id)}"><span class="paper-index">${String(index + 1).padStart(2, '0')}</span><div class="paper-content"><div class="paper-tags"><span>${escape(local(p.field))}</span><span>${escape(p.date || t('manuscript'))}</span></div><h2>${escape(p.title)}</h2><p class="paper-authors">${escape(p.authors || '')}</p><p class="paper-abstract"><b>${p.abstractKind === 'summary' ? t('abstractSummary') : t('abstract')}:</b> ${escape(p.abstract)}</p><span class="paper-read">${t('viewResearch')}${icon('arrow-right')}</span></div><span class="card-arrow">${icon('arrow-up-right')}</span></a>`;
  }
  function research() {
    return `<div class="listing-page"><section class="page-heading container">${label('01', t('researchKicker'))}<div class="listing-title"><h1>${t('researchTitle')}</h1><span class="large-count">${String(content.publications.length).padStart(2, '0')}<small>${t('papers')}</small></span></div><p>${t('researchIntro')}</p></section><section class="research-list-section container"><div class="list-toolbar"><span id="research-count">${String(content.publications.length).padStart(2, '0')} ${t('researchCount')}</span><input type="search" id="research-search" aria-label="${t('searchLabel')}" placeholder="${t('searchPlaceholder')}"></div><div id="paper-list">${content.publications.map(paperCard).join('')}</div><div id="research-empty" class="search-empty" hidden><p>${t('noMatches')}</p><button class="text-button" id="clear-search" type="button">${t('allResearch')}</button></div></section></div>`;
  }
  function projects() {
    return `<div class="listing-page projects-page"><section class="page-heading container">${label('02', t('projectsKicker'))}<div class="listing-title"><h1>${lines(t('projectsTitle'))}</h1><span class="large-count">${String(content.projects.length).padStart(2, '0')}<small>${t('projectsUnit')}</small></span></div><p>${t('projectsIntro')}</p></section><section class="container project-list">${content.projects.length ? content.projects.map((p, i) => `<a class="project-card" href="#/projects/${encodeURIComponent(p.id)}"><div class="project-art">${icon('brand-github')}<span>${escape(p.title)}</span><span class="project-art-label">OPEN SOURCE / ${String(i + 1).padStart(2, '0')}</span></div><div class="project-card-copy"><div class="paper-tags"><span>${escape(local(p.field))}</span>${p.date ? `<span>${escape(p.date)}</span>` : ''}</div><h2>${escape(p.title)}</h2><p>${escape(local(p.summary))}</p><span class="button button-dark">${t('viewProject')}${icon('arrow-up-right')}</span></div></a>`).join('') : `<div class="empty-state"><h2>${t('projectsEmpty')}</h2><p>${t('projectsEmptyBody')}</p></div>`}</section></div>`;
  }
  function details(item, isProject) {
    const links = isProject ? [['github', 'github', 'brand-github'], ['zip', 'zip', 'download']] : [['pdf', 'pdf', 'download'], ['latex', 'source', 'download'], ['scirate', 'SciRate', 'arrow-up-right'], ['arxiv', 'arXiv', 'arrow-up-right']];
    const availableLinks = links.filter(([key]) => safeUrl(item[key]));
    return `<article class="detail-page container"><a class="back-link" href="#/${isProject ? 'projects' : 'research'}">${icon('chevron-left')}${t(isProject ? 'backProjects' : 'backResearch')}</a><div class="paper-tags"><span>${escape(local(item.field))}</span><span>${escape(item.date || t('manuscript'))}</span></div><h1>${escape(item.title)}</h1>${item.authors ? `<p class="detail-authors">${escape(item.authors)}</p>` : ''}<div class="detail-links">${availableLinks.map(([key, text, image]) => `<a class="button ${key === 'pdf' || key === 'github' ? 'button-blue' : 'button-outline'}" href="${escape(safeUrl(item[key]))}" target="_blank" rel="noopener noreferrer">${escape(dictionary[language][text] || text)}${icon(image)}</a>`).join('')}${availableLinks.length ? '' : `<p class="attachment-note">${t('noDownloads')}</p>`}</div><section class="detail-abstract"><h2>${isProject ? (language === 'zh' ? '项目简介' : 'About the project') : (item.abstractKind === 'summary' ? t('abstractSummary') : t('abstract'))}</h2><p>${escape(isProject ? local(item.summary) : item.abstract)}</p>${!isProject ? `<span class="detail-source-note">${t(item.abstractKind === 'summary' ? 'paperSourceNote' : 'manuscriptNote')}</span>` : ''}</section>${['motivation', 'value', 'innovation'].filter(key => local(item[key])).map((key, i) => `<section class="detail-section"><span>0${i + 1}</span><h2>${t(key)}</h2><p>${escape(local(item[key]))}</p></section>`).join('')}<div class="detail-end">${button('#/?section=contact', t('startConversation'), 'button-yellow')}</div></article>`;
  }
  function quantum() {
    return `<section class="quantum-page container">${label('03', t('quantumKicker'))}<div class="quantum-content"><span class="coming-soon">${t('comingSoon')}</span><img class="quantum-atom" src="assets/icons/atom.svg" alt="" width="160" height="160"><h1>${t('quantumTitle')}<span>.</span></h1><p>${lines(t('quantumBody'))}</p><div class="hero-buttons">${button('#/', t('backHome'), 'button-blue')}${button('#/?section=contact', t('notifyUs'), 'button-outline')}</div></div><div class="quantum-bottom"><span>EUREKA STUDIO</span><span>EXPLORATION NEVER STOPS.</span></div></section>`;
  }
  function route(force = false) {
    const legacyRoutes = { home: '/', profile: '/?section=contact', latest: '/research' };
    let hash = legacyRoutes[location.hash.slice(1)] || location.hash.slice(1) || '/';
    const [path, query = ''] = hash.split('?');
    let parts;
    try { parts = path.split('/').filter(Boolean).map(decodeURIComponent); } catch (_) { parts = ['404']; }
    const page = parts[0] || 'home';
    const view = parts[1] ? `${page}/${parts[1]}` : page;
    const section = new URLSearchParams(query).get('section');
    if (view !== currentView || force) {
      disposeView(); sectionObserver?.disconnect();
      currentView = view;
      if (page === 'home') main.innerHTML = home();
      else if (page === 'research' && !parts[1]) main.innerHTML = research();
      else if (page === 'projects' && !parts[1]) main.innerHTML = projects();
      else if (page === 'quantum' && !parts[1]) main.innerHTML = quantum();
      else if ((page === 'research' || page === 'projects') && parts[1]) {
        const item = (page === 'research' ? content.publications : content.projects).find(item => item.id === parts[1]);
        main.innerHTML = item ? details(item, page === 'projects') : notFound();
      } else main.innerHTML = notFound();
      if (page === 'home') setupHome();
      else disposeView = () => {};
    }
    if (page === 'home') document.querySelector('#contact').append(siteFooter);
    else main.after(siteFooter);
    document.documentElement.classList.toggle('home-route', page === 'home');
    updateShell(); setMenu(false);
    document.querySelectorAll('[data-nav]').forEach(el => {
      const active = el.dataset.nav === page;
      el.classList.toggle('active', active);
      if (active) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
    });
    const selected = page === 'home' ? null : (page === 'research' ? content.publications : content.projects).find?.(item => item.id === parts[1]);
    document.title = selected ? `${selected.title} | Eureka Studio` : `Eureka Studio | ${page === 'home' ? (language === 'zh' ? '迈向全新学术范式' : 'Toward a new research paradigm') : t({ research: 'navResearch', projects: 'navProjects', quantum: 'navQuantum' }[page] || 'navHome')}`;
    requestAnimationFrame(() => {
      if (page === 'home' && ['intro', 'vision', 'feedback', 'contact'].includes(section)) document.getElementById(section)?.scrollIntoView({ behavior: force ? 'instant' : 'smooth', block: 'start' });
      else if (!force || view !== 'home') window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }
  function notFound() { return `<div class="empty-state not-found"><span>404</span><h1>${t('notFound')}</h1><p>${t('notFoundBody')}</p>${button('#/', t('backHome'), 'button-blue')}</div>`; }
  function setupHome() {
    disposeView = setupGrid();
    sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) document.querySelectorAll('[data-section]').forEach(a => {
          const active = a.dataset.section === entry.target.id;
          a.classList.toggle('active', active);
          if (active) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-25% 0px -45% 0px', threshold: 0 });
    document.querySelectorAll('.home-section').forEach(section => sectionObserver.observe(section));
  }
  function setupGrid() {
    const hero = document.querySelector('.hero');
    const canvas = document.querySelector('.hero-grid');
    const context = canvas.getContext('2d');
    if (!context) return () => {};
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const images = ['atom', 'focus-2', 'cpu', 'device-laptop', 'circles-relation', 'chart-donut'].map(name => {
      const image = new Image(); image.src = `assets/icons/${name}.svg`; return image;
    });
    let width = 0, height = 0, frame = 0, lastCell = '';
    const echoes = new Map();
    const unit = 48;
    function draw(time = performance.now()) {
      context.clearRect(0, 0, width, height);
      context.strokeStyle = '#dce1e5'; context.lineWidth = 0.7;
      context.beginPath();
      for (let x = 0; x <= width; x += unit) { context.moveTo(x, 0); context.lineTo(x, height); }
      for (let y = 0; y <= height; y += unit) { context.moveTo(0, y); context.lineTo(width, y); }
      context.stroke();
      for (const [key, echo] of echoes) {
        if (time - echo.time >= 1400) echoes.delete(key);
      }
      for (const e of echoes.values()) {
        const alpha = Math.max(0, 1 - (time - e.time) / 1400);
        context.fillStyle = `rgba(0,103,232,${alpha * 0.15})`; context.fillRect(e.x, e.y, unit, unit);
        if (e.image.complete && e.image.naturalWidth) { context.globalAlpha = alpha * 0.5; context.filter = 'invert(29%) sepia(99%) saturate(2760%) hue-rotate(206deg) brightness(93%)'; context.drawImage(e.image, e.x + 8, e.y + 8, 32, 32); context.globalAlpha = 1; context.filter = 'none'; }
      }
      frame = echoes.size ? requestAnimationFrame(draw) : 0;
    }
    function resize() {
      width = hero.clientWidth; height = hero.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * ratio; canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (!frame) draw();
    }
    function move(event) {
      if (reduced || event.pointerType === 'touch') return;
      const rect = hero.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / unit) * unit;
      const y = Math.floor((event.clientY - rect.top) / unit) * unit;
      const key = `${x},${y}`;
      if (key === lastCell) return;
      lastCell = key;
      // Cell coordinates fix the motif; revisiting refreshes one active entry.
      const hash = (Math.imul(x / unit + 1, 73856093) ^ Math.imul(y / unit + 1, 19349663)) >>> 0;
      echoes.delete(key);
      echoes.set(key, { x, y, time: performance.now(), image: images[hash % images.length] });
      if (echoes.size > 24) echoes.delete(echoes.keys().next().value);
      if (!frame) frame = requestAnimationFrame(draw);
    }
    function leave() { lastCell = ''; }
    const observer = new ResizeObserver(resize); observer.observe(hero);
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', leave, { passive: true });
    resize();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', leave); };
  }
  document.querySelector('#language-toggle').addEventListener('click', () => {
    const top = window.scrollY;
    language = language === 'zh' ? 'en' : 'zh';
    try { localStorage.setItem('eureka-language', language); } catch (_) { /* Session language remains available. */ }
    route(true); requestAnimationFrame(() => window.scrollTo({ top, behavior: 'instant' }));
  });
  document.querySelector('#menu-toggle').addEventListener('click', () => setMenu(document.querySelector('#menu-toggle').getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
  document.addEventListener('click', async event => {
    if (event.target.closest('.skip-link')) { event.preventDefault(); main.focus(); return; }
    const sameLink = event.target.closest('a[href^="#/"]');
    if (sameLink && sameLink.getAttribute('href') === (location.hash || '#/')) { event.preventDefault(); route(); }
    const copy = event.target.closest('[data-copy]');
    if (copy) {
      try { await navigator.clipboard.writeText(copy.dataset.copy); toast(t('copied')); } catch (_) { toast(t('copyFailed')); }
    }
    const remove = event.target.closest('[data-delete-comment]');
    if (remove) {
      comments = comments.filter(c => c.id !== remove.dataset.deleteComment);
      try { localStorage.setItem('eureka-feedback', JSON.stringify(comments)); } catch (_) { toast(t('storageFailed')); }
      document.querySelector('#comments-list').innerHTML = commentsMarkup();
      document.querySelector('#comment-count').textContent = String(comments.length).padStart(2, '0');
    }
    if (event.target.closest('#clear-search')) {
      document.querySelector('#research-search').value = '';
      document.querySelector('#research-search').dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  main.addEventListener('input', event => {
    if (event.target.id === 'feedback-message') document.querySelector('#character-count').textContent = `${event.target.value.length} / 1200`;
    if (event.target.id === 'research-search') {
      const query = event.target.value.toLowerCase().trim();
      const results = content.publications.filter(p => `${p.title} ${p.authors} ${local(p.field)} ${p.abstract}`.toLowerCase().includes(query));
      document.querySelector('#paper-list').innerHTML = results.map((p) => paperCard(p, content.publications.indexOf(p))).join('');
      document.querySelector('#research-empty').hidden = results.length > 0;
      document.querySelector('#research-count').textContent = `${String(results.length).padStart(2, '0')} ${t(query ? 'searchResult' : 'researchCount')}`;
    }
  });
  main.addEventListener('submit', event => {
    if (event.target.id !== 'feedback-form') return;
    event.preventDefault();
    const form = event.target;
    const name = form.elements.name.value.trim();
    const message = form.elements.message.value.trim();
    const status = document.querySelector('#form-status');
    if (!name || name.length > 40) { status.textContent = t('nameLength'); return; }
    if (!message || message.length > 1200) { status.textContent = t('messageLength'); return; }
    const comment = { id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`, name, message, time: Date.now() };
    comments.push(comment); comments = comments.slice(-20);
    let saved = true;
    try { localStorage.setItem('eureka-feedback', JSON.stringify(comments)); } catch (_) { saved = false; }
    document.querySelector('#comments-list').innerHTML = commentsMarkup();
    document.querySelector('#comment-count').textContent = String(comments.length).padStart(2, '0');
    form.reset(); document.querySelector('#character-count').textContent = '0 / 1200';
    status.innerHTML = `${escape(t(saved ? 'savedFeedback' : 'storageFailed'))} <a href="${escape(feedbackMail(comment))}">${t('sendEmail')}${icon('arrow-up-right')}</a>`;
  });
  window.addEventListener('hashchange', () => route());
  route();
})();
