import { readFileSync, writeFileSync } from 'node:fs'

import CleanCSS from 'clean-css'

const sourceFiles = [
  'assets/css/font-awesome.min.css',
  'assets/css/vendor/normalize.css',
  'assets/css/vendor/foundation.min.css',
  'assets/css/vendor/nprogress.css',
  'assets/css/style.css',
  'assets/css/post.css',
]

const sources = Object.fromEntries(sourceFiles.map(file => [
  file,
  { styles: readFileSync(file, 'utf8') },
]))

const result = new CleanCSS({ rebaseTo: 'assets/css' }).minify(sources)

if (result.errors.length > 0) {
  throw new Error(result.errors.join('\n'))
}

for (const warning of result.warnings) {
  console.warn(warning)
}

writeFileSync('assets/css/site.min.css', `${result.styles}\n`)
