const fs = require('fs');
let css = fs.readFileSync('frontend/src/index.css', 'utf8');

// 1. Change border-radius: var(--radius-md); to var(--radius-xs); for .btn and inputs
css = css.replace(/\.btn \{([\s\S]*?)border-radius:\s*var\(--radius-md\);([\s\S]*?)\}/, '.btn {$1border-radius: var(--radius-xs);$2}');
css = css.replace(/\.form-input,\s*\.form-select,\s*\.form-textarea\s*\{([\s\S]*?)border-radius:\s*var\(--radius-md\);([\s\S]*?)\}/, '.form-input, .form-select, .form-textarea {$1border-radius: var(--radius-xs);$2}');

// 2. Add .label-caps
if (!css.includes('.label-caps')) {
  css += `\n
/* ==========================================================================
   STITCH TYPOGRAPHY OVERRIDES
   ========================================================================== */
.label-caps {
  font-family: var(--font-sans);
  font-size: 0.75rem; /* 12px */
  font-weight: 700;
  line-height: 16px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.table-container {
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
}
`;
}

fs.writeFileSync('frontend/src/index.css', css);
console.log('CSS updated');
