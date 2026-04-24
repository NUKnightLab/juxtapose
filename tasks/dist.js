const fs = require('node:fs');
const path = require('path');
const UglifyJS = require('uglify-js');

const pkg = require('../package.json');
const today = new Date().toISOString().slice(0, 10);
const currentYear = new Date().getFullYear();

const banner = `/* juxtapose - v${pkg.version} - ${today}
 * Copyright (c) 2015-${currentYear} Alex Duner and Northwestern University Knight Lab
 */\n`;

if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
}
fs.cpSync('juxtapose', 'dist', { recursive: true });

const cssPath = 'dist/css/juxtapose.css';
fs.writeFileSync(cssPath, banner + fs.readFileSync(cssPath, 'utf-8'));

const jsPath = 'dist/js/juxtapose.js';
const js = fs.readFileSync(jsPath, 'utf-8');
fs.writeFileSync(jsPath, banner + js);

const minified = UglifyJS.minify(js);
if (minified.error) {
    console.error('Minification failed:', minified.error);
    process.exit(1);
}
fs.writeFileSync('dist/js/juxtapose.min.js', banner + minified.code);

console.log(`dist built: juxtapose v${pkg.version}`);
