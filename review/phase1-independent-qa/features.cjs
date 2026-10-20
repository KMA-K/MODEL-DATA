const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('./project/node_modules/playwright');
const h=require('./browser.cjs'),{csv,calculate}=require('./oracle/independent.cjs');
const qa=__dirname;
const sum=(rs,key)=>rs.reduce((s,r)=>s+Number(r[key]),0);
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const ctx=await h.setup(browser),page=await ctx.newPage(),network=h.monitor(page),checks=[];
  function check(id,e,a){const pass=JSON.stringify(e)===JSON.stringify(a);checks.push({id,expected:e,actual:a,status:pass?'PASS':'FAIL'});console.log(id+': '+(pass?'PASS':'FAIL'));}
  await h.open(page);await h.upload(page,'project/public/sample-data/du_lieu_ban_hang_mau.csv');await h.analyze(page);
  const raw=csv(fs.readFileSync(path.join(qa,'project/public/sample-data/du_lieu_ban_hang_mau.csv'),'utf8')),expected=calculate(raw);
  const sample={overview:await h.state(page),overviewScreenshot:await h.snap(page,'sample-current-overview'),expected};
  check('sample-ui-revenue',true,sample.overview.kpis.find(k=>k.title==='TỔNG DOANH THU').value.includes('739,8 triệu'));
  check('sample-ui-orders','2.627',sample.overview.kpis.find(k=>k.title==='TỔNG ĐƠN HÀNG').value);
  await page.getByRole('button',{name:'Báo cáo làm sạch',exact:true}).click();sample.report=await page.locator('dialog .dialog-inner').innerText();sample.reportScreenshot=await h.snap(page,'sample-current-report');await page.keyboard.press('Escape');
  check('sample-report-candidates',true,sample.report.includes('42 dòng được giữ'));
  await h.tab(page,'Sản phẩm');sample.products=await h.state(page);check('sample-product-page1',20,sample.products.rows.length);
  await page.getByRole('button',{name:'Trang sau',exact:true}).click();check('sample-product-page2',true,(await page.locator('.table-pagination').innerText()).includes('21–40'));
  sample.productExport=await h.exportCsv(page,'sample-products-all-page2');check('product-export-all-rows',50,sample.productExport.rows.length);check('product-export-revenue',expected.revenue,sum(sample.productExport.rows,'Doanh thu'));check('product-export-profit',expected.profit,sum(sample.productExport.rows,'Lợi nhuận trên dữ liệu đủ giá vốn'));
  for(const [label,key,numeric] of [['Sản phẩm','Tên sản phẩm',false],['Số lượng','Số lượng',true],['Doanh thu','Doanh thu',true],['Lợi nhuận','Lợi nhuận trên dữ liệu đủ giá vốn',true]]) {
    const button=page.getByRole('button',{name:label,exact:true});
    for(let turn=0;turn<2;turn++){await button.click();const d=await h.exportCsv(page,'sort-products-'+label+'-'+turn),th=button.locator('..'),asc=(await th.getAttribute('aria-sort'))==='ascending';const values=d.rows.map(r=>numeric?Number(r[key]):r[key]);check('product-sort-'+label+'-'+turn,true,values.every((v,i)=>!i||(numeric?(asc?values[i-1]<=v:values[i-1]>=v):(asc?values[i-1].localeCompare(v,'vi')<=0:values[i-1].localeCompare(v,'vi')>=0))));}
  }
  await page.getByLabel('Tìm sản phẩm',{exact:true}).fill('Cà phê');const filtered=await h.exportCsv(page,'sample-filter-products');check('product-filter-exact-subset',true,filtered.rows.every(r=>r['Tên sản phẩm'].toLowerCase().includes('cà phê')));check('product-filter-count',expected.products.filter(p=>p.name.toLowerCase().includes('cà phê')).length,filtered.rows.length);
  await h.tab(page,'Khách hàng');sample.customers=await h.state(page);await page.getByRole('button',{name:'Trang sau',exact:true}).click();sample.customerExport=await h.exportCsv(page,'sample-customers-all-page2');check('customer-export-all-rows',300,sample.customerExport.rows.length);check('customer-export-spend',expected.revenue,sum(sample.customerExport.rows,'Tổng chi tiêu'));
  check('customer-export-frequency',true,sample.customerExport.rows.every(r=>Number(r['Số đơn'])===expected.customers.find(c=>c.id===r['Mã khách']).frequency));
  for(const [label,key,numeric] of [['Khách hàng','Mã khách',false],['Tổng chi tiêu','Tổng chi tiêu',true],['Số đơn','Số đơn',true],['Gần nhất','Số ngày chưa mua',true]])for(let turn=0;turn<2;turn++){const b=page.getByRole('button',{name:label,exact:true});await b.click();const d=await h.exportCsv(page,'sort-customers-'+label+'-'+turn),asc=await b.locator('..').getAttribute('aria-sort')==='ascending',vs=d.rows.map(r=>numeric?Number(r[key]):r[key]);check('customer-sort-'+label+'-'+turn,true,vs.every((v,i)=>!i||(numeric?(asc?vs[i-1]<=v:vs[i-1]>=v):(asc?vs[i-1].localeCompare(v,'vi')<=0:vs[i-1].localeCompare(v,'vi')>=0))));}
  await page.getByLabel('Lọc phân khúc khách hàng',{exact:true}).selectOption('VIP');const vipCsv=await h.exportCsv(page,'sample-vips');check('customer-filter-vip',expected.vipCount,vipCsv.rows.length);
  sample.customerScreenshot=await h.snap(page,'sample-current-customers');
  // Theme controls and known baseline geometry are measured on actual inner panel.
  await page.getByRole('button',{name:'Tùy chỉnh giao diện',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Tùy chỉnh giao diện'});sample.drawer=await dialog.evaluate(e=>({parent:{width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height},inner:{width:e.querySelector('.dialog-inner').getBoundingClientRect().width,height:e.querySelector('.dialog-inner').getBoundingClientRect().height}}));
  await page.getByRole('button',{name:'Tối',exact:true}).click();check('theme-dark','dark',await page.locator('html').getAttribute('data-theme'));
  const themes=[['Lục bảo','emerald'],['San hô','coral'],['Đại dương','ocean'],['Hoàng kim','amber'],['Indigo','indigo']];
  for(const [label,value] of themes){await page.getByRole('button',{name:'Màu '+label,exact:true}).click();check('theme-'+value,value,await page.locator('html').getAttribute('data-accent'));}
  await page.keyboard.press('Escape');sample.darkScreenshot=await h.snap(page,'sample-dark');await page.reload();check('theme-persist','dark',await page.locator('html').getAttribute('data-theme'));
  h.write('feature-regression',{checks,sample,network});await ctx.close();
  // Tooltip contents are observed on rendered chart, not inferred from Worker values.
  const tc=await h.setup(browser),tp=await tc.newPage();await h.open(tp);await h.upload(tp,'fixtures/customer-coverage-10.csv');await h.analyze(tp);await h.tab(tp,'Khách hàng');
  const bar=tp.locator('.recharts-bar-rectangle').first();await bar.hover();await tp.locator('.glass-tooltip').waitFor();h.write('customer-tooltip',{text:await tp.locator('.glass-tooltip').innerText(),state:await h.state(tp),screenshot:await h.snap(tp,'customer-coverage-tooltip')});await tc.close();
  // A -> B -> cancel -> A, with real Playwright pointer clicks.
  const cc=await h.setup(browser),cp=await cc.newPage(),cancel=[];
  await h.open(cp);await h.upload(cp,'fixtures/duplicate-real.csv');await h.analyze(cp);cancel.push({stage:'A-first',state:await h.state(cp)});
  await cp.getByRole('button',{name:'Phân tích file mới',exact:true}).click();await cp.locator('input[type=file]').setInputFiles(path.join(qa,'fixtures/scale-200000.csv'));await cp.getByRole('button',{name:'Hủy xử lý',exact:true}).waitFor();await cp.getByRole('button',{name:'Hủy xử lý',exact:true}).click();await cp.getByRole('button',{name:'Chọn file bán hàng',exact:true}).waitFor();await cp.waitForTimeout(1200);cancel.push({stage:'cancel-parse-B',state:await h.state(cp),worker:await cp.evaluate(()=>({active:window.__qa.active,events:window.__qa.events}))});
  await h.upload(cp,'fixtures/scale-200000.csv');await cp.getByRole('button',{name:'Khám phá dữ liệu',exact:true}).click();await cp.getByRole('button',{name:'Hủy xử lý',exact:true}).waitFor();await cp.getByRole('button',{name:'Hủy xử lý',exact:true}).click();await cp.locator('.mapping-page').waitFor();await cp.waitForTimeout(1200);cancel.push({stage:'cancel-analyze-B',state:await h.state(cp),worker:await cp.evaluate(()=>({active:window.__qa.active,events:window.__qa.events}))});
  await cp.getByRole('button',{name:'Chọn file khác',exact:true}).click();await h.upload(cp,'fixtures/duplicate-real.csv');await h.analyze(cp);await cp.waitForTimeout(1200);cancel.push({stage:'A-last',state:await h.state(cp),worker:await cp.evaluate(()=>({active:window.__qa.active,analysis:window.__qa.analysis}))});h.write('cancel-sequence',cancel);await cc.close();
  // Large datasets, twice each. Renderer JS heap via CDP, not total browser memory.
  const perf=[];for(const n of [1000,10000,50000,200000])for(const run of [1,2]){
    const pc=await h.setup(browser),pp=await pc.newPage(),cdp=await pc.newCDPSession(pp);await h.open(pp);const heap0=(await cdp.send('Runtime.getHeapUsage')).usedSize;
    const start=performance.now();await h.upload(pp,'fixtures/scale-'+n+'.csv');const parseMs=performance.now()-start,heap1=(await cdp.send('Runtime.getHeapUsage')).usedSize;
    await pp.evaluate(()=>{window.__gaps=[];});const start2=performance.now();await h.analyze(pp);const analyzeMs=performance.now()-start2,heap2=(await cdp.send('Runtime.getHeapUsage')).usedSize;
    const observed=await pp.evaluate(()=>({analysis:window.__qa.analysis,gap:Math.max(...window.__gaps,0),active:window.__qa.active}));
    const expected=JSON.parse(fs.readFileSync(path.join(qa,'evidence/scale-'+n+'-keep_all.json'),'utf8')).expected;
    const totals={revenue:observed.analysis.overview.totalRevenue,orders:observed.analysis.overview.totalOrders,quantity:observed.analysis.overview.totalQuantity,profit:observed.analysis.overview.totalProfit,candidates:observed.analysis.cleaningReport.suspectedDuplicates?.count||0};
    const expectedTotals={revenue:expected.revenue,orders:expected.orders,quantity:expected.quantity,profit:expected.profit,candidates:expected.suspectedCount};
    perf.push({n,run,parseMs:Math.round(parseMs),analyzeMs:Math.round(analyzeMs),mainHeartbeatMaxMs:observed.gap,mainHeapMiB:[heap0,heap1,heap2].map(v=>Math.round(v/1024/1024*10)/10),totals,expectedTotals,status:JSON.stringify(totals)===JSON.stringify(expectedTotals)?'PASS':'FAIL',ui:await h.state(pp),activeWorker:observed.active});console.log('PERF '+n+' run '+run+': '+Math.round(parseMs)+'/'+Math.round(analyzeMs));await pc.close();
  }
  const xc=await h.setup(browser),xp=await xc.newPage();await h.open(xp);let start=performance.now();await h.upload(xp,'fixtures/scale-50000.xlsx');const parseMs=performance.now()-start;start=performance.now();await h.analyze(xp);perf.push({n:50000,format:'xlsx',parseMs:Math.round(parseMs),analyzeMs:Math.round(performance.now()-start),ui:await h.state(xp),observed:await xp.evaluate(()=>({overview:window.__qa.analysis.overview,report:window.__qa.analysis.cleaningReport}))});await xc.close();h.write('performance',perf);
  await browser.close();console.log(JSON.stringify({featureChecks:checks.length,failed:checks.filter(c=>c.status==='FAIL'),perfRuns:perf.length},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
