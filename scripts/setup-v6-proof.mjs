import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

const manifest = resolve('scripts/v6-proof-prover/Cargo.toml');
execFileSync('cargo', ['build', '--locked', '--manifest-path', manifest], {stdio: 'inherit'});
