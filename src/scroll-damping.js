/** Damped desktop wheel scrolling. Touch and accessibility scrolling stay native. */
export function mountScrollDamping(){
 const abort=new AbortController();let raf=0,goal=scrollY,last=0,written=scrollY;
 const cancel=()=>{cancelAnimationFrame(raf);raf=0;goal=scrollY;last=0};
 const tick=t=>{const dt=Math.min(40,t-(last||t-16));last=t;const next=scrollY+(goal-scrollY)*(1-Math.exp(-dt/115));written=Math.abs(goal-next)<.5?goal:next;window.scrollTo({top:written,behavior:'instant'});if(Math.abs(goal-scrollY)>.5)raf=requestAnimationFrame(tick);else{raf=0;last=0}};
 const wheel=e=>{
  if(e.defaultPrevented){cancel();return}
  if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||document.body.style.overflow==='hidden'||matchMedia('(prefers-reduced-motion: reduce)').matches||e.target.closest('dialog,input,textarea,select,[data-native-scroll]'))return;
  const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
  if(!delta)return;e.preventDefault();if(!raf)goal=scrollY;goal=Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,goal+delta));if(!raf)raf=requestAnimationFrame(tick);
 };
 window.addEventListener('scroll',()=>{if(raf&&Math.abs(scrollY-written)>2)cancel()},{passive:true,signal:abort.signal});
 window.addEventListener('wheel',wheel,{passive:false,signal:abort.signal});
 for(const type of ['pointerdown','touchstart','keydown','resize'])window.addEventListener(type,cancel,{passive:true,signal:abort.signal});
 return()=>{cancel();abort.abort()};
}
