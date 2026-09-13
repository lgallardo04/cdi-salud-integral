const fs = require('fs');
let css = fs.readFileSync('frontend/src/index.css', 'utf8');

css = css.replace(/\.btn-secondary \{([\s\S]*?)\}/, '.btn-secondary {\n  background-color: transparent;\n  border-color: var(--color-primary);\n  color: var(--color-primary);\n}');

fs.writeFileSync('frontend/src/index.css', css);
console.log('btn-secondary updated');
