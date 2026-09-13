const fs = require('fs');

const { execSync } = require('child_process');
const files = execSync('find frontend/src -name "*.tsx"').toString().trim().split('\n');

let changes = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace <td>{something with monto, total, id, precio, costo, fecha, cedula, telefono, numero}</td>
  // using a regex that captures <td> and its content
  content = content.replace(/<td([^>]*)>\s*\{([^}]*(monto|total|id|precio|costo|fecha|cedula|telefono|numero|cantidad|stock|edad)[^}]*)\}\s*<\/td>/gi, (match, p1, p2) => {
    if (p1.includes('className')) {
      if (!p1.includes('table-mono')) {
        return `<td${p1.replace('className="', 'className="table-mono ')}>{${p2}}</td>`;
      }
      return match;
    }
    return `<td${p1} className="table-mono">{${p2}}</td>`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    changes++;
  }
}
console.log(`Updated ${changes} files with table-mono`);
