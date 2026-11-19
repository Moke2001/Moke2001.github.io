import katex from './assets/vendor/katex/katex.mjs';
import renderMathInElement from './assets/vendor/katex/contrib/auto-render.mjs';

export function mathElement(source, {display=false, className=''}={}) {
  const node=document.createElement(display?'div':'span');
  node.className=`sg-typeset-math ${display?'sg-display-math':''} ${className}`.trim();
  node.dataset.tex=source;
  katex.render(source,node,{displayMode:display,throwOnError:true,strict:'warn',trust:false,output:'htmlAndMathml'});
  return node;
}

export function typesetMath(root=document.body) {
  renderMathInElement(root,{
    delimiters:[{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false}],
    ignoredTags:['script','noscript','style','textarea','pre','code','option'],
    ignoredClasses:['katex','sg-typeset-math'],
    throwOnError:true,trust:false,strict:'warn',
    errorCallback(message,error){console.error('SeekGnomes formula rendering:',message,error);},
  });
}
