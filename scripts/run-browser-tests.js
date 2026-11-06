import { spawnSync } from 'node:child_process';
const npm=process.platform==='win32'?'npm.cmd':'npm';
const build=spawnSync(npm,['run','build'],{stdio:'inherit',env:{...process.env,VITE_FIREBASE_ENABLED:'false',FORM_ROAR_DIST:'dist-test'}});
if(build.status!==0)process.exit(build.status??1);
const test=spawnSync(process.execPath,['node_modules/@playwright/test/cli.js','test',...process.argv.slice(2)],{stdio:'inherit',env:process.env});
process.exit(test.status??1);
