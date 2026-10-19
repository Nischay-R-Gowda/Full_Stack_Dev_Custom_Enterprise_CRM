// Route parity check: confirms every call the frontend API client makes has a
// matching route registered in the Express app. Catches the class of bug where
// a UI button silently 404s because the endpoint was renamed.
const fs = require('fs')
const path = require('path')

const serverSrc = fs.readFileSync('server/server.js', 'utf8')
const mounts = [...serverSrc.matchAll(/app\.use\(\s*(['"])([^'"]+)\1\s*,\s*(\w+)\s*\)/g)].map(m => [m[2], m[3]])

const routeDir = 'server/routes'
const files = fs.readdirSync(routeDir)
const serverRoutes = []

for (const [base, mod] of mounts) {
  const stem = mod.replace(/Routes$/, '')
  const match = files.find(x => x === stem + '.js' || x === stem + 's.js')
  if (!match) { console.log('  !! unresolved import: ' + mod); continue }
  const src = fs.readFileSync(path.join(routeDir, match), 'utf8')
  // Groups are: 1 = verb, 2 = opening quote, 3 = the path itself.
  for (const [, verb, , p] of src.matchAll(/router\.(get|post|put|patch|delete)\(\s*(['"])([^'"]*)\2/g)) {
    serverRoutes.push({
      method: verb.toUpperCase(),
      path: base + (p === '/' ? '' : p).replace(/:\w+/g, ':id'),
      file: match,
    })
  }
}

console.log('Server routes: ' + serverRoutes.length)

const apiSrc = fs.readFileSync('src/services/api.js', 'utf8')
const calls = []
// apiRequest calls use both backticks (for interpolation) and single quotes
// (for static paths), so both quote styles must be matched.
const callRe = /apiRequest\(\s*(`[^`]*`|'[^']*'|"[^"]*")\s*(?:,\s*\{\s*method:\s*'(\w+)')?/g
for (const [, rawPath, method] of apiSrc.matchAll(callRe)) {
  const endpoint = rawPath.slice(1, -1)
  // Drop the query string: getContacts builds `/contacts?search=x`, and the
  // route it targets is just `/contacts`.
  const path = endpoint.split('?')[0].replace(/\$\{[^}]+\}/g, ':id')
  calls.push([path, (method || 'GET').toUpperCase()])
}

const uniq = [...new Map(calls.map(c => [c[1] + ' ' + c[0], c])).values()]
// The client builds URLs as `${API_BASE}${endpoint}` with API_BASE = '/api',
// so the endpoint strings it holds are relative to that prefix.
const clientRoutes = uniq.map(([p, m]) => [m, '/api' + p])
console.log('Frontend calls: ' + clientRoutes.length + '\n')

let orphan = 0
for (const [m, p] of clientRoutes) {
  const found = serverRoutes.find(r => r.method === m && r.path === p)
  if (found) console.log('  OK      ' + m.padEnd(6) + p.padEnd(32) + ' -> ' + found.file)
  else { orphan++; console.log('  MISSING ' + m.padEnd(6) + p) }
}

console.log('\n' + (orphan === 0
  ? 'OK: every frontend call maps to a real server route.'
  : orphan + ' frontend call(s) with no server route.'))
