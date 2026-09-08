import {copyFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const dir='.cache/upstream/silverscript';
await mkdir(dir+'/silverscript-lang/src/bin',{recursive:true});
await copyFile('scripts/v6-vm-check.rs',dir+'/silverscript-lang/src/bin/ke-v6-vm.rs');
execFileSync('cargo',['build','--locked','-p','silverscript-lang','--bin','ke-v6-vm'],{cwd:dir,stdio:'inherit'});
