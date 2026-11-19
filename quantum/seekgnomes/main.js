import {renderTotalChart,renderMetricChart} from './charts.js';
import {getLanguage,setLanguage,t,applyStaticTranslations} from './i18n.js';
import {mathElement,typesetMath} from './math.js';
import {modelHamiltonian} from './model-math.js';
import {createCyclicCarousel} from './carousel.js';

const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
const number=(value,digits=1)=>Number(value).toFixed(digits);
const color={gpt:'#17a584',kimi:'#276bf0',deepseek:'#5480ef',mimo:'#ed9337',glm:'#8c66d9'};
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const compactChart=matchMedia('(max-width:760px)');
const dialog=$('#model-dialog');
let catalogue,ranking,modelTranslations,familyFilter=null,selectedTask=null,carouselPaused=reducedMotion.matches,carousel,toastTimer,dialogOpener;
let rankView='charts';
const zh=()=>getLanguage()==='zh';
const taskText=task=>zh()?{...task,...modelTranslations?.models?.[task.id]}:task;
const familyText=family=>zh()?{...family,...modelTranslations?.families?.[family.id]}:family;

function toast(message){clearTimeout(toastTimer);const node=$('.sg-toast');node.textContent=message;node.hidden=false;toastTimer=setTimeout(()=>{node.hidden=true;},2500);}
async function copyText(text,message){try{await navigator.clipboard.writeText(text);toast(message);}catch{toast(t('copyFailed'));}}
function configureLinks(){
  const config=window.SEEKGNOMES_CONFIG||{};
  if(config.studioHome){$('.sg-studio-brand').href=config.studioHome;$('.sg-footer a').href=config.studioHome;}
  if(config.quantumCloud)$('.sg-parent-link').href=config.quantumCloud;
  for(const button of $$('[data-resource]')){
    const key=button.dataset.resource;if(key==='citation')continue;
    const url=config.links?.[key];if(!url)continue;
    let parsed;try{parsed=new URL(url,location.href);}catch{continue;}
    if(!['https:','http:'].includes(parsed.protocol))continue;
    const link=el('a',button.className.replace('sg-pending',''));link.href=parsed.href;
    link.append(...[...button.childNodes].filter(n=>!(n.nodeType===1&&n.classList.contains('sg-soon'))));link.dataset.resource=key;button.replaceWith(link);
  }
  if(typeof config.citation==='string'&&config.citation.trim()){$('#citation-content').textContent=config.citation;const button=$('[data-resource=citation]');button.disabled=false;button.addEventListener('click',()=>copyText(config.citation,t('copiedCitation')));}
  if(new URLSearchParams(location.search).get('embed')==='1')document.body.classList.add('sg-embed');
}
function setupLanguageSwitcher(){
  $('#language-toggle').addEventListener('click',()=>setLanguage(zh()?'en':'zh'));
}
function chartModels(){return ranking.models.map(model=>({...model,id:model.family,label:model.display_label ?? model.label,color:color[model.family],icon:`./assets/brands/${model.family}.svg`}));}
function renderRanking(data){
  ranking=data;const models=chartModels();renderTotalChart($('#total-chart'),models,{compact:compactChart.matches});
  for(const[id,key]of[['pass-chart','pass_rate'],['improvement-chart','improvement_rate'],['amplitude-chart','amplitude_mean']])renderMetricChart($(`#${id}`),models,key);
  const rows=$('#rank-rows');rows.replaceChildren();
  for(const model of models){const tr=el('tr');tr.id=`rank-${model.id}`;tr.append(el('td','',String(model.rank)));const cell=el('td'),label=el('span','sg-model-cell'),icon=el('img');icon.src=model.icon;icon.alt='';icon.width=21;icon.height=21;label.append(icon,el('span','',model.label));cell.append(label);tr.append(cell,el('td','',number(model.score)),el('td','',`${number(model.ci95[0])} – ${number(model.ci95[1])}`));for(const key of['pass_rate','improvement_rate','amplitude_mean'])tr.append(el('td','',`${number(model[key]*100)}%`));rows.append(tr);}
  $('#rank-loading').hidden=true;setRankView(rankView);
}
function setRankView(view){rankView=view;for(const button of $$('[data-rank-view]')){const active=button.dataset.rankView===view;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));}$('#rank-charts').hidden=view!=='charts';$('#rank-table').hidden=view!=='table';}
for(const button of $$('[data-rank-view]'))button.addEventListener('click',()=>setRankView(button.dataset.rankView));
$('#total-chart').addEventListener('modelselect',event=>{setRankView('table');$$('#rank-rows tr').forEach(row=>row.classList.toggle('sg-selected',row.id===`rank-${event.detail.id}`));const row=document.getElementById(`rank-${event.detail.id}`);if(row){row.tabIndex=-1;row.focus({preventScroll:true});}});
compactChart.addEventListener('change',()=>{if(ranking)renderTotalChart($('#total-chart'),chartModels(),{compact:compactChart.matches});});

