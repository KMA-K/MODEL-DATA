const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const [label,...parts]=process.argv.slice(2),command=parts.join(' '),started=Date.now();
const log=fs.createWriteStream(path.join(__dirname,'logs',label+'.log'));
log.write('COMMAND: '+command+'\n');
const env={...process.env,TMP:path.join(__dirname,'tmp'),TEMP:path.join(__dirname,'tmp'),npm_config_cache:path.join(__dirname,'npm-cache'),npm_config_logs_dir:path.join(__dirname,'logs'),NO_COLOR:'1'};
const child=spawn('cmd.exe',['/d','/s','/c',command],{cwd:path.join(__dirname,'project'),env,windowsHide:true});
for(const stream of [child.stdout,child.stderr])stream.on('data',data=>{log.write(data);process.stdout.write(data);});
child.on('error',error=>{log.write(String(error));console.error(error);});
child.on('close',code=>{const result={label,command,exitCode:code,durationMs:Date.now()-started};log.end('\nRESULT: '+JSON.stringify(result)+'\n');fs.writeFileSync(path.join(__dirname,'logs',label+'.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));process.exitCode=code||0;});
