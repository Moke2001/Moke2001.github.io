/* Local, dependency-free translations. Only module-owned strings may contain
 * HTML; user data is always rendered by the caller as text. */
const copy = {
  pageTitle: ['SeekGnomes — Quantum many-body discovery with LLMs', 'SeekGnomes — 用大语言模型探索量子多体态'],
  pageDescription: ['SeekGnomes benchmarks LLM-driven construction of quantum many-body states on infinite lattices, with explicit state definitions and formal verification.', 'SeekGnomes测评大语言模型在无限格点系统中构造量子多体态的能力, 结合明确的态定义与形式化核验.'],
  skipContent: ['Skip to content', '跳到主要内容'],
  studioHome: ['Eureka Studio home', 'Eureka Studio首页'],
  projectNavigation: ['Project navigation', '项目导航'],
  overview: ['Overview', '项目简介'],
  llmRank: ['LLM rank', 'LLM排名'],
  models: ['Models', '物理模型'],
  getStarted: ['Get started', '开始使用'],
  quantumCloud: ['Quantum Cloud', '量子云'],
  navOpen: ['Open navigation', '打开导航'],
  navClose: ['Close navigation', '关闭导航'],
  switchLanguage: ['Switch to Chinese', '切换为英文'],
  tagline: ['Benchmarking LLMs’ physics research capabilities with quantum ground-state calculations.', '用量子基态计算作为LLMs的物理学研究能力的基准测试'],
  gravityCanvas: ['Earth, Venus and Mars in a periodic three-body simulation. Use the arrow keys to position a gravity source. Press Escape to release it and Space to pause or resume.', '周期空间中地球, 金星和火星的三体运动演示. 方向键移动引力源, Esc释放, 空格暂停或继续.'],
  gravityReset: ['Reset to the three-body orbit', '恢复初始三体轨道'],
  projectResources: ['Project resources', '项目资源'],
  results: ['Results', '测评结果'],
  soon: ['Soon', '待开放'],
  githubPending: ['GitHub link will be added when the project is released', '项目发布后将在此添加GitHub链接'],
  paperPending: ['Paper link will be added after publication', '论文发布后将在此添加链接'],
  abstractTitle: ['From a Hamiltonian to a better quantum state.', '<span class="sg-clause">从一个哈密顿量出发,</span> <span class="sg-clause">寻找更好的量子态.</span>'],
  abstractQuestion: ['Can a language model turn physical intuition into an explicit state of an infinite quantum system? SeekGnomes asks LLMs to construct states, establish their validity, and search for lower energy densities.', '语言模型能否把物理直觉转化为无限量子系统上明确的态构造? SeekGnomes让LLM构造态, 证明其合法性, 并寻找能量密度更低的态.'],
  abstractRepresentation: [String.raw`States are described through Pauli expectation functions, <span class="sg-math">\(f(P)=\omega(P)\)</span>. A fixed Lean specification checks legality and translation invariance. The same state definition then enters the energy evaluator.`, String.raw`我们用Pauli算符期望值函数<span class="sg-math">\(f(P)=\omega(P)\)</span>描述态. 固定的Lean规格检查合法性与平移不变性, 同一份态定义随后进入能量计算程序.`],
  abstractNote: ['The goal is a verifiable state construction. A low energy alone is not a proof that a candidate is a ground state.', '目标是可核验的态构造. 能量较低本身并不证明候选态就是基态.'],
  frameworkAlt: ['A quantum many-body model library above three connected panels for physical construction, formal verification and energy evaluation. The twelve model illustrations are representative examples of the fifty-model library.', '上方为量子多体模型题库, 下方三个面板分别展示物理构造, 形式化核验和能量计算. 十二张模型插图是50模型题库中的代表性例子.'],
  frameworkZoom: ['Open full-size diagram', '查看原尺寸示意图'],
  frameworkCaption: ['Construct. Formalize. Verify. Improve.', '构造. 形式化. 核验. 改进.'],
  frameworkDevelopment: ['The two-role framework under development.', '正在完善的双角色测评框架.'],
  viewDiagram: ['View diagram ↗', '查看示意图 ↗'],
  rankSubtitle: ['A first look at verified many-body state construction.', '观察LLM构造可核验多体态的能力.'],
  historicalSnapshot: ['Historical snapshot · 13 Nov 2026', '历史结果 · 2026-11-13'],
  trialCoverage: ['<strong>10 tasks</strong> × 5 trials per model · No web access', '<strong>10道题</strong> × 每个模型每题5次 · 禁止联网'],
  leaderboardView: ['Leaderboard view', '排行榜视图'],
  chartsView: ['Charts', '图表'],
  tableView: ['Table', '表格'],
  rankLoading: ['Loading the recorded results…', '正在读取已记录的测评结果…'],
  overallScore: ['Overall score', '综合分数'],
  pointsInterval: ['0–100 points · 95% interval', '百分制 · 95%区间'],
  scoreComponents: ['Three score components', '三个评分组成部分'],
  metricPass: ['Verified-state rate', '合法态通过率'],
  metricImprovement: ['Improvement rate', '基线改善率'],
  metricAmplitude: ['Mean improvement', '平均改善幅度'],
  weight30: ['30% weight', '权重30%'],
  weight40: ['40% weight', '权重40%'],
  rankTableCaption: ['Historical SeekGnomes ranking. Ten tasks and five trials per model, 2026-11-13.', 'SeekGnomes历史排名. 10道题, 每个模型每题5次, 2026-11-13.'],
  rankColumn: ['Rank', '名次'],
  modelColumn: ['Model', '模型'],
  scoreColumn: ['Score / 100', '分数 / 100'],
  intervalColumn: ['95% interval', '95%区间'],
  rankUpdateNote: ["This table shows the project's initial test results. We will update the rankings as further tests are completed.", '该表格来自项目初始测试结果, 后续进一步测试完成后将同步更新排名'],
  scoringDetails: ['Scoring, uncertainty & evaluation details', '评分, 不确定性与测评细节'],
  scoringTitle: ['One score, three components', '一项总分, 三个组成部分'],
  scoreEquation: [String.raw`\(S=30P+30R+40A\)`, String.raw`\(S=30P+30R+40A\)`],
  scoringComponents: [String.raw`<strong>P</strong> is the fraction of trials with a verified legal state. <strong>R</strong> counts trials whose original improvement <span class="sg-math">\(I=\max(0,(B-U)/s)\)</span> reaches 0.01. <strong>A</strong> averages <span class="sg-math">\(\max(0,(B-U)/(B-L))\)</span>, with zero for scientific failures without a verified state.`, String.raw`<strong>P</strong>是得到核验通过合法态的试次比例. <strong>R</strong>统计原改善指标<span class="sg-math">\(I=\max(0,(B-U)/s)\)</span>达到0.01的试次比例. <strong>A</strong>对<span class="sg-math">\(\max(0,(B-U)/(B-L))\)</span>取平均, 未得到合法态的科学失败计0.`],
  scoringSymbols: [String.raw`<span class="sg-math">\(B\)</span> is the baseline energy; <span class="sg-math">\(U\)</span> the verified candidate upper bound in the historical protocol; <span class="sg-math">\(L\)</span> the algebraic lower bound, not a known exact ground energy; <span class="sg-math">\(s\)</span> the interaction scale.`, String.raw`<span class="sg-math">\(B\)</span>为基线能量; <span class="sg-math">\(U\)</span>为历史协议中核验通过的候选能量上界; <span class="sg-math">\(L\)</span>为代数下界, 不是已知的精确基态能量; <span class="sg-math">\(s\)</span>为相互作用尺度.`],
  snapshotContextTitle: ['Read the snapshot in context', '理解这份历史结果'],
  uncertaintyText: ['The ten tasks have equal weight, each with five independent trials. The 95% intervals resample trials within each fixed task (10,000 bootstrap samples). They do not measure task-selection or deployment uncertainty.', '10道题等权, 每题5次独立试验. 95%区间在每道固定题目内部对试次重采样, 共进行10,000次bootstrap重采样. 它不包含选题或部署差异带来的不确定性.'],
  deploymentText: ['GLM-5.3 combines 49 <code>bh2</code> trials and one <code>infi</code> trial. The MiMo–GLM difference interval crosses zero, so their point-estimate order is not a robust distinction.', 'GLM-5.3合并了49次<code>bh2</code>部署和1次<code>infi</code>部署的试验. MiMo与GLM的分数差区间跨过0, 因此两者点估计的名次差不具有稳健性.'],
  historicalTaskParagraph: ['Task IDs: <span id="historical-task-ids">01, 07, 08, 13, 17, 22, 25, 34, 39, 48</span>. Infrastructure gaps were not scored as scientific failures. These historical scores are retained independently of the revised scoring rules.', '题号: <span id="historical-task-ids">01, 07, 08, 13, 17, 22, 25, 34, 39, 48</span>. 技术故障留下的缺失不计作科学失败. 这份历史成绩单独保留, 不按修订中的评分规则重算.'],
  physicalModelsTitle: ['The physical models', '量子多体物理模型'],
  physicalModelsSubtitle: ['50 Hamiltonians. Infinite lattices. Different kinds of quantum structure.', '50个哈密顿量, 无限大晶格, 不同类型的量子结构.'],
  previousFamilies: ['Previous model families', '上一组模型'],
  nextFamilies: ['Next model families', '下一组模型'],
  pauseCarousel: ['Pause automatic model scrolling', '暂停模型自动滚动'],
  resumeCarousel: ['Resume automatic model scrolling', '恢复模型自动滚动'],
  carouselLabel: ['Model family carousel', '物理模型分类轮播'],
  modelLoading: ['Loading the physical model library…', '正在读取物理模型题库…'],
  physicalSettingTitle: ['A shared physical setting', '共同的物理设定'],
  physicalSetting: [String.raw`Each site carries a qubit. A finite unit cell is repeated over <span class="sg-math">\(\mathbb Z^d\)</span>, in one, two, or three dimensions. Interactions have finite support and repeat under cell translations.`, String.raw`每个格点承载一个量子比特(qubit). 有限晶胞在一维, 二维或三维格点<span class="sg-math">\(\mathbb Z^d\)</span>上重复. 相互作用具有有限支撑, 并在晶胞平移下重复.`],
  expectationsTitle: ['One state, local expectations', '一个态, 局域期望值'],
  expectations: [String.raw`A candidate specifies <span class="sg-math">\(f(P)\)</span> for every finitely supported Pauli word. Legality means normalized, positive local density matrices for all finite regions; translation invariance is a separate obligation.`, String.raw`候选态为每个有限支撑Pauli字指定<span class="sg-math">\(f(P)\)</span>. 合法性要求所有有限区域的局域密度矩阵归一化且半正定; 平移不变性是另一项独立证明义务.`],
  energyTitle: ['Energy per physical qubit', '每个物理qubit的能量'],
  energyText: [String.raw`For <span class="sg-math">\(q\)</span> qubits per cell and local density <span class="sg-math">\(h_0=\sum_j c_jP_j\)</span>, evaluate <span class="sg-math">\(e(f)=\frac{1}{q}\sum_j c_jf(P_j)\)</span>. Energies are numerical floats; the state proof does not certify rounding error.`, String.raw`若每晶胞有<span class="sg-math">\(q\)</span>个qubit, 局域哈密顿量密度为<span class="sg-math">\(h_0=\sum_j c_jP_j\)</span>, 则计算<span class="sg-math">\(e(f)=\frac{1}{q}\sum_j c_jf(P_j)\)</span>. 能量采用浮点数值, 态的证明不认证舍入误差.`],
  modelFootnote: [String.raw`The drawings show local structure, not finite-size simulations. Full parameters and exact Pauli terms are available in each model’s details. For exchange models, <span class="sg-math">\(\mathbf S=\boldsymbol{\sigma}/2\)</span>.`, String.raw`示意图展示局域结构, 不代表有限尺寸数值模拟. 各模型详情中列出完整参数与精确Pauli项. 交换模型采用<span class="sg-math">\(\mathbf S=\boldsymbol{\sigma}/2\)</span>.`],
  startSubtitle: ['Run the benchmark locally, with your own model.', '使用自己的LLM, 在本地运行测评.'],
  releaseVersion: ['v1.3.0', 'v1.3.0'],
  environmentStep: ['Check your environment', '检查运行环境'],
  environmentText: ['Linux amd64 containers, at least 2 available CPU cores and 12 GiB available memory. A GPU is not required.', '使用Linux amd64容器, 至少2个可用CPU核心和12GiB可用内存, 无需GPU.'],
  configureStep: ['Configure your LLM', '配置LLM'],
  configureText: ['Enter your model ID, API endpoint and API key on your machine.', '在本机输入模型ID, API地址和API key.'],
  inspectStep: ['Run & inspect', '运行并检查结果'],
  inspectText: ['Keep definitions, proofs, verifier logs, energies and resource records. The report separates complete results from technical gaps.', '保留态定义, 证明, 核验日志, 能量和资源记录. 报告会区分完整科学结果与技术故障造成的缺失.'],
  localTerminal: ['Local terminal · after building the image', '本地终端 · 镜像构建完成后'],
  copyCommands: ['Copy example commands', '复制示例命令'],
  copy: ['Copy', '复制'],
  commandCheck: ['# Check the environment and verifier, without a model API call', '# 检查环境与核验器, 不调用模型API'],
  commandConfigure: ['# Enter your API endpoint, model ID and key interactively', '# 按提示输入API地址, 模型ID和key'],
  downloadPackage: ['Download package', '下载测评包'],
  citeTitle: ['Cite SeekGnomes', '引用SeekGnomes'],
  citeRepository: ['If you use this project, please consider citing us using the format below.', '如果使用本项目, 可以考虑用下面的格式引用我们.'],
  citationBibtex: ['SeekGnomes BibTeX citation', 'SeekGnomes的BibTeX引用'],
  copyCitation: ['Copy citation', '复制引用'],
  footerProject: ['Quantum Cloud / SeekGnomes', '量子云 / SeekGnomes'],
  backToTop: ['Back to top', '返回顶部'],
  libraryTitle: ['The model library', '物理模型题库'],
  allModelsTitle: ['Explore the Hamiltonians', '浏览哈密顿量'],
  closeLibrary: ['Close model library', '关闭模型题库'],
  modelSearchPlaceholder: ['Search a model, family or task ID', '搜索模型, 分类或题号'],
  modelSearchLabel: ['Search physical models', '搜索物理模型'],
  dimension: ['Dimension', '空间维度'],
  allDimensions: ['All dimensions', '全部维度'],
  dimension1: ['1D', '一维'],
  dimension2: ['2D', '二维'],
  dimension3: ['3D', '三维'],
  clearFilters: ['Clear filters', '清除筛选'],
  physicalModelsLabel: ['Physical models', '物理模型'],
  noscript: ['The project overview is available above. Enable JavaScript to inspect the recorded ranking and explore the model library.', '上方可以阅读项目简介. 请启用JavaScript查看已记录的排名和浏览物理模型题库.'],
  copiedCommands: ['Example commands copied.', '示例命令已复制.'],
  copyFailed: ['Copy unavailable. Select the text and copy it directly.', '无法自动复制, 请选中文字后直接复制.'],
  copiedCitation: ['Citation copied.', '引用已复制.'],
  familyExplore: ['Explore models', '浏览模型'],
  hamiltonianCount: ['{count} HAMILTONIANS', '{count}个哈密顿量'],
  modelCount: ['{count} of {total} models', '共{total}个模型, 当前显示{count}个'],
  familyFilter: ['family filter', '按分类筛选'],
  emptyModels: ['No matching model. Try clearing the filters.', '没有匹配的模型, 可以尝试清除筛选.'],
  noSelection: ['No model selected.', '尚未选择模型.'],
  taskMeta: ['Task {id} · {dimension}D · {q} physical qubits per unit cell', '题目{id} · {dimension}维 · 每晶胞{q}个物理qubit'],
  qubitsCell: ['{dimension}D · {q} qubits / cell', '{dimension}维 · 每晶胞{q}个qubit'],
  parametersTitle: ['Frozen parameters', '固定参数'],
  fixedPoint: ['Fixed-point Hamiltonian', '固定点哈密顿量'],
  hamiltonianTitle: ['Hamiltonian', '哈密顿量'],
  localDensityTitle: [String.raw`Local Hamiltonian density \(h_0\)`, String.raw`局域哈密顿量密度\(h_0\)`],
  definitionsTitle: ['Definitions & conventions', '定义与约定'],
  latticeTitle: ['Lattice & conventions', '晶格与约定'],
  localDensityExplanation: [String.raw`Each subscript is (cell coordinate; qubit index). The full infinite Hamiltonian repeats \(h_0\) over all cell translations. Energy per qubit is \(\omega(h_0)/q\).`, String.raw`每个下标表示(晶胞坐标; qubit编号). 完整无限哈密顿量将\(h_0\)按所有晶胞平移重复. 每个qubit的能量为\(\omega(h_0)/q\).`],
  conventionsText: [String.raw`\(X,Y,Z\) are Pauli matrices, not spin operators. In exchange expressions, \(\mathbf S=\boldsymbol{\sigma}/2\). Invariance is under translations of the full unit cell.`, String.raw`\(X,Y,Z\)表示Pauli矩阵, 不是自旋算符. 交换相互作用中采用\(\mathbf S=\boldsymbol{\sigma}/2\). 平移不变性指整个晶胞的平移.`],
  historicalTaskNote: ['This task is included in the historical ten-task ranking.', '此题包含在历史10题排名中.'],
  sourcesTitle: ['Model references', '模型参考资料'],
  referenceN: ['Reference {n} ↗', '参考资料{n} ↗'],
  definitionHash: ['Frozen definition SHA-256: {hash}', '固定定义SHA-256: {hash}'],
  rankChartTitle: ['LLM composite scores', 'LLM综合分数'],
  rankTotalDescription: ['Historical ten-task benchmark. Scores are out of 100. Error bars show fixed-task 95% bootstrap intervals. Select a model bar to inspect its table row.', '历史10题测评, 分数采用百分制. 误差线表示固定题目下的95% bootstrap区间. 选择模型柱可查看对应表格行.'],
  modelSelectedLabel: ['{model} selected.', '已选择{model}.'],
  scoreAxis: ['Score / 100', '分数 / 100'],
  intervalLabel: ['95% interval', '95%区间'],
  modelChartLabel: ['{model}: {score} out of 100; 95% interval {low} to {high}. Select model.', '{model}: 百分制{score}分; 95%区间{low}至{high}. 选择此模型.'],
  metricDescription: ['{metric} for the same five models, in leaderboard order. The scale is fixed at 0 to 100 percent.', '相同五个模型的{metric}, 顺序与排行榜一致. 刻度固定为0至100%.'],
  dataUnavailable: ['The recorded data could not be loaded. Serve this directory over HTTP and try again.', '无法读取已记录的数据. 请通过HTTP提供此目录后重试.'],
  modelsUnavailable: ['The model data is unavailable. Please reload the page.', '暂时无法读取模型数据, 请重新加载页面.'],
  familySchematic: ['Schematic local structure for {family}', '{family}的局域结构示意图'],
  modelColumnLabel: ['Model', '模型'],
};

