import { readFileSync } from 'node:fs';
import { inspectCatalogue } from './catalogue-validation.mjs';
import { inspectModels } from './model-validation.mjs';
const models = JSON.parse(readFileSync(new URL('../src/data/part-models.json', import.meta.url),'utf8'));
const read=name=>JSON.parse(readFileSync(new URL('../src/data/'+name+'.json',import.meta.url),'utf8'));
const issues = [...inspectModels(models),...inspectCatalogue({models:models.models, products:read('products').products,evidence:read('product-evidence').records,sources:read('evidence-sources').sources,procurement:read('procurement-research')})];
if (issues.length) {console.error(issues.join('\n'));process.exitCode=1;}
else console.log(`Validated ${models.models.length} JSON-driven model specifications (geometry only; not verified fitment).`);
