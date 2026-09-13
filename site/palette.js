'use strict';
// Work on a small thumbnail; transparent pixels do not influence the palette.
function wallpaperPalette(pixels) {
  const bins=new Map(), average=[0,0,0];
  let total=0;
  for(let i=0;i<pixels.length;i+=4){
    const weight=pixels[i+3]/255;
    if(!weight)continue;
    const rgb=[pixels[i],pixels[i+1],pixels[i+2]];
    const key=rgb.map(v=>v>>5).join(',');
    const bin=bins.get(key)||{weight:0,sum:[0,0,0]};
    bin.weight+=weight;total+=weight;
    rgb.forEach((v,j)=>{bin.sum[j]+=v*weight;average[j]+=v*weight;});
    bins.set(key,bin);
  }
  if(!total)return {color:'#f1f2df',borderColor:'#ffffff',textColor:'#354636'};
  const dominant=[...bins.values()].reduce((a,b)=>a.weight>=b.weight?a:b);
  const rgb=dominant.sum.map(v=>v/dominant.weight), bg=average.map(v=>v/total);
  const luminance=values=>values.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  const light=luminance(bg)>.35;
  const mix=(target,amount)=>rgb.map(v=>Math.round(v*(1-amount)+target*amount));
  const fill=mix(light?0:255,light?.22:.72);
  const border=mix(light?0:255,light?.48:.9);
  const composite=fill.map((v,i)=>v*.42+bg[i]*.58);
  const l=luminance(composite), hex=values=>'#'+values.map(v=>v.toString(16).padStart(2,'0')).join('');
  return {color:hex(fill),borderColor:hex(border),textColor:(l+.05)/.05>=1.05/(l+.05)?'#111111':'#ffffff'};
}
