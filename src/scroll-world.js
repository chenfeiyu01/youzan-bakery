/* Adapted from oso95/scroll-world (MIT): segment timeline, blob-seeking,
 * seek coalescing, rAF smoothing, poster fallback and reduced-motion support.
 * This version separates the brand UI, adds cleanup, cancellation and autoplay.
 * Original license is retained in THIRD_PARTY_LICENSES/scroll-world.txt. */
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = x => { x = clamp(x); return x*x*(3-2*x); };
export function mountScrollWorld(container, config) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => matchMedia('(max-width: 760px)').matches;
  const abort = new AbortController();
  let destroyed=false, raf=0, target=0, current=0, prevTime=0, playing=false;
  let motion=null,suppressSnapUntil=0,lastWheel=0,wheelSum=0,settledAt=0,touchY=null,touchUsed=false,snapTimer=0;
  let viewport=innerHeight, width=innerWidth, active=-1, lastStatus='';
  const intro=.28, ending=reduced?.6:2.2;
  let offset=intro;
  const segments=config.sections.map((section,i)=>{
    const s={...section, start:offset, end:offset+section.scroll, loading:false, ready:false, painted:false, url:null, failed:false};offset=s.end;
    const layer=document.createElement('div');layer.className='film-layer';layer.style.opacity=i===0?'1':'0';
    const image=document.createElement('img');image.alt='';image.decoding='async';
    if(i===0||i===config.sections.length-1){image.loading='eager';image.fetchPriority='high';layer.classList.add('boundary-poster')}else image.loading='lazy';
    image.src=section.poster;
    layer.append(image);container.append(layer);s.layer=layer;s.image=image;
    return s;
  });
  const total=offset+ending;
  const stops=[0,...segments.slice(1).map(s=>s.start),offset+.001,total];
  let downloading=false;
  function animateTo(index){
    const from=current,to=stops[index];
    if(Math.abs(to-from)<.002)return;
    const chapter=segments.find(s=>from<s.end)||segments.at(-1);
    const seconds=chapter.video?.duration||8;
    motion={from,to,index,elapsed:0,wait:0,duration:index===stops.length-1?1500:Math.max(1500,Math.min(4600,seconds*550))};
    config.track.dataset.motion='playing';schedule();
  }
  function step(direction){
    if(motion){
      if(Math.sign(motion.to-motion.from)===direction)return;
      motion=null;
    }
    const index=direction>0?stops.findIndex(p=>p>current+.025):stops.findLastIndex(p=>p<current-.025);
    if(index>=0)animateTo(index);
  }
  function accepts(direction){return !reduced&&!destroyed&&document.body.style.overflow!=='hidden'&&!document.querySelector('dialog[open]')&&scrollY>=0&&scrollY<=total*viewport+2&&(motion||(direction>0?current<total-.01:current>.01))}
  function wheel(e){
    if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||e.target.closest('input,textarea,select,dialog'))return;
    const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?viewport:1),dir=Math.sign(delta);if(!dir||!accepts(dir))return;
    e.preventDefault();const now=performance.now(),quiet=now-lastWheel>260;lastWheel=now;
    if(motion){if(Math.sign(motion.to-motion.from)!==dir&&Math.abs(delta)>18)step(dir);return}
    if(now-settledAt<350||!quiet&&wheelSum===0)return;
    if(quiet||Math.sign(wheelSum)!==dir)wheelSum=0;wheelSum+=delta;
    if(Math.abs(wheelSum)>=28){wheelSum=0;step(dir)}
  }
  function keyboard(e){
    if(e.defaultPrevented||e.altKey||e.metaKey||e.ctrlKey||e.target.closest('button,a,input,textarea,select,dialog'))return;
    const dir=['ArrowDown','PageDown',' '].includes(e.key)?(e.shiftKey?-1:1):['ArrowUp','PageUp'].includes(e.key)?-1:0;
    if(dir&&accepts(dir)){e.preventDefault();if(!e.repeat)step(dir)}
    if(e.key==='Escape'&&motion){const to=motion.to;motion=null;target=current=to;config.track.dataset.motion='idle';window.scrollTo({top:to*viewport,behavior:'instant'});schedule()}
  }

  const boundaries=[segments[0],segments[segments.length-1]];
  // Both HD boundary images must be decoded before normal entry.
  function preloadState(){if(!destroyed)config.onPreload?.({done:boundaries.filter(s=>s.posterSettled).length+(reduced?0:Number(segments[0].painted||segments[0].failed)),total:reduced?2:3,failed:segments[0].failed||boundaries.some(s=>s.posterFailed)})}
  function pump(){
    if(destroyed||reduced||downloading)return;
    const first=segments[0];
    if(!first.painted&&!first.failed){if(!first.loading&&!first.ready)load(first);return}
    // One transfer at a time; a visitor who skips ahead gets that film next.
    const index=Math.max(0,segments.findIndex(s=>target<s.end));
    const order=[...segments.slice(index),...segments.slice(0,index)];
    const next=order.find(s=>!s.loading&&!s.ready&&!s.failed);
    if(next)load(next);
  }
  boundaries.forEach(s=>{
    s.image.decode().then(()=>{if(!destroyed)s.layer.classList.add('poster-ready')}).catch(()=>{s.posterFailed=true}).finally(()=>{if(!destroyed){s.posterSettled=true;preloadState();schedule()}});
  });

  function layout(){ viewport=innerHeight;width=innerWidth;config.track.style.height=`${(total+1)*viewport}px`;read(); }
  function emitStatus(value){if(lastStatus!==value){lastStatus=value;config.onStatus?.(value)}}
  async function load(s){
    if(reduced||s.loading||s.ready||s.failed||destroyed)return;
    s.loading=true;downloading=true;
    try{
      const res=await fetch(s.clip,{signal:abort.signal});if(!res.ok)throw Error('Video unavailable');
      const blob=await res.blob();if(destroyed)return;
      const v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';v.setAttribute('aria-hidden','true');
      s.url=URL.createObjectURL(blob);v.src=s.url;s.video=v;
      v.addEventListener('loadedmetadata',()=>{s.ready=true;s.loading=false;schedule()},{signal:abort.signal});
      v.addEventListener('loadeddata',()=>{s.painted=true;s.layer.classList.add('has-video');preloadState();pump();schedule()},{signal:abort.signal});
      v.addEventListener('seeked',()=>{s.painted=true;s.layer.classList.add('has-video');schedule()},{signal:abort.signal});
      v.addEventListener('error',()=>{s.failed=true;s.loading=false;preloadState();pump();schedule()},{signal:abort.signal});
      s.layer.append(v);v.load();
    }catch(e){if(!destroyed){s.loading=false;s.failed=true;preloadState();schedule()}}finally{downloading=false;pump()}
  }
  function schedule(){if(!raf&&!destroyed&&!document.hidden)raf=requestAnimationFrame(tick)}
  function read(){
    if(motion){if(Math.abs(scrollY-current*viewport)<3)return;motion=null;config.track.dataset.motion='idle'}
    target=clamp(scrollY/viewport,0,total);schedule();
    clearTimeout(snapTimer);
    if(!reduced&&target>0&&target<offset&&performance.now()>suppressSnapUntil&&document.body.style.overflow!=='hidden')snapTimer=setTimeout(()=>{
      if(motion||destroyed)return;
      const nearest=stops.reduce((best,p,i)=>Math.abs(p-target)<Math.abs(stops[best]-target)?i:best,0);
      if(Math.abs(stops[nearest]-target)>.025)animateTo(nearest);
    },240);
  }
  function tick(time){
    raf=0;if(destroyed)return;
    const dt=Math.min(time-(prevTime||time),50);prevTime=time;
    if(motion){
      const m=motion,seg=segments.find(s=>current<s.end)||segments.at(-1);
      if(!seg.painted&&!seg.failed&&m.wait<4000){m.wait+=dt;pump()}else m.elapsed+=dt;
      const p=clamp(m.elapsed/m.duration);
      // Gentle acceleration/deceleration, long nearly linear middle for the film.
      const eased=p<.12?p*p/.2112:p>.88?1-(1-p)*(1-p)/.2112:(p-.06)/.88;
      current=target=m.from+(m.to-m.from)*clamp(eased);
      window.scrollTo({top:current*viewport,behavior:'instant'});
      if(p>=1){current=target=m.to;motion=null;settledAt=time;config.track.dataset.motion='idle';config.track.dataset.stop=String(m.index)}
    }
    if(playing){target=Math.min(total,target+dt/1000*(total/43));window.scrollTo({top:target*viewport,behavior:'instant'});if(target>=total)stop()}
    current=motion?current:reduced?target:current+(target-current)*(1-Math.exp(-dt/75));
    if(Math.abs(current-target)<.0004)current=target;
    let ci=segments.findIndex(s=>current<s.end);if(ci<0)ci=segments.length-1;
    const s=segments[ci];const local=clamp((current-s.start)/(s.end-s.start));
    const next=segments[ci+1];const cross=next?smooth((current-(s.end-.045))/.045):0;
    segments.forEach((seg,i)=>{

      let op=i===ci?1:(i===ci+1?cross:0);
      seg.layer.classList.toggle('opening-hold',i===0&&current<=intro);seg.layer.classList.toggle('ending-hold',i===segments.length-1&&current>=offset);seg.layer.style.opacity=String(op);seg.layer.style.zIndex=String(i);
      if(!seg.ready||!seg.video||seg.video.seeking)return;
      let p=i<ci?1:i>ci?0:local;
      if(seg.timeMap){const b=seg.timeMap.findIndex(pt=>pt[0]>=p);if(b>0){const a=seg.timeMap[b-1],z=seg.timeMap[b];p=a[1]+(z[1]-a[1])*(p-a[0])/(z[0]-a[0])}}
      const t=p*Math.max(0,seg.video.duration-1/24);
      if(Math.abs(seg.video.currentTime-t)>(mobile()?.035:.014)){
        try{seg.video.currentTime=t}catch{}
      }
    });
    pump();
    if(active!==ci){active=ci;config.onChapter?.(ci)}
    emitStatus(reduced?'静态浏览':s.failed?'视频暂不可用 · 静态画面':s.painted?'':'影像准备中 · 可继续浏览');
    config.onFrame?.({index:ci,local,progress:current/total,intro:1-smooth((current-intro)/.45),final:smooth((current-(offset-.35))/.4),handoff:reduced?0:smooth((current-(offset+.3))/1.65),reduced});
    if(motion||playing||current!==target)schedule();
  }
  function stop(){suppressSnapUntil=performance.now()+1800;motion=null;clearTimeout(snapTimer);config.track.dataset.motion='idle';playing=false;config.onPlaying?.(false)}
  function toggle(){if(reduced)return;if(playing)stop();else{if(target>=total-.02){target=0;current=0;window.scrollTo({top:0,behavior:'instant'})}playing=true;config.onPlaying?.(true);schedule()}}
  function go(i){stop();if(reduced){window.scrollTo({top:stops[i]*viewport,behavior:'instant'})}else animateTo(i)}
  function toEnd(){stop();window.scrollTo({top:total*viewport,behavior:reduced?'instant':'smooth'})}
  function onResize(){if(mobile()&&width===innerWidth)return;layout()}
  function prime(){segments.forEach(s=>{if(s.video&&mobile()){const v=s.video;v.play().then(()=>v.pause()).catch(()=>{})}})}
  window.addEventListener('scroll',read,{passive:true,signal:abort.signal});
  window.addEventListener('resize',onResize,{signal:abort.signal});
  window.addEventListener('orientationchange',layout,{signal:abort.signal});
  window.addEventListener('pointerdown',prime,{once:true,passive:true,signal:abort.signal});
  window.addEventListener('wheel',wheel,{passive:false,signal:abort.signal});
  window.addEventListener('keydown',keyboard,{signal:abort.signal});
  window.addEventListener('touchstart',e=>{touchY=e.touches.length===1?e.touches[0].clientY:null;touchUsed=false},{passive:true,signal:abort.signal});
  window.addEventListener('touchmove',e=>{
    if(touchY===null||e.touches.length!==1||e.target.closest('input,textarea,select,dialog'))return;
    const delta=touchY-e.touches[0].clientY,dir=Math.sign(delta);
    if(!accepts(dir))return;
    e.preventDefault();if(Math.abs(delta)>35&&!touchUsed){touchUsed=true;step(dir)}
  },{passive:false,signal:abort.signal});
  window.addEventListener('touchend',()=>{touchY=null},{passive:true,signal:abort.signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else{prevTime=0;schedule()}},{signal:abort.signal});
  layout();pump();preloadState();
  return {go,toEnd,toggle,stop,reduced,destroy(){destroyed=true;clearTimeout(snapTimer);abort.abort();cancelAnimationFrame(raf);segments.forEach(s=>{if(s.video){s.video.pause();s.video.removeAttribute('src');s.video.load()}if(s.url)URL.revokeObjectURL(s.url);s.layer.remove()})}};
}
