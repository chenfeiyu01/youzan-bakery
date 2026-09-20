import {DrawnLine} from './DrawnLine';
import videoAssets from './video-assets.json';
import {Arrival} from './Arrival';
import {moveProduct} from './product-transition';
import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowDown,ArrowUpRight,ArrowUp,Plus,X} from '@phosphor-icons/react';
import {mountScrollWorld,clamp} from './scroll-world';
const makeChapters=media=>[1.65,1,1.5,1.45,1.5].map((scroll,i)=>({scroll,clip:media.clips[i],poster:i===0?media.opening:i===4?media.ending:`/assets/detail-${i+1}.webp`,...(i===4?{timeMap:[[0,0],[.12,.17],[.26,.43],[1,1]]}:{})}));
const statements=[{en:'A STUDY IN LIGHTNESS',lines:['轻盈，','有其分量。'],note:'细微之处，决定一口的全部。'},{en:'PRECISION BECOMES PLEASURE',lines:['对细节的执着，','最终成为直觉。'],note:'入口的那一刻，你会明白。'},{en:'TIME. HEAT. TRANSFORMATION.',lines:['把时间，','交给风味。'],note:'直到香气、色泽与口感，在同一刻抵达。'}];
function Lines({lines}){return lines.map((s,i)=><span className="line-mask" key={s}><span style={{'--line':i}}>{s}</span></span>)}
function FilmWords({lines}){return lines.map((line,row)=><span className="film-line" key={line} style={{'--row':row}}>{[...line].map((char,i)=><span className="film-glyph" key={i} style={{'--glyph':i+row*2}}>{char}</span>)}</span>)}
function Ribbon({className,count=22}){return <svg className={className} viewBox="0 0 440 440" fill="none" aria-hidden="true">{Array.from({length:count},(_,i)=>{const t=i/(count-1);return <path key={i} d={`M ${65+35*t} ${105+235*t} C ${285-100*t} ${-10+120*t}, ${140+110*t} ${420-100*t}, ${365-20*t} ${100+235*t}`} opacity={.35+.65*Math.sin(Math.PI*(.12+t*.76))}/>})}</svg>}
export function App(){
 const [media]=useState(()=>videoAssets[matchMedia('(max-width: 760px)').matches||navigator.connection?.saveData?'mobile':'desktop']);
 const [chapters]=useState(()=>makeChapters(media));
 const root=useRef(),stage=useRef(),track=useRef(),engine=useRef(),dialog=useRef(),lastFocus=useRef(),closing=useRef(false);
 const [panel,setPanel]=useState(null),[status,setStatus]=useState('');
 const [arriving,setArriving]=useState(true),[resources,setResources]=useState({done:0,total:3,failed:false});
 const enter=useCallback(()=>setArriving(false),[]);
 useEffect(()=>{document.body.style.overflow=arriving||panel?'hidden':'';return()=>{document.body.style.overflow=''}},[arriving,panel]);
 const jump=id=>{engine.current.stop();document.getElementById(id)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})};
 useEffect(()=>{
  const r=root.current,copies=[...r.querySelectorAll('[data-film-copy]')];
  engine.current=mountScrollWorld(stage.current,{sections:chapters,track:track.current,onStatus:setStatus,onPreload:setResources,onFrame:({index,local,intro,final,progress,reduced,handoff})=>{
   r.style.setProperty('--handoff',handoff);const debut=r.querySelector('.product-debut');debut.inert=handoff<.75;r.style.setProperty('--intro',intro);r.style.setProperty('--final',final);r.style.setProperty('--travel',progress);
   copies.forEach(el=>{const n=Number(el.dataset.filmCopy);let a=n===0?intro:n===4?final*(1-handoff):n===5?(index===0?clamp((local-.72)/.22):0):n===index?clamp((local-.18)/.18):0;
    el.style.opacity=a;el.style.visibility=a>.005?'visible':'hidden';el.inert=a<.4;
    el.style.setProperty('--phase',reduced?.5:Math.min(local,.65));el.style.setProperty('--reveal',a);el.style.setProperty('--drift',reduced?'0':String(n===0?(1-intro)*-90:n===4?(1-final)*60:(Math.min(local,.65)-.5)*-130));
   });
  }});
  const strokes=[...r.querySelectorAll('[data-drawn-line]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animated=[...r.querySelectorAll('[data-reveal]')];
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('in-view',e.isIntersecting)),{threshold:.12});animated.forEach(el=>observer.observe(el));
  const about=r.querySelector('.manifesto'),gallery=r.querySelector('.gallery-track'),rail=r.querySelector('.gallery-rail'),atelier=r.querySelector('.atelier'),ingredient=r.querySelector('.ingredient'),footer=r.querySelector('.brand-footer'),headline=r.querySelector('.manifesto-grid h2'),craft=r.querySelector('.editorial-images');let raf=0;
  const draw=()=>{raf=0;strokes.forEach(el=>{const rect=el.getBoundingClientRect();el.style.setProperty('--draw',reduced?1:clamp((innerHeight*.8-rect.top)/Math.max(1,rect.height)))});const rect=about.getBoundingClientRect(),g=gallery.getBoundingClientRect();r.style.setProperty('--editorial',reduced?0:clamp((innerHeight-rect.top)/(rect.height+innerHeight)));
   const p=clamp(-g.top/Math.max(1,g.height-innerHeight));gallery.style.setProperty('--slide',reduced?0:p);gallery.style.setProperty('--rail-distance',`${Math.max(0,rail.scrollWidth-innerWidth*.9)}px`);
   const craftRect=craft.getBoundingClientRect();craft.style.setProperty('--unfold',reduced?1:clamp(-craftRect.top/Math.max(1,craftRect.height-innerHeight)));const h=headline.getBoundingClientRect();headline.style.setProperty('--ink',reduced?1:clamp((innerHeight*.85-h.top)/(h.height+innerHeight*.65)));const f=footer.getBoundingClientRect();footer.style.setProperty('--end',reduced?1:clamp((innerHeight-f.top)/(Math.min(f.height,innerHeight)*.85)));const a=atelier.getBoundingClientRect(),b=ingredient.getBoundingClientRect();atelier.style.setProperty('--aperture',reduced?1:clamp((innerHeight-a.top)/(innerHeight*.85)));atelier.style.setProperty('--space',reduced?0:clamp((innerHeight-a.top)/(a.height+innerHeight)));ingredient.style.setProperty('--ingredient',reduced?0:clamp((innerHeight-b.top)/(b.height+innerHeight)));r.style.setProperty('--rotation',reduced?'0deg':`${scrollY*.035}deg`);
  };
  const scroll=()=>{if(!raf)raf=requestAnimationFrame(draw)};window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll);draw();
  return()=>{engine.current.destroy();observer.disconnect();cancelAnimationFrame(raf);window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll)};
 },[]);
 useEffect(()=>{if(panel){dialog.current.showModal();requestAnimationFrame(()=>moveProduct(lastFocus.current?.querySelector('img'),dialog.current.querySelector('.product-photo img')))}else{dialog.current.close();lastFocus.current?.focus({preventScroll:true})}},[panel]);
 const close=async()=>{if(closing.current)return;closing.current=true;await moveProduct(dialog.current.querySelector('.product-photo img'),lastFocus.current?.querySelector('img'));setPanel(null);closing.current=false};
 const open=(e,name='classic')=>{lastFocus.current=e.currentTarget;engine.current.stop();setPanel(name)};
 const followPointer=e=>{if(!matchMedia('(hover:hover)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--pointer-x',`${((e.clientX-r.left)/r.width-.5)*12}px`);e.currentTarget.style.setProperty('--pointer-y',`${((e.clientY-r.top)/r.height-.5)*8}px`)};
 const resetPointer=e=>{e.currentTarget.style.setProperty('--pointer-x','0px');e.currentTarget.style.setProperty('--pointer-y','0px')};
 const product=panel==='chocolate'?{name:'巧克力酥',en:'PAIN AU CHOCOLAT',image:'/assets/chocolate.webp',copy:'深烘的可可，轻盈的酥层。香气在一口之间，慢慢展开。'}:{name:'原味可颂',en:'CLASSIC BUTTER CROISSANT',image:media.ending,copy:'酥皮先于香气抵达。随后，是黄油、空气，与恰好的烘烤。'};
 return <>{arriving&&<Arrival resources={resources} onEnter={enter}/>}<main ref={root} className="experience" inert={arriving}>
  <a className="skip-link" href="#approach">跳过影像，阅读品牌理念</a>
  <header className="site-header"><button className="wordmark" onClick={()=>engine.current.go(0)} aria-label="有赞烘焙，回到开场">有赞烘焙<span>YOUZAN BAKERY</span></button><nav aria-label="主导航"><button onClick={()=>jump('approach')}>关于有赞</button><a href="/collection">烘焙作品 <ArrowUpRight size={14}/></a></nav></header>
  <div className="cinema" ref={track}><div className="film-pin">
   <button className="film-skip" onClick={()=>jump('approach')}>跳过影像 <ArrowDown size={13}/></button><div className="film-stage" ref={stage} aria-hidden="true"/>
   <div className="hero-type" data-film-copy="0" aria-hidden="true"><span>YOU</span><span>ZAN</span></div>
   <section className="hero-copy film-copy" data-film-copy="0" aria-label="开场"><p className="micro">AN OBSESSION WITH THE EVERYDAY.</p><h1><Lines lines={['把一只可颂，','做到极致。']}/></h1><button className="text-link" onClick={()=>engine.current.go(1)}>进入这一层世界 <ArrowDown size={18}/></button></section>
   <div className="hero-bottom" data-film-copy="0"><span>BAKED WITH INTENT.</span><span>下滑，继续下一幕 <ArrowDown size={13}/></span><span>有赞 · 烘焙的另一面</span></div>
   <section className="film-copy statement statement-0" data-film-copy="5"><p className="micro">LAYER BY LAYER.</p><h2><FilmWords lines={['层层之间，','风味初现。']}/></h2><p className="statement-note">从第一层酥香，开始。</p></section>
   {statements.map((s,i)=><section key={s.en} data-film-copy={i+1} className={`film-copy statement statement-${i}`} aria-label={s.en}><p className="micro">{s.en}</p><h2 aria-label={s.lines.join('')}><span aria-hidden="true"><FilmWords lines={s.lines}/></span></h2><p className="statement-note">{s.note}</p></section>)}
   <section className="film-copy finale" data-film-copy="4"><p className="micro">THE EXTRAORDINARY, EVERY DAY.</p><h2><Lines lines={['平凡的一口。','不平凡的全部。']}/></h2><button className="text-link" onClick={()=>jump('approach')}>认识有赞烘焙 <ArrowDown size={18}/></button></section>
   <section className="product-debut" aria-label="从影像到作品"><div><p className="micro">FROM A MOMENT TO AN EVERYDAY RITUAL.</p><h2>所有认真，<br/>凝于这一口。</h2><p>原味可颂 / CLASSIC CROISSANT</p><button className="text-link" onClick={()=>jump('collection')}>探索烘焙作品 <ArrowUpRight size={20}/></button></div></section>
   {status&&status!=='静态浏览'&&<span className="load-status" role="status">{status}</span>}
  </div></div>
  <section id="approach" className="manifesto"><DrawnLine className="manifesto-stroke"/>
   <div className="section-label"><span>有赞烘焙 / OUR PHILOSOPHY</span><Plus size={20}/></div>
   <div className="manifesto-grid"><h2 data-reveal><Lines lines={['我们相信，','日常之物，','值得极致以待。']}/></h2><div className="manifesto-detail" data-reveal><p>一只可颂，值得多少认真？</p><p>从黄油与面皮的比例，到折叠的厚薄，再到出炉的瞬间。我们关心每一个细节，也关心它们如何一起，成为你记住的那一口。</p><p>有赞烘焙。让精确的工艺，成为感官的享受。</p><button className="text-link" onClick={()=>jump('collection')}>从一只原味可颂开始 <ArrowUpRight size={20}/></button></div></div>
   <div className="moving-type" aria-hidden="true"><span>OBSESSION IN EVERY LAYER.</span></div>
   <div className="editorial-images"><div className="craft-pin"><div className="craft-caption"><Ribbon className="craft-ribbon" count={6}/><span className="micro">FROM HAND TO HEART.</span><p>手中的分寸。<br/>入口的轻盈。</p></div><figure className="texture-image" data-reveal><img src="/assets/craft.webp" width="1122" height="1402" alt="双手用木质擀面杖擀压面团" loading="lazy"/><figcaption>MADE BY HAND. FELT IN EVERY BITE.</figcaption></figure><figure className="crumb-image" data-reveal><img src="/assets/crumb.webp" width="1122" height="1402" alt="可颂酥皮与轻盈的内部结构" loading="lazy"/><figcaption>每一道工序，都有回响。</figcaption></figure></div></div>
  </section>
  <section className="ingredient" id="ingredients"><DrawnLine variant="loop" className="ingredient-stroke"/><div className="ingredient-orbit" aria-hidden="true"><span>PURE.</span><span>SIMPLE.</span></div><div className="ingredient-photo"><img src="/assets/butter.webp" width="1254" height="1254" alt="烘焙纸上的黄油，带有自然刮痕" loading="lazy"/></div><div className="ingredient-copy" data-reveal><p className="micro">NOTHING TO HIDE.</p><h2><Lines lines={['越是简单，','越见本味。']}/></h2><p>面粉、黄油、水。<br/>熟悉的原料，值得被认真对待。<br/>让每一种风味，都清楚地留下来。</p><span className="ingredient-sign">BUTTER / THE BEGINNING OF FLAVOUR</span></div></section>
  <section className="gallery-track" id="collection"><div className="gallery-pin"><div className="section-label"><span>烘焙作品 / THE COLLECTION</span><button className="studio-link" onClick={()=>jump('atelier')}>走进工作室 <ArrowUpRight size={16}/></button></div><div className="gallery-rail">
   <div className="gallery-intro"><Ribbon className="collection-ribbon" count={12}/><span className="micro">OUR SIGNATURE</span><h2>从经典，<br/>重新认识<br/><em>可颂。</em></h2><p>只有简单的原料。<br/>以及，毫不简单的用心。</p><ArrowUpRight className="gallery-arrow" size={74} weight="thin"/></div>
   <button onPointerMove={followPointer} onPointerLeave={resetPointer} className="work-card" onClick={e=>open(e)} aria-label="查看原味可颂"><div className="work-image"><img src={media.ending} width="1672" height="941" alt="原味可颂"/><span className="work-explore">探索作品</span><span className="round-link"><ArrowUpRight size={30}/></span></div><div className="work-meta"><h3>原味可颂</h3><span>CLASSIC CROISSANT</span></div></button>
   <button onPointerMove={followPointer} onPointerLeave={resetPointer} className="work-card chocolate-card" onClick={e=>open(e,'chocolate')} aria-label="查看巧克力酥"><div className="work-image"><img src="/assets/chocolate.webp" width="1536" height="1024" alt="金黄巧克力酥与两个巧克力芯" loading="lazy"/><span className="work-explore">探索作品</span><span className="round-link"><ArrowUpRight size={30}/></span></div><div className="work-meta"><h3>巧克力酥</h3><span>PAIN AU CHOCOLAT</span></div></button>
  </div></div></section>
  <section className="atelier" id="atelier"><div className="atelier-photo"><img src="/assets/atelier.webp" width="1672" height="941" alt="自然光下的开放式烘焙工作室" loading="lazy"/></div><div className="atelier-copy" data-reveal><p className="micro">A SPACE FOR THE EXTRAORDINARY.</p><h2><Lines lines={['让认真，','成为日常。']}/></h2><p>在光线与面粉之间，<br/>为下一次出炉，留足时间。</p></div><span className="atelier-caption">有赞烘焙 / 概念工作室</span></section>
  <footer className="brand-footer"><Ribbon className="layer-sculpture ribbon-sculpture"/><div className="footer-invitation" data-reveal><p className="micro">WELCOME TO YOUZAN.</p><h2><Lines lines={['下一次心动，','从这一口开始。']}/></h2><button className="text-link" onClick={()=>engine.current.go(0)}>再看一遍 <ArrowUp size={20}/></button></div><div className="footer-brand" aria-hidden="true"><span className="footer-letters">{[..."YOUZAN"].map((letter,i)=><span key={i} style={{"--char":i}}>{letter}</span>)}</span><span className="rotating-star"><Plus size={130} weight="thin"/></span></div><div className="footer-small"><span>有赞烘焙</span><span>THE ART OF EVERYDAY BAKING.</span><span>品牌概念体验</span></div></footer>
  <dialog ref={dialog} className="brand-dialog" onCancel={e=>{e.preventDefault();close()}} onClick={e=>{if(e.target===dialog.current)close()}} aria-labelledby="dialog-title"><button className="close-dialog" aria-label="关闭" onClick={close}><X size={24}/></button><div className="product-photo"><img src={product.image} alt={product.name}/></div><div className="panel-copy"><p className="micro">THE ORIGINAL.</p><h2 id="dialog-title">{product.name}</h2><p>{product.copy}</p><p className="product-caption">{product.en}</p><button className="text-link" onClick={()=>{setPanel(null);engine.current.go(1)}}>探索酥层的奥秘 <ArrowUpRight size={20}/></button></div></dialog>
 </main></>
}
