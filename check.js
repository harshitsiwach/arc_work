const fs = require('fs');
const text = fs.readFileSync('app/dashboard/bridge/page.tsx', 'utf8');

let lines = text.split('\n');
let parenCount = 0;
let lastLines = [];

for (let l = 0; l < lines.length; l++) {
  let line = lines[l];
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '(') {
      parenCount++;
      lastLines.push(l + 1);
    }
    if (line[i] === ')') {
      parenCount--;
      lastLines.pop();
    }
    if (parenCount < 0) {
      console.log('Unmatched ) at line', l + 1);
      parenCount = 0;
    }
  }
}

if (parenCount > 0) {
  console.log('Unmatched ( starts at lines:', lastLines);
} else {
  console.log('Parens are balanced.');
}

let braceCount = 0;
let lastBraceLines = [];
for (let l = 0; l < lines.length; l++) {
  let line = lines[l];
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '{') { braceCount++; lastBraceLines.push(l + 1); }
    if (line[i] === '}') { braceCount--; lastBraceLines.pop(); }
    if (braceCount < 0) {
      console.log('Unmatched } at line', l + 1);
      braceCount = 0;
    }
  }
}
if (braceCount > 0) {
  console.log('Unmatched { starts at lines:', lastBraceLines);
} else {
  console.log('Braces are balanced.');
}
