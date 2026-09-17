const Diff = require('diff');
const patch = Diff.createTwoFilesPatch('App.tsx', 'App.tsx', 'const a = 1;\n', 'const a = 2;\n');
console.log(patch);