const descriptions={ising:'From transverse-field chains to higher-dimensional plaquette interactions: order, fluctuations and competing energy scales.',exchange:'Exchange interactions and frustrated geometries challenge simple ordering and product-state intuition.',kitaev:'Bond-dependent interactions connect directional spin physics, gauge structure and exactly solvable limits.',cluster:'Local multi-qubit interactions test constructions with symmetry-protected and circuit-generated structure.',topological:'Nonlocal organization emerges from local constraints in toric-code and related lattice Hamiltonians.',fracton:'Three-dimensional stabilizer structures probe subsystem constraints and restricted excitation mobility.'};
function renderFamilies(){
  carousel?.destroy();const cards=$('#model-cards');cards.replaceChildren();
  for(const family of catalogue.families){const copyText=familyText(family),card=el('article','sg-model-card');card.dataset.family=family.id;
    const art=el('div','sg-model-art'),image=el('img');image.src=`./assets/illustrations/${family.id}.svg`;image.alt=zh()?`${copyText.name}的局域结构示意`:`Schematic local structure for ${family.name}`;image.width=320;image.height=140;art.append(image);
    const copy=el('div','sg-model-card-copy'),meta=el('div','sg-model-card-meta'),tasks=catalogue.models.filter(task=>task.family===family.id),dimensions=[...new Set(tasks.map(task=>task.dimension))].sort();
    meta.append(el('span','',t('hamiltonianCount',{count:tasks.length})),el('span','',dimensions.map(d=>`${d}D`).join(' / ')));copy.append(meta,el('h3','',copyText.name),el('p','',zh()?copyText.description:descriptions[family.id]||family.description));
    const button=el('button','sg-text-button');button.type='button';button.dataset.exploreFamily=family.id;button.append(el('span','',t('familyExplore')),arrow());copy.append(button);card.append(art,copy);cards.append(card);
  }
  carousel=createCyclicCarousel(cards,{paused:()=>carouselPaused,blocked:()=>dialog.open,reducedMotion});updatePause();
}
function updatePause(){const button=$('#models-pause');button.setAttribute('aria-pressed',String(carouselPaused));button.setAttribute('aria-label',t(carouselPaused?'resumeCarousel':'pauseCarousel'));button.replaceChildren(carouselPaused?playIcon():pauseIcon());}
$('#model-cards').addEventListener('click',event=>{const button=event.target.closest('[data-explore-family]');if(button)openLibrary(button.dataset.exploreFamily,button.closest('[data-clone]')?$('#model-cards'):button);});
$('#models-next').addEventListener('click',()=>carousel?.step(1));$('#models-prev').addEventListener('click',()=>carousel?.step(-1));
$('#models-pause').addEventListener('click',()=>{carouselPaused=!carouselPaused;updatePause();});
reducedMotion.addEventListener('change',event=>{if(event.matches){carouselPaused=true;updatePause();}});
function svgIcon(paths){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');for(const d of paths){const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',d);svg.append(path);}return svg;}
function arrow(){return svgIcon(['M5 12h14m-6-6 6 6-6 6']);}
function pauseIcon(){return svgIcon(['M9 5v14M15 5v14']);}
function playIcon(){return svgIcon(['m9 5 10 7-10 7z']);}

