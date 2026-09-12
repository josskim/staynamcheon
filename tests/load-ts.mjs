import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

export function loadTs(relativePath, mocks = {}) {
  const file = new URL(`../${relativePath}`, import.meta.url);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  const nativeRequire = createRequire(file);
  const require = name => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name.startsWith('@/')) throw new Error(`Unmocked application dependency: ${name}`);
    return nativeRequire(name);
  };
  new Function('require', 'module', 'exports', code)(require, module, module.exports);
  return module.exports;
}
