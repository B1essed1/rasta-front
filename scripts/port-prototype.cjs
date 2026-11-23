// One-time port of the prototype (../prototype/src) into src/proto/ as ES modules.
//
// The prototype's files were classic <script type="text/babel"> tags sharing one global scope:
// every top-level function/const of one file was visible to all later files. Each module keeps its
// code byte-for-byte and gets one appended line that publishes its top-level names on `window`,
// which reproduces that scope. src/proto/index.js imports the files in the prototype's load order.
//
// It also reports the patterns this cannot reproduce (a file assigning to another file's top-level
// variable, or a top-level `let` reassigned after load) so they can be fixed by hand.
//
// Usage: node scripts/port-prototype.cjs [--force]   (refuses to overwrite src/proto/ without --force)
const fs = require('fs'), path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const FRONT = path.join(__dirname, '..');
const PROTO = path.join(FRONT, '..', 'prototype', 'src');
const OUT = path.join(FRONT, 'src', 'proto');

// load order of ../prototype/index.html, minus prototype-only tooling
const SKIP = new Set(['tweaks-panel.jsx', 'Tweaks.jsx']);
const ORDER = [...fs.readFileSync(path.join(PROTO, '..', 'index.html'), 'utf8').matchAll(/<script[^>]*src="src\/([^"]+)"/g)]
  .map(m => m[1]).filter(f => !SKIP.has(f));
const CSS = [...fs.readFileSync(path.join(PROTO, '..', 'index.html'), 'utf8').matchAll(/href="src\/css\/([^"]+)"/g)].map(m => m[1]);

if (fs.existsSync(OUT) && !process.argv.includes('--force')) {
  console.error('src/proto/ exists — files there may have been edited since the port. Use --force to overwrite.');
  process.exit(1);
}
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const parseFile = src => parse(src, { sourceType: 'script', plugins: ['jsx'], errorRecovery: false });
const declared = {};   // file -> Set of top-level names
const asts = {};
for (const f of ORDER) {
  const src = fs.readFileSync(path.join(PROTO, f), 'utf8');
  const ast = parseFile(src);
  asts[f] = { ast, src };
  const names = new Set();
  for (const n of ast.program.body) {
    if ((n.type === 'FunctionDeclaration' || n.type === 'ClassDeclaration') && n.id) names.add(n.id.name);
    if (n.type === 'VariableDeclaration') n.declarations.forEach(d => collectIds(d.id, names));
  }
  declared[f] = names;
}
function collectIds(node, out) {
  if (!node) return;
  if (node.type === 'Identifier') out.add(node.name);
  else if (node.type === 'ObjectPattern') node.properties.forEach(p => collectIds(p.value || p.argument, out));
  else if (node.type === 'ArrayPattern') node.elements.forEach(e => collectIds(e, out));
  else if (node.type === 'RestElement') collectIds(node.argument, out);
  else if (node.type === 'AssignmentPattern') collectIds(node.left, out);
}

const owner = {};
for (const f of ORDER) for (const n of declared[f]) owner[n] = f;   // later file wins, as in the prototype

const warnings = [];
for (const f of ORDER) {
  const { ast, src } = asts[f];
  traverse(ast, {
    AssignmentExpression(p) { check(p, p.node.left); },
    UpdateExpression(p) { check(p, p.node.argument); },
  });
  function check(p, left) {
    if (left.type !== 'Identifier') return;
    const name = left.name;
    const binding = p.scope.getBinding(name);
    const line = left.loc.start.line;
    if (!binding) {
      if (owner[name]) warnings.push(`${f}:${line} assigns to ${name}, a top-level variable of ${owner[name]} — the module copy will not see it`);
      else warnings.push(`${f}:${line} assigns to undeclared ${name} — throws in strict-mode modules`);
    } else if (binding.scope.block.type === 'Program' && binding.kind !== 'hoisted' && binding.kind !== 'module'
      && [...Object.keys(declared)].some(o => o !== f && usesName(o, name))) {
      warnings.push(`${f}:${line} reassigns top-level ${name}, which other files read through window — they keep the old value`);
    }
  }
}
function usesName(file, name) {
  if (declared[file].has(name)) return false;
  return new RegExp(`\\b${name}\\b`).test(asts[file].src);
}

for (const f of ORDER) {
  const names = [...declared[f]];
  const tail = names.length
    ? `\n\n// ---- port: publish top-level names, as the classic <script> did ----\nObject.assign(window, { ${names.join(', ')} });\n`
    : '\n';
  const out = f.endsWith('.js') && !f.endsWith('.jsx') ? f : f;
  fs.writeFileSync(path.join(OUT, out), asts[f].src.replace(/\s*$/, '') + tail);
}

// CSS + assets (fonts referenced as ../assets/fonts/… from css/)
fs.cpSync(path.join(PROTO, 'css'), path.join(OUT, 'css'), { recursive: true });
fs.cpSync(path.join(PROTO, 'assets'), path.join(OUT, 'assets'), { recursive: true });

fs.writeFileSync(path.join(OUT, 'index.js'),
  `// Prototype modules in the prototype's load order (later files override earlier globals, as before).\n` +
  `import '../protoGlobals.js';\n` +
  CSS.map(c => `import './css/${c}';`).join('\n') + '\n' +
  ORDER.map(f => `import './${f}';`).join('\n') + '\n');

console.log(`${ORDER.length} modules, ${CSS.length} css → src/proto/`);
console.log(warnings.length ? 'Needs a look:\n  ' + warnings.join('\n  ') : 'No cross-file assignments found.');
