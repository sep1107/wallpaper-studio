const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const context=vm.createContext({});
vm.runInContext(readFileSync(require('node:path').join(__dirname,'../site/palette.js'),'utf8'),context);
const palette=pixels=>context.wallpaperPalette(pixels);
const solid=(r,g,b,a=255)=>Array.from({length:100},()=>[r,g,b,a]).flat();
const rgb=hex=>hex.slice(1).match(/../g).map(v=>parseInt(v,16));
test('light wallpapers get darker panels and dark text',()=>{
  const result=palette(solid(245,240,225));
  assert.ok(rgb(result.color).every((v,i)=>v<[245,240,225][i]));
  assert.equal(result.textColor,'#111111');
});
test('dark wallpapers get lighter panels',()=>{
  const result=palette(solid(10,20,40));
  assert.ok(rgb(result.color).every((v,i)=>v>[10,20,40][i]));
  assert.notEqual(result.borderColor,result.color);
});
test('dominant warm and cool hues remain distinct',()=>{
  const warm=rgb(palette(solid(180,70,40)).color),cool=rgb(palette(solid(40,70,180)).color);
  assert.ok(warm[0]>warm[2]);assert.ok(cool[2]>cool[0]);
  const majority=palette([...solid(180,70,40),0,0,255,255]);
  assert.equal(majority.color,palette(solid(180,70,40)).color);
});
test('transparent pixels do not distort colors, fully transparent images have a fallback',()=>{
  assert.equal(palette([...solid(180,70,40),...solid(0,0,255,0)]).color,palette(solid(180,70,40)).color);
  assert.equal(palette(solid(0,0,0,0)).color,'#f1f2df');
});
