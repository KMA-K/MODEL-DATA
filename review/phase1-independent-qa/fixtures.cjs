const fs=require('node:fs'),path=require('node:path');
const qa=__dirname;const XLSX=require('./project/node_modules/xlsx');
const headers=['Ngày bán','Tên sản phẩm','Mã sản phẩm','Danh mục','Số lượng','Doanh thu','Đơn giá','Giá vốn','Mã đơn hàng','Mã khách hàng'];
const row=(o={})=>({'Ngày bán':'2026-09-01','Tên sản phẩm':'Trà','Mã sản phẩm':'SP1','Danh mục':'Đồ uống','Số lượng':1,'Doanh thu':100000,'Đơn giá':'','Giá vốn':60000,'Mã đơn hàng':'HD1','Mã khách hàng':'KH1',...o});
const manifest=[];
const quote=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
function add(id,rows,opts={}) {
  const file=`fixtures/${id}.csv`;fs.writeFileSync(path.join(qa,file),'\uFEFF'+headers.map(quote).join(',')+'\n'+rows.map(r=>headers.map(h=>quote(r[h])).join(',')).join('\n')+'\n');
  const record={id,file,rows,truth:opts.truth||null,group:opts.group||'adversarial',note:opts.note||''};manifest.push(record);
  if(opts.excel){const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Sales');for(const ext of ['xlsx','xls']){const ef=`fixtures/${id}.${ext}`;XLSX.writeFile(wb,path.join(qa,ef),{bookType:ext==='xls'?'biff8':'xlsx'});manifest.push({...record,id:id+'-'+ext,file:ef});}}
}
add('duplicate-real',[row(),row()],{excel:true,truth:{orders:['A','A'],realRevenue:200000}});
add('duplicate-copy',[row(),row()],{truth:{orders:['A','A'],realRevenue:100000,copies:[2]}});
add('duplicate-three',[row(),row(),row()]);
add('duplicate-nonadjacent',[row(),row({'Tên sản phẩm':'Bánh','Mã đơn hàng':'HD2'}),row()]);
add('duplicate-no-order',[row({'Mã đơn hàng':''}),row({'Mã đơn hàng':''})]);
add('duplicate-whitespace',[row(),row({'Tên sản phẩm':' Trà ','Mã đơn hàng':' HD1 ','Mã khách hàng':' KH1 '})]);
add('duplicate-case',[row(),row({'Tên sản phẩm':'trà','Mã đơn hàng':'hd1'})]);
add('duplicate-normalized',[row(),row({'Ngày bán':'01/09/2026','Doanh thu':'100.000 đ','Số lượng':'1'})]);
add('duplicate-different-sku',[row(),row({'Mã sản phẩm':'SP2'})],{truth:{orders:['A','A'],realRevenue:200000},note:'Tên giống, mã SP khác; mapping chỉ có một product field.'});
add('duplicate-different-cost',[row({'Giá vốn':60000}),row({'Giá vốn':140000})]);
add('duplicate-pipe-collision',[row({'Mã đơn hàng':'O|P','Tên sản phẩm':'Q'}),row({'Mã đơn hàng':'O','Tên sản phẩm':'P|Q'})],{truth:{orders:['A','B']}});
add('duplicate-placeholder',[row({'Mã đơn hàng':''}),row({'Mã đơn hàng':'NO_ORDER'})],{truth:{orders:['A','B']}});
add('order-reused-days',[row({'Doanh thu':50000,'Giá vốn':30000,'Ngày bán':'01/09/2026','Mã khách hàng':'KH01'}),row({'Doanh thu':70000,'Giá vốn':40000,'Ngày bán':'30/09/2026','Tên sản phẩm':'Bánh','Mã khách hàng':'KH02'})],{truth:{orders:['A','B']}});
add('order-same-day-customers',[row(),row({'Mã khách hàng':'KH2','Tên sản phẩm':'Bánh'})],{truth:{orders:['A','B']}});
add('order-same-day-uncertain',[row(),row({'Tên sản phẩm':'Bánh','Doanh thu':50000})],{truth:{orders:['A','B'],uncertain:true}});
add('order-multi-items',[row(),row({'Tên sản phẩm':'Bánh','Doanh thu':50000}),row({'Tên sản phẩm':'Sữa','Doanh thu':30000})],{truth:{orders:['A','A','A']}});
add('order-guests-uncertain',[row({'Mã khách hàng':''}),row({'Tên sản phẩm':'Bánh','Mã khách hàng':''})],{truth:{orders:['A','B'],uncertain:true}});
add('order-guest-placeholder-collision',[row({'Mã khách hàng':'','Doanh thu':50000,'Tên sản phẩm':'A'}),row({'Mã khách hàng':'KH-LE','Doanh thu':70000,'Tên sản phẩm':'B'}),row({'Mã khách hàng':'OTHER','Ngày bán':'2026-09-02','Doanh thu':30000,'Tên sản phẩm':'C'})],{truth:{orders:['A','B','C']}});
add('order-raw-internal-collision',[row({'Mã đơn hàng':'HD','Mã khách hàng':'KH1','Doanh thu':50000,'Tên sản phẩm':'A'}),row({'Mã đơn hàng':'HD','Mã khách hàng':'KH2','Ngày bán':'2026-09-02','Doanh thu':70000,'Tên sản phẩm':'B'}),row({'Mã đơn hàng':'HD#2026-09-01#KH1','Mã khách hàng':'KH1','Doanh thu':30000,'Tên sản phẩm':'C'})],{truth:{orders:['A','B','C']}});
add('order-hash-ids',[row({'Mã đơn hàng':'HD#x','Mã khách hàng':'KH#1'}),row({'Mã đơn hàng':'HD#x','Mã khách hàng':'KH#2'}),row({'Mã đơn hàng':'HD#x#2026-09-01#KH#1','Mã khách hàng':'KH#1','Tên sản phẩm':'Bánh'})],{truth:{orders:['A','B','C']}});
add('order-whitespace',[row({'Mã đơn hàng':' HD1 '}),row({'Mã đơn hàng':'HD1','Tên sản phẩm':'Bánh'})],{truth:{orders:['A','A']}});
add('order-case',[row({'Mã đơn hàng':'HD1'}),row({'Mã đơn hàng':'hd1'})],{truth:{orders:['A','B']}});
add('order-long',[row({'Mã đơn hàng':'L'.repeat(4096)}),row({'Mã đơn hàng':'L'.repeat(4096)+'x'})],{truth:{orders:['A','B']}});
add('order-times-uncertain',[row({'Ngày bán':'2026-09-01T09:00:00'}),row({'Ngày bán':'2026-09-01T17:00:00','Tên sản phẩm':'Bánh'})],{truth:{orders:['A','B'],uncertain:true},note:'Thời điểm có trong file nhưng parser chỉ giữ ngày.'});
add('order-auto-prefix',[row({'Mã đơn hàng':'AUTO-REAL'})],{truth:{orders:['A']}});
add('order-none',[row({'Mã đơn hàng':''}),row({'Mã đơn hàng':'','Tên sản phẩm':'Bánh'})]);
add('order-partial',[row(),row({'Mã đơn hàng':'','Tên sản phẩm':'Bánh'})]);
add('order-partial-pairs',[row(),row({'Tên sản phẩm':'Bánh'}),row({'Mã đơn hàng':'','Tên sản phẩm':'Sữa'})]);
for(const pct of [100,50,10,0.01,0]) {
  add('customer-coverage-'+String(pct).replace('.','_'),[row({'Doanh thu':Math.round(1000000*pct/100),'Giá vốn':'','Mã khách hàng':pct?'KH1':''}),row({'Doanh thu':1000000-Math.round(1000000*pct/100),'Giá vốn':'','Mã đơn hàng':'HD2','Mã khách hàng':''})].filter(r=>r['Doanh thu']>0));
}
add('customer-no-vip',[row({'Ngày bán':'2026-01-01'}),row({'Ngày bán':'2026-09-01','Mã khách hàng':'','Mã đơn hàng':'HD2'})]);
add('customer-multiple-vip',[row(),row({'Mã khách hàng':'KH2','Mã đơn hàng':'HD2'})]);
add('customer-unreliable-coverage',[row({'Mã đơn hàng':''}),row({'Doanh thu':900000,'Mã khách hàng':'','Mã đơn hàng':''})]);
add('profit-none',[row({'Giá vốn':''})]);
add('profit-partial',[row({'Giá vốn':60000}),row({'Tên sản phẩm':'Bánh','Mã đơn hàng':'HD2','Giá vốn':''})]);
add('profit-positive',[row()]);
add('profit-negative',[row({'Giá vốn':140000})]);
add('profit-zero',[row({'Giá vốn':100000})]);
add('profit-mixed',[row(),row({'Tên sản phẩm':'Bánh','Mã đơn hàng':'HD2','Giá vốn':140000})]);
add('profit-loss-break-even',[row({'Giá vốn':140000}),row({'Tên sản phẩm':'Bánh','Mã đơn hàng':'HD2','Giá vốn':100000})]);
add('profit-same-product-partial',[row({'Giá vốn':140000}),row({'Doanh thu':900000,'Mã đơn hàng':'HD2','Giá vốn':''})]);
add('profit-free-cost',[row({'Giá vốn':0})],{note:'Zero cost input; existing cleaner treats as missing, requires business decision.'});
for(const repeats of [0,3,6]) {const rows=[];for(let i=1;i<=6;i++){rows.push(row({'Mã khách hàng':'KH'+i,'Mã đơn hàng':'HD'+i}));if(i<=repeats)rows.push(row({'Mã khách hàng':'KH'+i,'Mã đơn hàng':'HD'+i+'-2'}));}add('repeat-six-'+repeats,rows);}
add('repeat-months',[row({'Ngày bán':'2026-01-01'}),row({'Ngày bán':'2026-09-01','Mã đơn hàng':'HD2'})]);
add('combo-a',[row(),row(),row(),row({'Ngày bán':'2026-09-02','Mã khách hàng':'','Tên sản phẩm':'Bánh'})]);
add('combo-b',[row(),row({'Mã khách hàng':'KH2'}),row({'Ngày bán':'2026-09-02'}),row({'Ngày bán':'2026-09-02','Mã khách hàng':'KH2'})]);
for(const n of [1000,10000,50000,200000]) {
  const rows=[];for(let i=0;i<n;i++){const g=Math.floor(i/5);rows.push(row({'Tên sản phẩm':'P'+(i%25),'Số lượng':1,'Doanh thu':100,'Giá vốn':60,'Mã đơn hàng':'O'+Math.floor(g/2),'Ngày bán':g%2?'2026-09-02':'2026-09-01','Mã khách hàng':'C'+(g%300)}));}
  // Every tenth group copies previous group exactly; 10% extra rows are candidates.
  for(let g=9;g<Math.floor(n/5);g+=10)for(let j=0;j<5;j++)rows[g*5+j]={...rows[(g-1)*5+j]};
  add('scale-'+n,rows,{group:'scale'});
}
const reverseIds=['duplicate-three','duplicate-different-cost','order-guest-placeholder-collision','order-raw-internal-collision','combo-a'];
for(const id of reverseIds){const src=manifest.find(m=>m.id===id);add(id+'-reversed',[...src.rows].reverse(),{truth:src.truth?{...src.truth,orders:src.truth.orders?[...src.truth.orders].reverse():undefined}:null});}
for(const delimiter of [';', '\t']) {const id=delimiter===';'?'csv-semicolon':'csv-tab';const rows=[row({'Tên sản phẩm':'Trà "lài",\nấm'})];const file=`fixtures/${id}.csv`;fs.writeFileSync(path.join(qa,file),headers.map(quote).join(delimiter)+'\n'+rows.map(r=>headers.map(h=>quote(r[h])).join(delimiter)).join('\n'));manifest.push({id,file,rows,delimiter});}
fs.writeFileSync(path.join(qa,'fixtures/empty.xlsx'),Buffer.alloc(0));fs.writeFileSync(path.join(qa,'fixtures/corrupt.xlsx'),Buffer.from([0x50,0x4b,0x03,0x04,0,0,0,0]));
const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([headers]),'Sales');XLSX.writeFile(wb,path.join(qa,'fixtures/header-only.xlsx'));
const large=manifest.find(m=>m.id==='scale-50000');const big=XLSX.utils.book_new();XLSX.utils.book_append_sheet(big,XLSX.utils.json_to_sheet(large.rows),'Sales');XLSX.writeFile(big,path.join(qa,'fixtures/scale-50000.xlsx'));manifest.push({...large,id:'scale-50000-xlsx',file:'fixtures/scale-50000.xlsx'});
fs.writeFileSync(path.join(qa,'fixtures/manifest.json'),JSON.stringify(manifest));
console.log(JSON.stringify({fixtures:manifest.length,rows:manifest.reduce((s,m)=>s+m.rows.length,0)}));
