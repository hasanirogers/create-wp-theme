#!/usr/bin/env node

import { intro, outro, text, select, multiselect, confirm, isCancel } from '@clack/prompts';
import { execa } from 'execa';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, realpathSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface TemplateVars {
  [key: string]: string | boolean;
}

function sanitizeString(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '_') // Convert spaces to underscores
    .replace(/-+/g, '_') // Replace multiple hyphens with single underscore
    .replace(/^-|-$/g, ''); // Remove leading and trailing hyphens
}

interface PromptConfig {
  name: string;
  type: 'text' | 'select' | 'multiselect' | 'confirm';
  message: string;
  options?: string[];
  default?: string | boolean;
}

async function loadTemplateConfig(templatePath: string): Promise<{ prompts: PromptConfig[] }> {
  const configPath = join(templatePath, 'template.json');

  if (!existsSync(configPath)) {
    return { prompts: [] };
  }

  try {
    const configContent = readFileSync(configPath, 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    console.error('Error loading template config:', error);
    return { prompts: [] };
  }
}

async function collectUserInputs(prompts: PromptConfig[]): Promise<TemplateVars> {
  const vars: TemplateVars = {};

  for (const prompt of prompts) {
    let response: any;

    switch (prompt.type) {
      case 'text':
        response = await text({
          message: prompt.message,
          defaultValue: prompt.default as string || '',
        });
        break;

      case 'select':
        response = await select({
          message: prompt.message,
          options: (prompt.options || []).map(opt => ({ value: opt, label: opt })),
          initialValue: prompt.default as string || prompt.options?.[0],
        });
        break;

      case 'multiselect':
        response = await multiselect({
          message: prompt.message,
          options: (prompt.options || []).map(opt => ({ value: opt, label: opt })),
          initialValues: Array.isArray(prompt.default) ? prompt.default as string[] : [],
        });
        break;

      case 'confirm':
        response = await confirm({
          message: prompt.message,
          initialValue: prompt.default as boolean || false,
        });
        break;
    }

    if (isCancel(response)) {
      outro('Operation cancelled.');
      process.exit(0);
    }

    vars[prompt.name] = response;
  }

  return vars;
}

function replaceTemplateVariables(content: string, vars: TemplateVars): string {
  let result = content;

  for (const [key, value] of Object.entries(vars)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), String(value));
  }

  return result;
}

function processTemplateFile(templatePath: string, outputPath: string, vars: TemplateVars): void {
  const content = readFileSync(templatePath, 'utf-8');
  const processedContent = replaceTemplateVariables(content, vars);

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, processedContent);
}

function processTemplateDirectory(templatePath: string, outputPath: string, vars: TemplateVars): void {
  const items = readdirSync(templatePath);

  for (const item of items) {
    const itemPath = join(templatePath, item);
    const itemStat = statSync(itemPath);

    if (itemStat.isDirectory()) {
      const processedDirName = replaceTemplateVariables(item, vars);
      const newOutputPath = join(outputPath, processedDirName);
      processTemplateDirectory(itemPath, newOutputPath, vars);
    } else if (itemStat.isFile()) {
      const processedFileName = replaceTemplateVariables(item, vars);
      const newOutputPath = join(outputPath, processedFileName);
      processTemplateFile(itemPath, newOutputPath, vars);
    }
  }
}

async function main() {
  // Check if we're in a TTY environment
  const isTTY = process.stdout.isTTY && process.stdin.isTTY;

  if (!isTTY) {
    console.log('🚀 Create Wordpress Themes');
    console.log('⚠️  Interactive prompts require a TTY. Use these alternatives:');
    console.log('');
    console.log('1. From project directory: npm run test:cli');
    console.log('2. From anywhere: npx create-wp-app@latest');
    console.log('3. Direct: node /path/to/create-wp-app/dist/index.js');
    console.log('');
    console.log('For testing, navigate to the project directory and run:');
    console.log(`cd ${dirname(__dirname)} && npm run test:cli`);
    process.exit(0);
  }

  intro('🚀 Create Wordpress Theme');

  const rawThemeSlug = await text({
    message: 'How will you uniquely identify this theme?',
    defaultValue: 'my-wp-theme'
  });

  if (isCancel(rawThemeSlug)) {
    outro('Operation cancelled.');
    process.exit(0);
  }

  const themeSlug = sanitizeString(String(rawThemeSlug));

  const themeName = await text({
    message: 'What is the name of this theme?',
    defaultValue: 'My WP Theme'
  });

  const templateOptions = [
    { value: process.env.CREATE_WP_APP_TEMPLATES_DIR ? join(process.env.CREATE_WP_APP_TEMPLATES_DIR, 'pagelock') : join(__dirname, '../templates/pagelock'), label: 'PageLock: Simple one page site that locks on each section' },
    { value: process.env.CREATE_WP_APP_TEMPLATES_DIR ? join(process.env.CREATE_WP_APP_TEMPLATES_DIR, 'frontier') : join(__dirname, '../templates/frontier'), label: 'Frontier: Lasz WooCommerce API' },
  ];

  const selectedTemplate = await select({
    message: 'Choose a template',
    options: templateOptions,
  });

  if (isCancel(selectedTemplate)) {
    outro('Operation cancelled.');
    process.exit(0);
  }

  const templateDir = selectedTemplate;
  const outputPath = `./${String(themeSlug)}`;


  if (isCancel(outputPath)) {
    outro('Operation cancelled.');
    process.exit(0);
  }

  if (!existsSync(templateDir)) {
    console.error(`❌ Template directory not found: ${templateDir}`);
    process.exit(1);
  }

  if (existsSync(outputPath)) {
    const overwrite = await confirm({
      message: `Output directory exists. Overwrite?`,
      initialValue: false,
    });

    if (isCancel(overwrite) || !overwrite) {
      outro('Operation cancelled.');
      process.exit(0);
    }
  }

  const templateConfig = await loadTemplateConfig(templateDir);

  if (templateConfig.prompts.length > 0) {
    console.log('\n📝 Please provide the following information:');
  }

  const vars = await collectUserInputs(templateConfig.prompts);

  vars.themeSlug = String(themeSlug);
  vars.themeName = String(themeName);

  console.log(`\n🔨 Creating app from template: ${templateDir}`);
  console.log(`📁 Output directory: ${outputPath}`);

  try {
    processTemplateDirectory(templateDir, outputPath, vars);

    console.log('✅ App created successfully!');

    if (existsSync(join(outputPath, 'package.json'))) {
      const installDeps = await confirm({
        message: 'Install dependencies?',
        initialValue: true,
      });

      if (installDeps && !isCancel(installDeps)) {
        console.log('📦 Installing dependencies...');
        await execa('npm', ['install'], { cwd: outputPath });
        console.log('✅ Dependencies installed!');
      }
    }

    outro(`🎉 Your app is ready at: ${outputPath}`);

  } catch (error) {
    console.error('❌ Error creating app:', error);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  main().catch(console.error);
}
