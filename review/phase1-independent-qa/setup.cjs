const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const qa = __dirname;
const root = path.resolve(qa, '../..');
const hash = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function inventory(dir, relative = '', skip = []) {
  const out = {};
  for (const item of fs.readdirSync(dir, {withFileTypes:true})) {
    if (!relative && skip.includes(item.name)) continue;
    const rel = path.join(relative, item.name);
    const absolute = path.join(dir, item.name);
    if (item.isDirectory()) Object.assign(out, inventory(absolute, rel));
    else if (item.isFile()) out[rel] = hash(absolute);
  }
  return out;
}
if (fs.existsSync(path.join(qa, 'evidence/baseline.json'))) throw new Error('Existing QA run: do not overwrite baseline.');
for (const name of ['project','fixtures','evidence','screenshots','logs','oracle','tmp','npm-cache','downloads']) fs.mkdirSync(path.join(qa,name),{recursive:true});
const before = inventory(root, '', ['review','node_modules','.git']);
const oldReview = inventory(path.join(root,'review'), '', ['phase1-independent-qa','project','node_modules','npm-cache','tmp']);
fs.writeFileSync(path.join(qa,'evidence/baseline.json'),JSON.stringify({root, before, oldReview}, null,2));
for (const item of fs.readdirSync(root, {withFileTypes:true})) {
  if (['review','node_modules','dist','artifacts','test-results','.git'].includes(item.name)) continue;
  fs.cpSync(path.join(root,item.name),path.join(qa,'project',item.name),{recursive:true});
}
fs.cpSync(path.join(root,'review/data'),path.join(qa,'project/review/data'),{recursive:true});
const diffs=[];
for(const name of Object.keys(before)) {
  const prev=path.join(root,'review/project',name), current=path.join(root,name);
  if (!fs.existsSync(prev) || !fs.statSync(prev).isFile()) { if(name.startsWith('src')||name.startsWith('tests')) diffs.push({name,status:'new-relative-to-old-QA-snapshot'}); continue; }
  if(hash(prev) !== before[name]) {
    const isText=/\.(ts|tsx|json|css|html|md|js)$/.test(name);
    diffs.push({name,status:'changed-relative-to-old-QA-snapshot',beforeHash:hash(prev),afterHash:before[name]});
    if(isText) {
      const diff=spawnSync('git',['diff','--no-index','--',prev,current],{encoding:'utf8',windowsHide:true});
      fs.writeFileSync(path.join(qa,'evidence',name.replace(/[\\/]/g,'_')+'.diff'),diff.stdout||diff.stderr||'');
    }
  }
}
fs.writeFileSync(path.join(qa,'evidence/snapshot-diffs.json'),JSON.stringify(diffs,null,2));
fs.cpSync('C:/Users/Admin/.codex/attachments/13ebcec0-9d22-4a66-b790-73d56bba57e3/Pasted text.txt',path.join(qa,'evidence/task-prompt.txt'));
console.log(JSON.stringify({rootFiles:Object.keys(before).length,protectedReviewFiles:Object.keys(oldReview).length,changes:diffs},null,2));
