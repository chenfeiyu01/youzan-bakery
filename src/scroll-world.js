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
  let viewport=innerHeight, width=innerWidth, active=-1, lastStatus='';
  const intro=.28, ending=.6;
  let offset=intro;
  const segments=config.sections.map((section,i)=>{
    const s={...section, start:offset, end:offset+section.scroll, loading:false, ready:false, painted:false, url:null, failed:false};offset=s.end;
    const layer=document.createElement('div');layer.className='film-layer';layer.style.opacity=i===0?'1':'0';
    const image=document.createElement('img');image.src=section.poster;image.alt='';image.decoding='async';
    if(i)image.loading='lazy';else image.fetchPriority='high';
    layer.append(image);container.append(layer);s.layer=layer;s.image=image;
    return s;
  });
  const total=offset+ending;
  function layout(){ viewport=innerHeight;width=innerWidth;config.track.style.height=`${(total+1)*viewport}px`;read(); }
  function emitStatus(value){if(lastStatus!==value){lastStatus=value;config.onStatus?.(value)}}
  async function load(s){
    if(reduced||s.loading||s.ready||s.failed||destroyed)return;
    s.loading=true;
    try{
      const res=await fetch(s.clip,{signal:abort.signal});if(!res.ok)throw Error('Video unavailable');
      const blob=await res.blob();if(destroyed)return;
      const v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';v.setAttribute('aria-hidden','true');
      s.url=URL.createObjectURL(blob);v.src=s.url;s.video=v;
      v.addEventListener('loadedmetadata',()=>{s.ready=true;s.loading=false;schedule()},{signal:abort.signal});
      v.addEventListener('loadeddata',()=>{s.painted=true;s.layer.classList.add('has-video');schedule()},{signal:abort.signal});
      v.addEventListener('seeked',()=>{s.painted=true;s.layer.classList.add('has-video');schedule()},{signal:abort.signal});
      v.addEventListener('error',()=>{s.failed=true;s.loading=false;schedule()},{signal:abort.signal});
      s.layer.append(v);v.load();
    }catch(e){if(!destroyed){s.loading=false;s.failed=true;schedule()}}
  }
  function schedule(){if(!raf&&!destroyed&&!document.hidden)raf=requestAnimationFrame(tick)}
  function read(){target=clamp(scrollY/viewport,0,total);schedule()}
  function tick(time){
    raf=0;if(destroyed)return;
    const dt=Math.min(time-(prevTime||time),50);prevTime=time;
    if(playing){target=Math.min(total,target+dt/1000*(total/43));window.scrollTo({top:target*viewport,behavior:'instant'});if(target>=total)stop()}
    current=reduced?target:current+(target-current)*(1-Math.exp(-dt/75));
    if(Math.abs(current-target)<.0004)current=target;
    let ci=segments.findIndex(s=>current<s.end);if(ci<0)ci=segments.length-1;
    const s=segments[ci];const local=clamp((current-s.start)/(s.end-s.start));
    const next=segments[ci+1];const cross=next?smooth((current-(s.end-.045))/.045):0;
    segments.forEach((seg,i)=>{
      if(Math.abs(i-ci)<=1)load(seg);
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
    if(active!==ci){active=ci;config.onChapter?.(ci)}
    emitStatus(reduced?'静态浏览':s.failed?'视频暂不可用 · 静态画面':s.ready?'':'正在载入影像');
    config.onFrame?.({index:ci,local,progress:current/total,intro:1-smooth((current-intro)/.45),final:smooth((current-(offset-.35))/.4),reduced});
    if(playing||current!==target)schedule();
  }
  function stop(){playing=false;config.onPlaying?.(false)}
  function toggle(){if(reduced)return;if(playing)stop();else{if(target>=total-.02){target=0;current=0;window.scrollTo({top:0,behavior:'instant'})}playing=true;config.onPlaying?.(true);schedule()}}
  function go(i){stop();window.scrollTo({top:i===0?0:(segments[i].start+.65*(segments[i].end-segments[i].start))*viewport,behavior:reduced?'instant':'smooth'})}
  function toEnd(){stop();window.scrollTo({top:total*viewport,behavior:reduced?'instant':'smooth'})}
  function onResize(){if(mobile()&&width===innerWidth)return;layout()}
  function prime(){segments.forEach(s=>{if(s.video&&mobile()){const v=s.video;v.play().then(()=>v.pause()).catch(()=>{})}})}
  window.addEventListener('scroll',read,{passive:true,signal:abort.signal});
  window.addEventListener('resize',onResize,{signal:abort.signal});
  window.addEventListener('orientationchange',layout,{signal:abort.signal});
  window.addEventListener('pointerdown',prime,{once:true,passive:true,signal:abort.signal});
  ['wheel','touchstart','keydown'].forEach(e=>window.addEventListener(e,stop,{passive:true,signal:abort.signal}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();cancelAnimationFrame(raf);raf=0}else{prevTime=0;schedule()}},{signal:abort.signal});
  layout();load(segments[0]);
  return {go,toEnd,toggle,stop,reduced,destroy(){destroyed=true;abort.abort();cancelAnimationFrame(raf);segments.forEach(s=>{if(s.video){s.video.pause();s.video.removeAttribute('src');s.video.load()}if(s.url)URL.revokeObjectURL(s.url);s.layer.remove()})}};
}
