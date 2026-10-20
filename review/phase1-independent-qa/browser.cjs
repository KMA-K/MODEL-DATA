const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('./project/node_modules/playwright');
const {csv,calculate}=require('./oracle/independent.cjs');
const qa=__dirname,base='http://127.0.0.1:5182';
const write=(name,value)=>fs.writeFileSync(path.join(qa,'evidence',name+'.json'),JSON.stringify(value,null,2));
const manifest=JSON.parse(fs.readFileSync(path.join(qa,'fixtures/manifest.json'),'utf8'));
async function setup(browser,width=1366){const context=await browser.newContext({viewport:{width,height:1000},locale:'vi-VN',timezoneId:'Asia/Ho_Chi_Minh',acceptDownloads:true,reducedMotion:'reduce'});
  await context.addInitScript(()=>{
    const NativeWorker=window.Worker;window.__qa={active:0,events:[],analysis:null,parse:null,posts:[]};
    window.Worker=class extends NativeWorker{constructor(...args){super(...args);this.__qaLive=true;window.__qa.active++;this.addEventListener('message',({data:d})=>{if(d.type==='progress')window.__qa.events.push({at:performance.now(),...d.progress});if(d.type==='error')window.__qa.events.push({error:d.message});if(d.type==='result'){if(d.result.overview)window.__qa.analysis=d.result;else window.__qa.parse={totalRows:d.result.totalRows,headers:d.result.headers,fileName:d.result.fileName};}});}postMessage(data,...args){window.__qa.posts.push({at:performance.now(),type:data.type,rows:data.rows?.length,mapping:data.mapping});return super.postMessage(data,...args);}terminate(){if(this.__qaLive){window.__qa.active--;this.__qaLive=false;}return super.terminate();}};
    let last=performance.now();window.__gaps=[];setInterval(()=>{const now=performance.now();window.__gaps.push(now-last);last=now;},25);
  });return context;
}
function monitor(page){const events={errors:[],console:[],requests:[],failed:[]};page.on('pageerror',e=>events.errors.push(e.message));page.on('console',m=>{if(['warning','error'].includes(m.type()))events.console.push({type:m.type(),text:m.text()});});page.on('request',r=>{if(!r.url().startsWith(base))events.requests.push({url:r.url(),method:r.method(),body:r.postData()});});page.on('requestfailed',r=>events.failed.push({url:r.url(),error:r.failure()}));return events;}
async function settle(page){await page.locator('[role=tabpanel] .skeleton').first().waitFor({state:'hidden',timeout:20000}).catch(()=>{});await page.evaluate(async()=>{await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});}
async function snap(page,name,full=true){await settle(page);const file=`screenshots/${name}.png`;await page.screenshot({path:path.join(qa,file),fullPage:full});return file;}
async function state(page){await settle(page);return page.evaluate(()=>({text:document.body.innerText,kpis:[...document.querySelectorAll('.kpi-card')].map(e=>({title:e.querySelector('.kpi-title')?.innerText,value:e.querySelector('.kpi-value')?.innerText,subtitle:e.querySelector('.kpi-subtext')?.innerText})),rows:[...document.querySelectorAll('.data-table tbody tr')].map(r=>[...r.cells].map(c=>c.innerText)),insights:[...document.querySelectorAll('.insight')].map(e=>e.innerText),geometry:{width:innerWidth,scrollWidth:document.documentElement.scrollWidth,scrollX,headingLeft:document.querySelector('h1')?.getBoundingClientRect().left},theme:{...document.documentElement.dataset}}));}
async function open(page){await page.goto(base,{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Chọn file bán hàng',exact:true}).waitFor();}
async function upload(page,file){await page.locator('input[type=file]').setInputFiles(path.join(qa,file));await page.waitForFunction(()=>document.querySelector('.mapping-page')||document.querySelector('[role=alert]'),null,{timeout:90000});}
async function analyze(page){const b=page.getByRole('button',{name:'Khám phá dữ liệu',exact:true});if(!await b.count()||!await b.isEnabled())return false;await b.click();await page.waitForFunction(()=>document.querySelector('[role=tablist]')||document.querySelector('[role=alert]'),null,{timeout:120000});return !!await page.locator('[role=tablist]').count();}
async function tab(page,name){await page.getByRole('tab',{name:new RegExp(name)}).click();await page.locator('[role=tabpanel] .card,[role=tabpanel] .kpi-card').first().waitFor();}
async function exportCsv(page,name){const promise=page.waitForEvent('download');await page.getByRole('button',{name:'Xuất CSV',exact:true}).click();const d=await promise,file='downloads/'+name+'.csv';await d.saveAs(path.join(qa,file));const text=fs.readFileSync(path.join(qa,file),'utf8');return{file,name:d.suggestedFilename(),bom:text.charCodeAt(0)===0xfeff,rows:csv(text)};}
const important=['duplicate-real','order-reused-days','order-raw-internal-collision','order-guest-placeholder-collision','customer-coverage-10','order-none','order-partial','profit-negative','profit-loss-break-even','repeat-six-0'];
if(require.main===module)(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});write('browser-version',{browser:browser.version(),engine:'Microsoft Edge',base,node:process.version});
  const outputs=[];let failures=0;
  for(const width of [1366,768,375]) {
    const ctx=await setup(browser,width),page=await ctx.newPage();const events=monitor(page);
    const cases=width===1366?manifest.filter(m=>m.group!=='scale'&&!m.id.endsWith('-reversed')):important.map(id=>manifest.find(m=>m.id===id));
    for(const m of cases) {
      const record={id:m.id,width,fixture:m.file};
      try {
        await open(page);await upload(page,m.file);
        record.mapping=await page.locator('select').evaluateAll(es=>es.map(e=>({id:e.id,label:e.labels?.[0]?.innerText,value:e.value,options:[...e.options].map(o=>({label:o.label,value:o.value}))})));
        record.policyControls=await page.getByRole('button').allTextContents();
        if(m.id==='duplicate-real')record.mappingScreenshot=await snap(page,`policy-mapping-${width}`);
        if(!await analyze(page)){record.status='BLOCKED';record.input=await state(page);outputs.push(record);write('browser-'+width+'-'+m.id,record);continue;}
        record.overview=await state(page);record.worker=await page.evaluate(()=>({analysis:window.__qa.analysis,parse:window.__qa.parse,active:window.__qa.active,posts:window.__qa.posts}));
        const expected=calculate(m.rows,{truth:m.truth});record.expected={revenue:expected.revenue,orders:expected.orders,aov:expected.aov,repeatRate:expected.repeatRate,uncertain:expected.uncertain};
        record.status=expected.orders===record.worker.analysis.overview.totalOrders&&expected.revenue===record.worker.analysis.overview.totalRevenue?'PASS':'FAIL';
        if(important.includes(m.id))record.overviewScreenshot=await snap(page,`${m.id}-${width}-overview`);
        await page.getByRole('button',{name:'Báo cáo làm sạch',exact:true}).click();await page.locator('dialog .dialog-inner').waitFor();record.report=await page.locator('dialog .dialog-inner').innerText();record.reportControls=await page.locator('dialog').getByRole('button').allTextContents();
        if(m.id.startsWith('duplicate'))record.reportScreenshot=await snap(page,`${m.id}-${width}-report`);
        await page.keyboard.press('Escape');await tab(page,'Sản phẩm');record.products=await state(page);
        if(important.includes(m.id)||m.id.startsWith('profit'))record.productScreenshot=await snap(page,`${m.id}-${width}-products`);
        if(width===1366&&['order-raw-internal-collision','order-guest-placeholder-collision','duplicate-real','profit-negative'].includes(m.id))record.productExport=await exportCsv(page,m.id+'-products');
        await tab(page,'Khách hàng');record.customers=await state(page);
        if(important.includes(m.id)||m.id.startsWith('repeat')||m.id==='order-same-day-uncertain'||m.id==='order-times-uncertain')record.customerScreenshot=await snap(page,`${m.id}-${width}-customers`);
        if(width===1366&&['order-raw-internal-collision','duplicate-real'].includes(m.id))record.customerExport=await exportCsv(page,m.id+'-customers');
        write('browser-'+width+'-'+m.id,record);outputs.push({id:m.id,width,status:record.status,fixture:m.file,evidence:'evidence/browser-'+width+'-'+m.id+'.json'});console.log(`${width} ${m.id}: ${record.status}`);
      }catch(e){failures++;record.error=e.stack;record.status='HARNESS ERROR';write('browser-'+width+'-'+m.id,record);outputs.push(record);console.log('HARNESS ERROR '+m.id+': '+e.message);}
    }
    write('browser-network-'+width,events);await ctx.close();
  }
  // Independent second run for both new core order collisions, using a new context.
  const ctx=await setup(browser),page=await ctx.newPage();
  for(const id of ['order-raw-internal-collision','order-guest-placeholder-collision']) {const m=manifest.find(m=>m.id===id);await open(page);await upload(page,m.file);await analyze(page);const overview=await state(page),ss=await snap(page,id+'-second-overview');await tab(page,'Sản phẩm');const products=await state(page);await tab(page,'Khách hàng');const customers=await state(page);write('repeat-'+id,{overview,products,customers,screenshot:ss,worker:await page.evaluate(()=>window.__qa.analysis)});}
  await ctx.close();
  // Real browser parser regression including old known limits.
  const regctx=await setup(browser),regpage=await regctx.newPage(),reg=[];
  for(const file of ['fixtures/empty.xlsx','fixtures/corrupt.xlsx','fixtures/header-only.xlsx',...['excel-first-normal.xlsx','excel-blanks.xlsx','excel-date-serial.xlsx','legacy.xls','excel-data-second.xlsx','excel-header-row3.xlsx','csv-comma.csv','csv-semicolon.csv','csv-tab.csv','csv-bom.csv','quoted-multiline.csv','special-names.csv','date-invalid.csv','bad-revenue-valid-price.csv','oracle-28.csv'].map(n=>'project/review/data/'+n)]) {await open(regpage);await upload(regpage,file);const input=await state(regpage),ok=await analyze(regpage),output=await state(regpage);const r={file,input,ok,output,worker:await regpage.evaluate(()=>window.__qa.analysis)};if(/invalid|bad-revenue|data-second|header-row3|empty|corrupt/.test(file))r.screenshot=await snap(regpage,'regression-'+path.basename(file));reg.push(r);console.log('REGRESSION '+file+': '+(ok?'dashboard':input.text.includes('Đúng cột')?'mapping/error':'error'));}
  write('browser-regression',reg);await regctx.close();
  write('browser-matrix',outputs);await browser.close();console.log(JSON.stringify({browserCases:outputs.length,harnessErrors:failures}));if(failures)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={qa,base,write,setup,monitor,settle,snap,state,open,upload,analyze,tab,exportCsv};
