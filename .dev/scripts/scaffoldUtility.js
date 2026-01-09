
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../');
const COMP_DIR = path.join(ROOT_DIR, 'components');
const PAGE_DIR = path.join(ROOT_DIR, 'pages');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// --- Commands ---

function scaffoldComponent(args) {
    if (!args[0]) {
        console.error("❌ Error: Component name required (e.g. 'Button' or 'ui/Button')");
        return;
    }

    const parts = args[0].split('/');
    const name = parts.pop();
    const subPath = parts.join('/');

    const targetDir = path.join(COMP_DIR, subPath);
    ensureDir(targetDir);

    const targetFile = path.join(targetDir, `${name}.vue`);

    if (fs.existsSync(targetFile)) {
        console.error(`❌ Error: Component ${name} already exists at ${targetFile}`);
        return;
    }

    const content = `<script setup lang="ts">
// Props & Emits
// const props = defineProps<{}>()
</script>

<template>
  <div>
    ${name} Component
  </div>
</template>
`;
    fs.writeFileSync(targetFile, content);
    console.log(`\n✅ Created component: components/${subPath ? subPath + '/' : ''}${name}.vue\n`);
}

function scaffoldPage(args) {
    if (!args[0]) {
        console.error("❌ Error: Page route required (e.g. 'about' or 'admin/settings')");
        return;
    }

    const route = args[0];
    const targetFile = path.join(PAGE_DIR, `${route}.vue`);
    const targetDir = path.dirname(targetFile);

    ensureDir(targetDir);

    if (fs.existsSync(targetFile)) {
        console.error(`❌ Error: Page already exists at ${targetFile}`);
        return;
    }

    const name = route.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const content = `<script setup lang="ts">
useHead({
  title: '${name}'
})
</script>

<template>
  <div class="max-w-4xl mx-auto py-12">
    <h1 class="font-serif text-3xl mb-8">${name}</h1>
    <!-- Content -->
  </div>
</template>
`;
    fs.writeFileSync(targetFile, content);
    console.log(`\n✅ Created page: pages/${route}.vue\n`);
}

function cleanProject() {
    const dirsToRemove = ['.nuxt', '.output', 'node_modules/.cache'];

    console.log("\n🧹 Cleaning project caches...");

    dirsToRemove.forEach(d => {
        const fullPath = path.join(ROOT_DIR, d);
        if (fs.existsSync(fullPath)) {
            try {
                fs.rmSync(fullPath, { recursive: true, force: true });
                console.log(`   Removed ${d}`);
            } catch (e) {
                console.error(`   Failed to remove ${d}: ${e.message}`);
            }
        }
    });
    console.log("\n✅ Clean complete.\n");
}

const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
    case 'component':
        scaffoldComponent(args);
        break;
    case 'page':
        scaffoldPage(args);
        break;
    case 'clean':
        cleanProject();
        break;
    default:
        console.log('\nUsage: node .dev/scripts/scaffoldUtility.js [command] [args]');
        console.log('Commands:');
        console.log('  component <path>     Create a new Vue component (e.g., ui/Button)');
        console.log('  page <route>         Create a new Vue page (e.g., admin/logs)');
        console.log('  clean                Remove .nuxt, .output, and cache folders\n');
}
