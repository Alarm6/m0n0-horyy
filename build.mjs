import {readFileSync, writeFileSync, copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const write = (path, contents) => writeFileSync(new URL(path, import.meta.url), contents);
const css = read('font-faces.css') + '\n' + read('dist/style.css').replace(/@import\s+url\([^)]*\)\s*;/g, '') + '\n' + read('dist/visuals.css') + '\n' + read('dist/story.css');
const js = read('dist/app.js') + '\n' + read('dist/bottle-interaction.js');
const hash = contents => createHash('sha256').update(contents).digest('hex').slice(0, 10);
const cssName = `site-${hash(css)}.css`;
const jsName = `site-${hash(js)}.js`;
write(`dist/${cssName}`, css);
write(`dist/${jsName}`, js);
write('dist/index.html', read('dist/index.html').replace(/site-[a-z0-9]+\.css/g, cssName).replace(/site-[a-z0-9]+\.js/g, jsName));
copyFileSync(new URL('source-assets/Manrope-OFL.txt', import.meta.url), new URL('dist/assets/Manrope-OFL.txt', import.meta.url));
console.log(JSON.stringify({css:cssName, js:jsName}));
