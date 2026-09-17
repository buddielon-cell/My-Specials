const Diff = require('diff');
const diffStr = `@@ -1,5 +1,5 @@\n- const execute = () => {\n+ const execute = async () => {\n@@ -10,3 +10,4 @@\n- return data;\n+ if (!data) throw new Error('Invalid data');\n+ return data;`;
const parsed = Diff.parsePatch(diffStr);
console.log(JSON.stringify(parsed, null, 2));
