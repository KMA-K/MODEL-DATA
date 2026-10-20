const fs=require('node:fs'),path=require('node:path'),XLSX=require('../node_modules/xlsx');
const dir=path.join(__dirname,'data');fs.mkdirSync(dir,{recursive:true});
const headers=['Mã đơn hàng','Ngày bán','Tên sản phẩm','Số lượng','Đơn giá','Doanh thu','Giá vốn','Mã khách hàng','Danh mục'];
const row=(product='Trà',revenue=100000,date='2026-09-30',customer='KH1',order='HD1',quantity=2)=>({'Mã đơn hàng':order,'Ngày bán':date,'Tên sản phẩm':product,'Số lượng':quantity,'Đơn giá':revenue/quantity,'Doanh thu':revenue,'Giá vốn':revenue/quantity*.6,'Mã khách hàng':customer,'Danh mục':'Đồ dùng thử'});
function csv(rows,fields=headers,delimiter=',',bom=false){return(bom?'\uFEFF':'')+[fields,...rows.map(r=>fields.map(h=>r[h]??''))].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(delimiter)).join('\r\n');}
const cases=[];
function save(name,rows,options={}){const filename=name+'.'+(options.ext||'csv');fs.writeFileSync(path.join(dir,filename),options.content??csv(rows,options.fields||headers,options.delimiter||',',options.bom));cases.push({name,file:filename,note:options.note||'',rows:rows.length});return filename;}
const specs=[
['Cà phê',50000,'2026-05-01','KH-risk','R1'],['Cà phê',50000,'2026-05-15','KH-risk','R2'],['Cà phê',50000,'2026-06-01','KH-risk','R3'],['Cà phê',50000,'2026-06-10','KH-risk','R4'],
['Cà phê',50000,'2026-08-01','KH-vip','V1'],['Cà phê',50000,'2026-08-20','KH-vip','V2'],['Cà phê',100000,'2026-09-15','KH-vip','V3'],['Cà phê',100000,'2026-09-30','KH-vip','V4'],
['Sữa đặc',50000,'2026-05-01','KH-risk','R1'],['Sữa đặc',50000,'2026-06-10','KH-risk','R4'],['Sữa đặc',50000,'2026-05-01','KH-normal','N0'],['Sữa đặc',50000,'2026-08-01','KH-normal','N1'],['Sữa đặc',50000,'2026-08-02','KH-normal','N2'],['Sữa đặc',50000,'2026-09-30','KH-vip','V4'],
['Trà',30000,'2026-05-15','KH-loyal','L1'],['Trà',30000,'2026-08-10','KH-loyal','L2'],['Trà',30000,'2026-09-01','KH-loyal','L3'],['Trà',30000,'2026-09-15','KH-loyal','L4'],['Trà',30000,'2026-09-30','KH-loyal','L5'],
['Bánh',7500,'2026-05-01','KH-churn','C1'],['Bánh',7500,'2026-08-01','KH-normal','N1'],['Bánh',7500,'2026-08-10','KH-loyal','L2'],['Bánh',7500,'2026-09-30','KH-new','NEW1'],
['Nến',5000,'2026-05-01','KH-churn','C1'],['Nến',5000,'2026-08-01','KH-normal','N1'],['Nến',5000,'2026-09-30','KH-loyal','L5'],
['Kẹo',2500,'2026-05-01','KH-churn','C1'],['Kẹo',2500,'2026-08-01','KH-normal','N1']];
const oracleRows=specs.map((s,i)=>row(...s,i%3+1));save('oracle-28',oracleRows);fs.writeFileSync(path.join(dir,'oracle-28.json'),JSON.stringify(oracleRows,null,2));
for(const [name,delimiter,bom] of [['csv-comma',',',false],['csv-semicolon',';',false],['csv-tab','\t',false],['csv-bom',',',true]])save(name,[row()],{delimiter,bom});
save('quoted-multiline',[row('Trà "thơm"\nĐà Lạt, đặc sản')]);
save('duplicate-header',[row()],{fields:[...headers,'Doanh thu']});
save('empty',[],{content:''});save('header-only',[]);save('fake-jpeg',[],{content:Buffer.from([0xff,0xd8,0xff,0xe0,0,16,0x4a,0x46,0x49,0x46,0,1,1])});
save('missing-required',[row()],{fields:['Ngày bán','Tên sản phẩm','Doanh thu']});
save('unusual-headers',[{'Ngày bán':'2026-09-30','Tên SP':'Trà','Thành tiền':100000,SL:2,Khách:'KH1','Mã hàng':'SKU1'}],{fields:['Ngày bán','Tên SP','Thành tiền','SL','Khách','Mã hàng']});
for(const [name,date] of [['date-iso','2026-09-30'],['date-dmy','30/09/2026'],['date-us','09/30/2026'],['date-serial-csv',46295],['date-invalid','31/02/2026'],['date-ambiguous','03/04/2025'],['date-1999','1999-12-31'],['date-2101','2101-01-01']])save(name,[row('Trà',100000,date)]);
for(const [name,value] of [['number-million-vn','1.234.567'],['number-million-us','1,234,567.50'],['number-currency','125.000đ'],['number-k','50k'],['number-tr','2.5tr'],['number-ambiguous','1.234'],['number-junk','123abc'],['number-empty',''],['number-negative','-100']])save(name,[{...row(),'Số lượng':1,'Đơn giá':'','Doanh thu':value}]);
save('duplicate-real-order',[row(),row()]);save('duplicate-no-order',[row('Trà',100000,'2026-09-30','KH1',''),row('Trà',100000,'2026-09-30','KH1','')]);
save('bad-revenue-valid-price',[{...row(),'Doanh thu':'123abc'},row('Bánh',20000,'2026-09-30','KH1','HD2')]);
save('negative-profit',[{...row(),'Giá vốn':70000}]);save('total-cost-as-unit',[{...row(),'Giá vốn':60000}]);
save('single-product',[row(),row('Trà',100000,'2026-09-29','KH2','HD2')]);save('single-customer',[row(),row('Bánh',50000,'2026-08-01','KH1','HD2')]);
save('same-day-customers',Array.from({length:6},(_,i)=>row('Trà',10000+i*1000,'2026-09-30','KH'+i,'HD'+i)));
save('single-month',[row(),row('Bánh',30000,'2026-09-01','KH2','HD2')]);
save('order-partial',[row(),row('Bánh',20000,'2026-09-30','KH2','')]);save('order-none',[row('Trà',100000,'2026-09-30','KH1',''),row('Bánh',20000,'2026-09-30','KH2','')]);
save('order-reused-days',[row(),row('Bánh',20000,'2026-09-01','KH2','HD1')]);
save('cost-partial',[row(),{...row('Bánh',100000,'2026-09-30','KH2','HD2'),'Giá vốn':''}]);
save('cleaning-reasons',[row(),row(),{...row(),'Ngày bán':''},{...row(),'Tên sản phẩm':''},{...row(),'Số lượng':-1},{...row(),'Số lượng':0},{...row(),'Doanh thu':0},{...row(),'Ngày bán':'31/02/2026'},{...row(),'Ngày bán':'','Tên sản phẩm':'','Số lượng':-1}]);
save('special-names',['=SUM(1,1)','+cmd','-cmd','@cmd','<script>alert(1)</script>','**in đậm**','Tên "nháy"'].map((name,i)=>row(name,10000+i,'2026-09-30',name,'SPECIAL'+i)));
save('whitespace-order',[row('Trà',100000,'2026-09-30','KH1','   ')]);
save('boundary-rfm',[row('Trà',400000,'2026-08-01','KH-R60','B1'),row('Trà',300000,'2026-07-31','KH-R61','B2'),...Array.from({length:4},(_,i)=>row('Bánh',10000,'2026-09-'+String(27+i).padStart(2,'0'),'KH-F4','F'+i)),row('Kẹo',1000,'2026-09-30','KH-low','B3')]);
save('boundary-abc',[row('A',80000),row('B',15000),row('C',5000)]);
for(const count of [50000,200000]){const rows=Array.from({length:count},(_,i)=>row('SP'+i%25,100,'2026-09-30','KH'+Math.floor(i/5)%300,'HD'+Math.floor(i/5),1));save('scale-'+count,rows);}
function excel(name,sheets){const book=XLSX.utils.book_new();for(const [title,sheet] of sheets)XLSX.utils.book_append_sheet(book,sheet,title);XLSX.writeFile(book,path.join(dir,name+'.xlsx'));cases.push({name,file:name+'.xlsx',note:'Excel',rows:null});}
excel('excel-first-normal',[['Data',XLSX.utils.json_to_sheet([row()])]]);
excel('excel-data-second',[['Giới thiệu',XLSX.utils.aoa_to_sheet([['BÁO CÁO BÁN HÀNG']])],['Data',XLSX.utils.json_to_sheet([row()])]]);
excel('excel-header-row3',[['Data',XLSX.utils.aoa_to_sheet([['BÁO CÁO'],[],headers,headers.map(h=>row()[h])])]]);
const merged=XLSX.utils.aoa_to_sheet([['BÁO CÁO'],[],headers,headers.map(h=>row()[h])]);merged['!merges']=[{s:{r:0,c:0},e:{r:0,c:8}}];excel('excel-merged',[['Data',merged]]);
excel('excel-blanks',[['Data',XLSX.utils.json_to_sheet([row(),{...row('Bánh',20000,'2026-09-30','KH2','HD2'),'Giá vốn':'','Danh mục':''}])]]);
excel('excel-date-serial',[['Data',XLSX.utils.json_to_sheet([row('Trà',100000,46295)])]]);
fs.writeFileSync(path.join(__dirname,'evidence','fixture-manifest.json'),JSON.stringify(cases,null,2));console.log('Generated '+cases.length+' input cases, oracle has '+oracleRows.length+' rows.');
module.exports={csv};
