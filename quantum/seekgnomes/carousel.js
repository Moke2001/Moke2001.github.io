/** A native-scroll, cyclic strip. Copies are rebased only onto identical
 * content, after movement ends, so the seam never animates back to the start. */
export function createCyclicCarousel(viewport, { paused, blocked, reducedMotion }) {
  const originals=[...viewport.children];
  if(!originals.length)return {step(){},destroy(){}};
  const copies=()=>originals.map(card=>{
    const copy=card.cloneNode(true);copy.dataset.clone='true';copy.setAttribute('aria-hidden','true');
    for(const element of copy.querySelectorAll('button,a,input,[tabindex]'))element.setAttribute('tabindex','-1');
    return copy;
  });
  const before=copies(),after=copies();viewport.prepend(...before);viewport.append(...after);
  let cycle=0,stride=0,lastLogical=0,hovered=false,focused=false,visible=false,settleTimer,resizeFrame,destroyed=false;
  const jump=left=>{
    const previous=viewport.style.scrollBehavior;
    viewport.style.scrollBehavior='auto';
    viewport.scrollTo({left,behavior:'instant'});
    viewport.style.scrollBehavior=previous;
  };
  function measure() {
    if(destroyed)return;
    const nextCycle=originals[0].offsetLeft-before[0].offsetLeft;
    const nextStride=originals.length>1?originals[1].offsetLeft-originals[0].offsetLeft:nextCycle;
    if(!nextCycle||!nextStride)return;
    cycle=nextCycle;stride=nextStride;
    jump(cycle+lastLogical*stride);
  }
  function normalize() {
    if(!cycle)return;
    const left=viewport.scrollLeft;
    const logical=((left-cycle)%cycle+cycle)%cycle;
    lastLogical=logical/stride;
    if(left<cycle-.5||left>=2*cycle-.5)jump(cycle+logical);
  }
  const onScroll=()=>{
    if(cycle)lastLogical=(((viewport.scrollLeft-cycle)%cycle+cycle)%cycle)/stride;
    clearTimeout(settleTimer);settleTimer=setTimeout(normalize,130);
  };
  function step(direction) {
    if(!cycle)return;
    normalize();
    const current=Math.round((viewport.scrollLeft-cycle)/stride);
    viewport.scrollTo({left:cycle+(current+Math.sign(direction))*stride,behavior:reducedMotion.matches?'instant':'smooth'});
  }
  const onEnter=()=>{hovered=true;},onLeave=()=>{hovered=false;};
  const onFocus=()=>{focused=true;},onBlur=()=>queueMicrotask(()=>{focused=viewport.contains(document.activeElement);});
  viewport.addEventListener('scroll',onScroll,{passive:true});viewport.addEventListener('scrollend',normalize);
  viewport.addEventListener('mouseenter',onEnter);viewport.addEventListener('mouseleave',onLeave);
  viewport.addEventListener('focusin',onFocus);viewport.addEventListener('focusout',onBlur);
  const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{threshold:.35});visibility.observe(viewport);
  const resize=new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(measure);});resize.observe(viewport);
  measure();
  const timer=setInterval(()=>{if(visible&&!paused()&&!blocked()&&!hovered&&!focused&&!document.hidden)step(1);},6000);
  return {
    step,
    destroy(){
      destroyed=true;clearInterval(timer);clearTimeout(settleTimer);cancelAnimationFrame(resizeFrame);resize.disconnect();visibility.disconnect();
      viewport.removeEventListener('scroll',onScroll);viewport.removeEventListener('scrollend',normalize);
      viewport.removeEventListener('mouseenter',onEnter);viewport.removeEventListener('mouseleave',onLeave);
      viewport.removeEventListener('focusin',onFocus);viewport.removeEventListener('focusout',onBlur);
      before.forEach(card=>card.remove());after.forEach(card=>card.remove());
    },
  };
}