function libraryTitle(){const family=catalogue?.families.find(f=>f.id===familyFilter);$('#dialog-title').textContent=family?familyText(family).name:t('allModelsTitle');}
function openLibrary(family,opener){if(!catalogue)return;familyFilter=family;selectedTask=null;dialogOpener=opener;$('#model-search').value='';$('#model-dimension').value='all';libraryTitle();renderModelList();document.body.style.overflow='hidden';dialog.showModal();$('#model-search').focus({preventScroll:true});}
$('#model-search').addEventListener('input',renderModelList);$('#model-dimension').addEventListener('change',renderModelList);
$('#clear-model-filters').addEventListener('click',()=>{familyFilter=null;$('#model-search').value='';$('#model-dimension').value='all';libraryTitle();renderModelList();});
$('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.body.style.overflow='';const target=dialogOpener?.isConnected?dialogOpener:$('#model-cards');target?.focus({preventScroll:true});});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});

function renderModelList(){
  if(!catalogue)return;const query=$('#model-search').value.trim().toLowerCase(),dimension=$('#model-dimension').value;
  const tasks=catalogue.models.filter(task=>{const copy=taskText(task);return(!familyFilter||task.family===familyFilter)&&(dimension==='all'||String(task.dimension)===dimension)&&(!query||`${task.id} ${task.name} ${task.short_name} ${task.description} ${task.family} ${copy.name} ${copy.description}`.toLowerCase().includes(query));});
  $('#model-count').textContent=t('modelCount',{count:tasks.length,total:50})+(familyFilter?` · ${t('familyFilter')}`:'');const list=$('#model-list');list.replaceChildren();if(!tasks.some(task=>task.id===selectedTask))selectedTask=tasks[0]?.id||null;
  for(const task of tasks){const copy=taskText(task),item=el('div');item.setAttribute('role','listitem');const button=el('button',`sg-task-item${task.id===selectedTask?' active':''}`);button.type='button';button.dataset.task=task.id;button.setAttribute('aria-current',String(task.id===selectedTask));const text=el('span');text.append(el('strong','',copy.name),el('small','',t('qubitsCell',{dimension:task.dimension,q:task.qubits_per_cell})));button.append(el('span','sg-task-id',task.id),text);button.addEventListener('click',()=>{selectedTask=task.id;$$('.sg-task-item',list).forEach(b=>{const active=b.dataset.task===task.id;b.classList.toggle('active',active);b.setAttribute('aria-current',String(active));});renderModelDetail(task);});item.append(button);list.append(item);}
  if(!tasks.length){list.append(el('p','sg-empty-results',t('emptyModels')));$('#model-detail').replaceChildren(el('p','',t('noSelection')));}else renderModelDetail(tasks.find(task=>task.id===selectedTask));
}
function renderModelDetail(task){
  const copy=taskText(task),formula=modelHamiltonian(task,getLanguage()),detail=$('#model-detail');detail.replaceChildren();detail.scrollTop=0;
  detail.append(el('h3','',copy.name),el('p','sg-detail-meta',t('taskMeta',{id:task.id,dimension:task.dimension,q:task.qubits_per_cell})),el('p','',copy.description));
  const hamiltonian=el('section','sg-detail-block sg-hamiltonian');hamiltonian.append(el('h4','',t('hamiltonianTitle')),mathElement(formula.hamiltonian,{display:true}));
  if(formula.definitions?.length){const definitions=el('div','sg-model-definitions');for(const source of formula.definitions)definitions.append(mathElement(source,{display:true}));hamiltonian.append(definitions);}
  if(formula.notation)hamiltonian.append(el('p','',formula.notation[getLanguage()]||formula.notation.en));detail.append(hamiltonian);
  const params=el('section','sg-detail-block');params.append(el('h4','',t('parametersTitle')));const grid=el('div','sg-parameter-grid');const parameterFormulas=Array.isArray(formula.parameterLatex)?formula.parameterLatex:[formula.parameterLatex].filter(Boolean);
  if(parameterFormulas.length)for(const source of parameterFormulas)grid.append(mathElement(source));else grid.append(el('span','',t('fixedPoint')));params.append(grid);detail.append(params);
  const exact=el('details','sg-exact-density');exact.append(el('summary','',t('localDensityTitle')),mathElement(formula.expandedLocalDensity||formula.localDensity,{display:true}));
  exact.append(mathElement(String.raw`\hat H=\sum_{\mathbf r\in\mathbb Z^{${task.dimension}}}\tau_{\mathbf r}(\hat h_{\mathbf0}),\qquad e(f)=\frac{1}{${task.qubits_per_cell}}\,\omega(\hat h_{\mathbf0})`,{display:true}));exact.append(el('p','',t('localDensityExplanation')));detail.append(exact);
  const lattice=el('section','sg-detail-block');lattice.append(el('h4','',t('latticeTitle')),el('p','',typeof copy.lattice==='string'?copy.lattice:JSON.stringify(copy.lattice)),el('p','',t('conventionsText')));if(task.historical_rank_task)lattice.append(el('p','',t('historicalTaskNote')));detail.append(lattice);
  const sources=el('section','sg-detail-block');sources.append(el('h4','',t('sourcesTitle')));const links=el('div','sg-detail-sources');task.sources.forEach((url,i)=>{try{const parsed=new URL(url);if(!['https:','http:'].includes(parsed.protocol))return;const a=el('a','',t('referenceN',{n:i+1}));a.href=parsed.href;a.target='_blank';a.rel='noopener noreferrer';links.append(a);}catch{}});sources.append(links,el('p','sg-detail-frozen',t('definitionHash',{hash:task.canonical_sha256})));detail.append(sources);typesetMath(detail);
}

function refreshLanguage(){
  applyStaticTranslations();const image=$('.sg-framework img'),source=`./assets/illustrations/overview${zh()?'.zh':''}.svg`;image.src=source;image.width=1320;image.height=880;$('.sg-framework-link').href=source;updatePause();
  if(ranking)renderRanking(ranking);if(catalogue){renderFamilies();libraryTitle();if(dialog.open)renderModelList();}typesetMath();
}
window.addEventListener('seekgnomes:languagechange',refreshLanguage);
async function loadData(){
  try{const responses=await Promise.all(['./data/leaderboard.json','./data/models.json','./data/model-translations.json'].map(path=>fetch(new URL(path,import.meta.url))));if(responses.some(response=>!response.ok))throw new Error('A local data file could not be loaded');const[rank,models,translations]=await Promise.all(responses.map(response=>response.json()));if(rank.models.length!==5||models.models.length!==50)throw new Error('Unexpected snapshot coverage');ranking=rank;catalogue=models;modelTranslations=translations;renderRanking(rank);renderFamilies();typesetMath();}
  catch(error){$('#rank-loading').textContent=t('dataUnavailable');$('#model-cards').replaceChildren(el('p','sg-loading',t('modelsUnavailable')));console.error('SeekGnomes local data load failed:',error);}
}
configureLinks();setupLanguageSwitcher();refreshLanguage();loadData();
$('#copy-commands').addEventListener('click',()=>copyText($('#example-commands').textContent,t('copiedCommands')));
window.addEventListener('pagehide',()=>carousel?.destroy());
