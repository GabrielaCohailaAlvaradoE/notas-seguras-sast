import {ESLint} from 'eslint';
import {mkdir, writeFile} from 'node:fs/promises';
const eslint = new ESLint();
await mkdir('reports', {recursive:true});
const summary = {};
for (const [label, directory] of [['before','examples/vulnerable'],['after','app']]) {
  const results = JSON.parse(JSON.stringify(await eslint.lintFiles([directory])));
  for (const result of results) result.filePath = result.filePath.replaceAll('\\','/').replace(process.cwd().replaceAll('\\','/')+'/', '');
  await writeFile('reports/eslint-'+label+'.json', JSON.stringify(results,null,2));
  summary[label] = results.reduce((sum,result) => sum + result.errorCount + result.warningCount,0);
}
console.log(JSON.stringify(summary));
if (summary.before !== 3 || summary.after !== 0) process.exitCode = 1;
