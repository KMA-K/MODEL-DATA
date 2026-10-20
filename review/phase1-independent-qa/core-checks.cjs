const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const qa=__dirname,project=path.join(qa,'project');
const ts=require('./project/node_modules/typescript');
const {csv,calculate}=require('./oracle/independent.cjs');
const mapping={dateCol:'Ngày bán',productCol:'Tên sản phẩm',quantityCol:'Số lượng',revenueCol:'Doanh thu',unitPriceCol:'Đơn giá',costPriceCol:'Giá vốn',orderIdCol:'Mã đơn hàng',customerIdCol:'Mã khách hàng',categoryCol:'Danh mục'};
function compile(source,dest) {
  fs.mkdirSync(dest,{recursive:true});
  for(const name of fs.readdirSync(source).filter(n=>n.endsWith('.ts'))) {
    const output=ts.transpileModule(fs.readFileSync(path.join(source,name),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText.replace(/require\("(\.\/[^".]+)"\)/g,(_,s)=>`require("${s}.cjs")`);
    fs.writeFileSync(path.join(dest,name.replace(/\.ts$/,'.cjs')),output);
  }
}
compile(path.join(project,'src/core'),path.join(project,'qa-runtime'));
compile(path.resolve(qa,'../project/src/core'),path.join(project,'qa-old-runtime'));
const app=require('./project/qa-runtime/analyzer.cjs'),cleaner=require('./project/qa-runtime/cleaner.cjs'),parser=require('./project/qa-runtime/parser.cjs');
const oldApp=require('./project/qa-old-runtime/analyzer.cjs');
const write=(n,v)=>fs.writeFileSync(path.join(qa,'evidence',n+'.json'),JSON.stringify(v,null,2));
const manifest=JSON.parse(fs.readFileSync(path.join(qa,'fixtures/manifest.json'),'utf8'));
const results=[];
function compare(id,expected,actual) {
  const tests=[];const check=(field,e,a)=>tests.push({field,expected:e,actual:a,pass:JSON.stringify(e)===JSON.stringify(a)});
  for(const [field,e,a] of [
    ['revenue',expected.revenue,actual.overview.totalRevenue],['quantity',expected.quantity,actual.overview.totalQuantity],['profit',expected.profit,actual.overview.totalProfit],['margin',expected.margin,actual.overview.profitMargin],['costCoverage',expected.costCoverage,actual.overview.costCoverage],['valid',expected.validRows,actual.cleaningReport.validRows],['dropped',expected.dropped,actual.cleaningReport.droppedTotal],['suspectedCount',expected.suspectedCount,actual.cleaningReport.suspectedDuplicates?.count||0],['suspectedRevenue',expected.suspectedRevenue,actual.cleaningReport.suspectedDuplicates?.totalRevenue||0],['orders',expected.orders,actual.overview.totalOrders],['aov',expected.aov,actual.overview.averageOrderValue],['coverage',expected.coverage,actual.customerAnalysis.customerRevenueCoverage],['identifiedRevenue',expected.identifiedRevenue,actual.customerAnalysis.identifiedCustomerRevenue],['repeatCount',expected.repeatCount,actual.customerAnalysis.repeatCustomersCount],['repeatRate',expected.repeatRate,actual.customerAnalysis.repeatCustomerRate],['vipCount',expected.vipCount,actual.customerAnalysis.vipCustomers.length]
  ])check(field,e,a);
  const vip=actual.customerAnalysis.segmentsSummary.find(s=>s.segment==='VIP');
  check('vipStoreShare',expected.storeVipShare,vip?.storeRevenuePercentage||0);check('vipIdentifiedShare',expected.identifiedVipShare,vip?.revenuePercentage||0);
  for(const p of expected.products){const a=actual.productAnalysis.products.find(x=>x.name===p.name);for(const f of ['revenue','quantity','profit'])check(`product.${p.name}.${f}`,p[f],a?.[f]);check(`product.${p.name}.abc`,p.abc,a?.abcGroup);check(`product.${p.name}.orders`,p.orders,a?.ordersCount);}
  for(const c of expected.customers){const a=actual.customerAnalysis.customers.find(x=>x.customerId===c.id);check(`customer.${c.id}.frequency`,c.frequency,a?.ordersCount);check(`customer.${c.id}.spend`,Math.round(c.spend),a?.totalSpend);check(`customer.${c.id}.segment`,c.segment,a?.segment);}
  // Compare all pairs when <= 10. Tied top-ten truncation is documented separately.
  if(expected.pairs.length<=10){const key=p=>JSON.stringify(p.names);check('pairs',expected.pairs.map(p=>({key:key(p),count:p.count,percentage:p.percentage})).sort((a,b)=>a.key.localeCompare(b.key)),actual.productAnalysis.coOccurrences.map(p=>({key:JSON.stringify([p.productA,p.productB]),count:p.count,percentage:p.percentage})).sort((a,b)=>a.key.localeCompare(b.key)));}
  return {id,checks:tests.length,failures:tests.filter(t=>!t.pass),status:tests.every(t=>t.pass)?'PASS':'FAIL'};
}
function summary(a){return {report:a.cleaningReport,overview:a.overview,customers:a.customerAnalysis,products:a.productAnalysis,conclusions:a.conclusions,actions:a.actionSuggestions};}
(async()=>{
  for(const m of manifest.filter(m=>m.file.endsWith('.csv'))) {
    const raw=csv(fs.readFileSync(path.join(qa,m.file),'utf8'),m.delimiter||',');
    for(const policy of ['keep_all','drop_exact_duplicates']) {
      const expected=calculate(raw,{policy,truth:policy==='keep_all'?m.truth:null});
      const start=performance.now(),actual=app.runFullAnalysis(raw,{...mapping,deduplicatePolicy:policy});
      const comparison=compare(m.id+'-'+policy,expected,actual);
      const repeat=app.runFullAnalysis(raw,{...mapping,deduplicatePolicy:policy});
      comparison.deterministic=JSON.stringify(actual)===JSON.stringify(repeat);comparison.elapsedMs=Math.round(performance.now()-start);
      comparison.fixture=m.file;comparison.uncertain=!!m.truth?.uncertain;results.push(comparison);
      write(m.id+'-'+policy,{fixture:m.file,groundTruth:m.truth,expected,actual:summary(actual),comparison});
    }
    if(m.group!=='scale') {
      const asyncResult=await app.runFullAnalysisAsync(raw,mapping,()=>{});const sync=app.runFullAnalysis(raw,mapping);
      results.push({id:m.id+'-sync-async',status:JSON.stringify(asyncResult)===JSON.stringify(sync)?'PASS':'FAIL',checks:1,failures:[],fixture:m.file});
    }
  }
  const fileResults=[];
  const paths=[...manifest.filter(m=>/\.(xlsx|xls)$/.test(m.file)).map(m=>m.file),...['excel-first-normal.xlsx','excel-blanks.xlsx','excel-date-serial.xlsx','excel-data-second.xlsx','excel-header-row3.xlsx','legacy.xls'].map(n=>'project/review/data/'+n),'fixtures/empty.xlsx','fixtures/corrupt.xlsx','fixtures/header-only.xlsx'];
  for(const file of paths) {const start=performance.now();try{const parsed=await parser.parseSalesFile(new File([fs.readFileSync(path.join(qa,file))],path.basename(file)));const actual=app.runFullAnalysis(parsed.allRows,mapping);const m=manifest.find(m=>m.file===file);const expected=m?calculate(m.rows,{truth:m.truth}):calculate(parsed.allRows);const comparison=compare(path.basename(file),expected,actual);fileResults.push({file,parsed:{headers:parsed.headers,totalRows:parsed.totalRows},comparison,overview:actual.overview,report:actual.cleaningReport,elapsedMs:Math.round(performance.now()-start)});}catch(e){fileResults.push({file,error:e.message,elapsedMs:Math.round(performance.now()-start)});}}
  write('excel-regression',fileResults);
  const sample=csv(fs.readFileSync(path.join(project,'public/sample-data/du_lieu_ban_hang_mau.csv'),'utf8'));
  const before=oldApp.runFullAnalysis(sample,mapping),after=app.runFullAnalysis(sample,mapping),strict=app.runFullAnalysis(sample,{...mapping,deduplicatePolicy:'drop_exact_duplicates'});
  const oracleBefore=calculate(sample,{old:true,policy:'drop_exact_duplicates'}),oracleAfter=calculate(sample),oracleStrict=calculate(sample,{policy:'drop_exact_duplicates'});
  const added=oracleAfter.keptIndices.filter(i=>!oracleBefore.keptIndices.includes(i));
  write('sample-impact',{before:summary(before),after:summary(after),strict:summary(strict),oracleBefore,oracleAfter,oracleStrict,addedRows:added.map(i=>({index:i,row:sample[i-1]})),delta:{revenue:after.overview.totalRevenue-before.overview.totalRevenue,quantity:after.overview.totalQuantity-before.overview.totalQuantity,profit:after.overview.totalProfit-before.overview.totalProfit,orders:after.overview.totalOrders-before.overview.totalOrders,aov:after.overview.averageOrderValue-before.overview.averageOrderValue},checks:[compare('sample-after',oracleAfter,after),compare('sample-strict',oracleStrict,strict)]});
  for(const filename of ['oracle-28.csv','boundary-abc.csv','boundary-rfm.csv','cleaning-reasons.csv']){const raw=csv(fs.readFileSync(path.join(project,'review/data',filename),'utf8'));const expected=calculate(raw),actual=app.runFullAnalysis(raw,mapping);write('regression-'+filename,{expected,actual,comparison:compare(filename,expected,actual)});}
  const lock=JSON.parse(fs.readFileSync(path.join(project,'package-lock.json'),'utf8')),oldLock=JSON.parse(fs.readFileSync(path.resolve(qa,'../project/package-lock.json'),'utf8'));
  const xlsx=require('./project/node_modules/xlsx');
  write('dependency',{declared:JSON.parse(fs.readFileSync(path.join(project,'package.json'),'utf8')).dependencies.xlsx,installed:xlsx.version,lock:lock.packages['node_modules/xlsx'],allLockEntries:lock.packages,added:Object.keys(lock.packages).filter(k=>!oldLock.packages[k]),removed:Object.keys(oldLock.packages).filter(k=>!lock.packages[k]),versions:{node:process.version,platform:process.platform,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone},bundleSheetVersions:fs.readdirSync(path.join(project,'dist/assets')).filter(n=>n.startsWith('sales.worker')).map(n=>({name:n,v0203:fs.readFileSync(path.join(project,'dist/assets',n),'utf8').includes('0.20.3'),v0185:fs.readFileSync(path.join(project,'dist/assets',n),'utf8').includes('0.18.5')}))});
  write('core-results',results);console.log(JSON.stringify({cases:results.length,checks:results.reduce((s,r)=>s+r.checks,0),failed:results.filter(r=>r.status==='FAIL').map(r=>({id:r.id,failures:r.failures.slice(0,5)})),sample:{before:before.overview,after:after.overview,added:added.length}},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
