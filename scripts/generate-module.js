/* eslint-disable no-undef */
// scripts/generate-module.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module-এ __dirname তৈরি করা
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// টার্মিনাল কমান্ড থেকে মডিউলের নাম নেওয়া
const moduleName = process.argv[2];

if (!moduleName) {
  console.error('\x1b[31mError: Please provide a module name. (Example: npm run g user)\x1b[0m');
  process.exit(1);
}

const name = moduleName.toLowerCase();

// পাথ সেট করা (scripts থেকে বের হয়ে root/src/modules ডিরেক্টরিতে যাওয়া)
const modulesDirPath = path.join(__dirname, '..', 'src', 'modules');
const targetDirPath = path.join(modulesDirPath, name);
const dtoDirPath = path.join(targetDirPath, 'dtos');

// গুরুত্বপূর্ণ চেক: মডিউল ফোল্ডারটি আগে থেকেই আছে কিনা
if (fs.existsSync(targetDirPath)) {
  console.error(`\n\x1b[31m✕ Error: Module "${name}" already exists! Operation aborted.\x1b[0m\n`);
  process.exit(1);
}

const files = [
  {
    path: path.join(targetDirPath, `${name}.routes.ts`),
    content: `import { Router } from 'express';\n\nconst router = Router();\n\nexport const ${name}Routes = router;\n`
  },
  {
    path: path.join(targetDirPath, `${name}.controller.ts`),
    content: `import type { Request, Response, NextFunction } from 'express';\n\nexport const ${name}Controller = {\n  // your controller methods here\n};\n`
  },
  {
    path: path.join(targetDirPath, `${name}.service.ts`),
    content: `export const ${name}Service = {\n  // your business logic here\n};\n`
  },
  {
    path: path.join(targetDirPath, `${name}.repository.ts`),
    content: `export const ${name}Repository = {\n  // your database queries here\n};\n`
  },
  {
    path: path.join(dtoDirPath, `create-${name}.dto.ts`),
    content: `import { z } from 'zod';\n\nexport const create${name.charAt(0).toUpperCase() + name.slice(1)}Schema = z.object({\n  // schema properties here\n});\n`
  }
];

try {
  // ১. প্রধান 'src' ফোল্ডার যদি না থাকে (সাধারণত থাকে, তবুও সুরক্ষার জন্য চেক)
  const srcDirPath = path.join(__dirname, '..', 'src');
  if (!fs.existsSync(srcDirPath)) {
    fs.mkdirSync(srcDirPath);
  }

  // ২. প্রধান 'modules' ফোল্ডার না থাকলে তৈরি করা
  if (!fs.existsSync(modulesDirPath)) {
    fs.mkdirSync(modulesDirPath);
  }

  // ৩. নতুন মডিউল ফোল্ডার এবং ডিটিও ফোল্ডার তৈরি করা
  fs.mkdirSync(targetDirPath);
  fs.mkdirSync(dtoDirPath);

  // ৪. ফাইলগুলো তৈরি করা
  files.forEach((file) => {
    fs.writeFileSync(file.path, file.content, 'utf8');
    console.log(`\x1b[32mCreated:\x1b[0m ${path.relative(path.join(__dirname, '..'), file.path)}`);
  });

  console.log(`\n\x1b[32m✔ Module "${name}" generated successfully inside "src/modules"!\x1b[0m\n`);

} catch (error) {
  console.error('\x1b[31mAn error occurred while generating the module:\x1b[0m', error);
}