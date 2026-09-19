// Animate the actual image content rectangle, including object-fit: contain letterboxing.
function contentRect(image) {
  const r = image.getBoundingClientRect();
  const ratio = image.naturalWidth / image.naturalHeight;
  if (!ratio || !r.width || !r.height) return null;
  let width = r.width, height = r.height;
  if (getComputedStyle(image).objectFit === 'contain') {
    width = Math.min(r.width, r.height * ratio);
    height = width / ratio;
  }
  return {left:r.left+(r.width-width)/2, top:r.top+(r.height-height)/2, width, height};
}
export function moveProduct(from, to) {
  if (!from || !to || matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve();
  const a=contentRect(from), b=contentRect(to);
  if (!a || !b) return Promise.resolve();
  const image=from.cloneNode();
  image.alt=''; image.setAttribute('aria-hidden','true');
  Object.assign(image.style,{position:'fixed',left:`${a.left}px`,top:`${a.top}px`,width:`${a.width}px`,height:`${a.height}px`,maxWidth:'none',objectFit:'fill',margin:'0',pointerEvents:'none',transformOrigin:'0 0'});
  // A manual popover places the moving image above the native dialog's top layer.
  const host=document.createElement('div');host.setAttribute('popover','manual');
  Object.assign(host.style,{border:'0',padding:'0',margin:'0',background:'transparent',overflow:'visible',pointerEvents:'none'});
  host.append(image);document.body.append(host);
  if (!host.showPopover) {host.remove();return Promise.resolve();}
  host.showPopover();
  const previous=to.style.opacity;to.style.opacity='0';from.style.opacity='0';
  const animation=image.animate([{transform:'none'},{transform:`translate(${b.left-a.left}px,${b.top-a.top}px) scale(${b.width/a.width},${b.height/a.height})`}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
  return animation.finished.catch(()=>{}).finally(()=>{from.style.opacity='';to.style.opacity=previous;host.remove()});
}
