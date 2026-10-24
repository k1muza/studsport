import { readFileSync } from 'node:fs';
import { inspectModels } from './model-validation.mjs';
const models = JSON.parse(readFileSync(new URL('../src/data/part-models.json', import.meta.url),'utf8'));
const issues = inspectModels(models);
if (issues.length) {console.error(issues.join('\\n'));process.exitCode=1;}
else console.log(`Validated ${models.models.length} JSON-driven model specifications (geometry only; not verified fitment).`);