function normalizeLanguage(value) {
  return typeof value === 'string' && /^zh(?:-|$)/i.test(value) ? 'zh'
    : typeof value === 'string' && /^en(?:-|$)/i.test(value) ? 'en' : null;
}

function initialLanguage() {
  const query = normalizeLanguage(new URL(location.href).searchParams.get('lang'));
  if (query) return query;
  try {
    const saved = normalizeLanguage(localStorage.getItem('seekgnomes-language'));
    if (saved) return saved;
  } catch { /* Storage may be disabled in a private/embedded context. */ }
  return normalizeLanguage(navigator.language) || 'en';
}

let language = initialLanguage();

export function getLanguage() { return language; }

export function t(key, vars = {}) {
  const pair = copy[key];
  const text = pair ? pair[language === 'zh' ? 1 : 0] : key;
  return text.replace(/\{(\w+)\}/g, (match, name) => Object.hasOwn(vars, name) ? String(vars[name]) : match);
}

function matching(root, selector) {
  return [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
}

export function applyStaticTranslations(root = document) {
  for (const node of matching(root, '[data-i18n]')) node.textContent = t(node.dataset.i18n);
  // The only HTML values used here are constant, module-owned copy above.
  for (const node of matching(root, '[data-i18n-html]')) node.innerHTML = t(node.dataset.i18nHtml);
  for (const name of ['aria-label', 'title', 'placeholder', 'content', 'alt']) {
    const attr = `data-i18n-${name}`;
    for (const node of matching(root, `[${attr}]`)) node.setAttribute(name, t(node.getAttribute(attr)));
  }
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  const toggle = document.getElementById('language-toggle');
  if (toggle) {
    for (const node of toggle.querySelectorAll('[data-lang]')) node.classList.toggle('selected', node.dataset.lang === language);
  }
}

export function setLanguage(value) {
  const next = normalizeLanguage(value);
  if (!next) throw new RangeError('Language must be zh or en');
  language = next;
  try { localStorage.setItem('seekgnomes-language', language); } catch { /* Optional persistence. */ }
  const url = new URL(location.href);
  url.searchParams.set('lang', language);
  try { history.replaceState(history.state, '', url); } catch { /* A static file preview may reject history changes. */ }
  applyStaticTranslations();
  window.dispatchEvent(new CustomEvent('seekgnomes:languagechange', { detail: { language } }));
  return language;
}
