// Independent expected-value implementation. Never imports application modules.
const fs=require('node:fs');
function csv(text, delimiter=',') {
  const table=[]; let row=[], field='', quoted=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++) {
    const ch=text[i];
    if(ch==='"') { if(quoted && text[i+1]==='"') {field+='"';i++;} else quoted=!quoted; }
    else if(!quoted && ch===delimiter) {row.push(field);field='';}
    else if(!quoted && (ch==='\n'||ch==='\r')) {if(ch==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(x=>x!==''))table.push(row);row=[];field='';}
    else field+=ch;
  }
  if(row.length||field) {row.push(field);table.push(row);}
  const headers=table.shift()||[];
  return table.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,cells[i]??''])));
}
function number(v) {
  if(typeof v==='number') return Number.isFinite(v)?v:NaN;
  let s=String(v??'').trim().replace(/(?:VND|vnd|đ|₫|\$|\s)/g,''); let scale=1;
  if(/(?:k|tr|m)$/i.test(s)) {scale=/k$/i.test(s)?1000:1000000;s=s.replace(/(?:k|tr|m)$/i,'');}
  if(s.includes(',')&&s.includes('.')) {const decimal=s.lastIndexOf(',')>s.lastIndexOf('.')?',':'.';s=s.split(decimal===','?'.':',').join('');s=s.replace(decimal,'.');}
  else if(/^\d{1,3}(?:[.,]\d{3})+$/.test(s)) s=s.replace(/[.,]/g,'');
  else s=s.replace(',','.');
  return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)?Number(s)*scale:NaN;
}
function date(v) {
  if(v instanceof Date) return `${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,'0')}-${String(v.getDate()).padStart(2,'0')}`;
  if(typeof v==='number') return new Date(Math.round((v-25569)*86400000)).toISOString().slice(0,10);
  const s=String(v??'').trim();let y,m,d;let a=s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if(a) [,y,m,d]=a;else {a=s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);if(!a)return null;[,d,m,y]=a;if(+m>12&&+d<=12)[m,d]=[d,m];}
  const dt=new Date(Date.UTC(+y,+m-1,+d));
  return dt.getUTCFullYear()===+y && dt.getUTCMonth()===+m-1 && dt.getUTCDate()===+d?dt.toISOString().slice(0,10):null;
}
const trim=v=>String(v??'').trim();
function calculate(raw,{policy='keep_all',old=false,truth=null}={}) {
  const lines=[], invalid=[], duplicateRows=[], seen=new Set();
  for(let i=0;i<raw.length;i++) {
    const r=raw[i], day=date(r['Ngày bán']), name=trim(r['Tên sản phẩm']), qty=number(r['Số lượng']), rawRevenue=r['Doanh thu'];
    const revenue=rawRevenue!==undefined&&rawRevenue!==''?number(rawRevenue):number(r['Đơn giá'])*qty;
    const unit=r['Đơn giá']!==undefined&&r['Đơn giá']!==''?number(r['Đơn giá']):revenue/qty;
    const reason=!day?'missing_date':!name?'missing_product':!(qty>0)?'invalid_quantity':!(revenue>0&&unit>0)?'invalid_revenue':null;
    if(reason) {invalid.push({row:i+1,reason});continue;}
    const order=trim(r['Mã đơn hàng']), customer=trim(r['Mã khách hàng']);
    // Collision-safe tuple; a missing ID is never a literal user ID.
    const key=JSON.stringify([day,old&&!order?['auto',i]:order||null,name,qty,revenue,customer]);
    if(seen.has(key)) {duplicateRows.push({row:i+1,revenue});if(policy==='drop_exact_duplicates')continue;} else seen.add(key);
    const cost=number(r['Giá vốn']);
    lines.push({index:i+1,date:day,name,qty,revenue,order,customer,cost:cost>0?cost*qty:null,category:trim(r['Danh mục'])||'Chung'});
  }
  const revenue=lines.reduce((s,r)=>s+r.revenue,0), quantity=lines.reduce((s,r)=>s+r.qty,0);
  const costLines=lines.filter(r=>r.cost!==null),covered=costLines.reduce((s,r)=>s+r.revenue,0),profit=costLines.length?costLines.reduce((s,r)=>s+r.revenue-r.cost,0):null;
  const groups=new Map();for(const r of lines) {if(!r.order)continue;const set=groups.get(r.order)||new Set();set.add(JSON.stringify([r.date,r.customer||null]));groups.set(r.order,set);}
  for(const r of lines) r.transaction=truth?.orders?.[r.index-1]??(old?(r.order||JSON.stringify(['auto',r.index])):r.order?JSON.stringify([r.order,r.date,r.customer||null]):JSON.stringify(['auto',r.index]));
  const orderCount=new Set(lines.map(r=>r.transaction)).size, products=new Map(),customers=new Map(),baskets=new Map();
  for(const r of lines) {
    const p=products.get(r.name)||{name:r.name,revenue:0,quantity:0,profit:null,covered:0,orders:new Set(),category:r.category,monthly:{}};
    p.revenue+=r.revenue;p.quantity+=r.qty;p.orders.add(r.transaction);p.monthly[r.date.slice(0,7)]=(p.monthly[r.date.slice(0,7)]||0)+r.revenue;
    if(r.cost!==null){p.profit=(p.profit??0)+r.revenue-r.cost;p.covered+=r.revenue;}products.set(r.name,p);
    const b=baskets.get(r.transaction)||new Set();b.add(r.name);baskets.set(r.transaction,b);
    if(r.customer){const c=customers.get(r.customer)||{id:r.customer,spend:0,orders:new Set(),last:r.date};c.spend+=r.revenue;c.orders.add(r.transaction);if(r.date>c.last)c.last=r.date;customers.set(r.customer,c);}
  }
  const ps=[...products.values()].sort((a,b)=>b.revenue-a.revenue);let cumulative=0;
  for(const p of ps){p.abc=cumulative<revenue*.8?'A':cumulative<revenue*.95?'B':'C';cumulative+=p.revenue;p.orders=p.orders.size;delete p.covered;}
  const cs=[...customers.values()].sort((a,b)=>b.spend-a.spend),last=lines.map(r=>r.date).sort().at(-1),identified=cs.reduce((s,c)=>s+c.spend,0);
  const threshold=cs.length?Math.min(cs[Math.floor(cs.length/5)].spend,identified/cs.length*1.2):0;
  for(const c of cs){c.frequency=c.orders.size;delete c.orders;c.recency=Math.round((Date.parse(last)-Date.parse(c.last))/86400000);c.segment=c.spend>=threshold?(c.recency<=60?'VIP':'Có nguy cơ rời đi'):c.frequency>=4?(c.recency<=60?'Trung thành':'Có nguy cơ rời đi'):c.frequency===1?(c.recency<=45?'Mới':c.recency>120?'Đã ngừng mua':'Bình thường'):(c.recency>90?'Đã ngừng mua':'Bình thường');}
  const vipRevenue=cs.filter(c=>c.segment==='VIP').reduce((s,c)=>s+c.spend,0),repeat=cs.filter(c=>c.frequency>=2).length;
  const multi=[...baskets.values()].filter(b=>b.size>=2),pairs=new Map();
  for(const b of multi) {const ns=[...b].sort();for(let i=0;i<ns.length;i++)for(let j=i+1;j<ns.length;j++){const k=JSON.stringify([ns[i],ns[j]]);pairs.set(k,(pairs.get(k)||0)+1);}}
  const round1=x=>Math.round(x*10)/10;
  return {rawRows:raw.length,validRows:lines.length,dropped:raw.length-lines.length,invalid,duplicateRows,suspectedCount:policy==='keep_all'?duplicateRows.length:0,suspectedRevenue:policy==='keep_all'?duplicateRows.reduce((s,r)=>s+r.revenue,0):0,keptIndices:lines.map(r=>r.index),revenue:Math.round(revenue),quantity,profit:profit===null?null:Math.round(profit),margin:covered?round1(profit/covered*100):null,costCoverage:revenue?Math.round(covered/revenue*100):0,orders:orderCount,aov:orderCount?Math.round(revenue/orderCount):0,products:ps,customers:cs,identifiedRevenue:Math.round(identified),coverage:revenue?round1(identified/revenue*100):0,vipRevenue,storeVipShare:revenue?round1(vipRevenue/revenue*100):0,identifiedVipShare:identified?round1(vipRevenue/identified*100):0,vipCount:cs.filter(c=>c.segment==='VIP').length,repeatCount:repeat,repeatRate:cs.length?round1(repeat/cs.length*100):0,pairs:[...pairs].map(([k,n])=>({names:JSON.parse(k),count:n,percentage:round1(n/multi.length*100)})).sort((a,b)=>b.count-a.count),uncertain:!!truth?.uncertain,missingOrders:lines.some(r=>!r.order)};
}
module.exports={csv,calculate,number,date};
