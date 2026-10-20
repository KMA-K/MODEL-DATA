const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
for(const dir of ['project','screenshots','logs','data','downloads','evidence','tmp','npm-cache'])fs.mkdirSync(path.join(__dirname,dir),{recursive:true});
function hashes(dir,relative=''){const result={};for(const item of fs.readdirSync(dir,{withFileTypes:true})){if(!relative&&['review','node_modules'].includes(item.name))continue;const rel=path.join(relative,item.name),absolute=path.join(dir,item.name);if(item.isDirectory())Object.assign(result,hashes(absolute,rel));else if(item.isFile())result[rel]=crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');}return result;}
fs.writeFileSync(path.join(__dirname,'evidence','original-hashes.json'),JSON.stringify(hashes(root),null,2));
for(const name of ['src','public','scripts','tests','index.html','package.json','package-lock.json','vite.config.ts','tsconfig.json','tsconfig.app.json','tsconfig.node.json','playwright.config.ts','.oxlintrc.json','.gitignore'])fs.cpSync(path.join(root,name),path.join(__dirname,'project',name),{recursive:true});
console.log('Snapshot copied; original hashes saved.');
