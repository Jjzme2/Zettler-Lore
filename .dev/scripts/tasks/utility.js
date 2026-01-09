
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Task } from './obj.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../../');
const AI_DIR = path.join(ROOT_DIR, '.AI');
const TASKS_DIR = path.join(AI_DIR, 'tasks');

// Ensure TASKS directory exists
if (!fs.existsSync(TASKS_DIR)) {
    fs.mkdirSync(TASKS_DIR, { recursive: true });
}

function getFormattedDate() {
    const d = new Date();
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const year = d.getFullYear().toString().slice(-2);
    // Format: M D YY (e.g., 1826 for Jan 8, 2026)
    return `${month}${date}${year}`;
}

const CONFIG_PATH = path.join(__dirname, 'config.json');

function getConfig() {
    if (fs.existsSync(CONFIG_PATH)) {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    }
    // Default config
    return {
        config: {
            rules: ["Hug additional notes from the AI with '<<<Note>>>'."],
            includeTimestamp: true,
            defaultCollection: "New Tasks"
        }
    };
}

function saveConfig(fullConfig) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(fullConfig, null, 2));
}

function createTaskList() {
    const dateStr = getFormattedDate();
    let files = [];
    try {
        files = fs.readdirSync(TASKS_DIR);
    } catch (e) {
        console.error("Error reading .AI directory:", e);
        return;
    }

    const todayPattern = new RegExp(`TaskList_${dateStr}_(\\d+)\\.md`);
    let maxPart = 0;
    files.forEach(file => {
        const match = file.match(todayPattern);
        if (match) {
            const part = parseInt(match[1], 10);
            if (part > maxPart) maxPart = part;
        }
    });

    const newPart = String(maxPart + 1).padStart(2, '0');
    const fileName = `TaskList_${dateStr}_${newPart}.md`;
    const filePath = path.join(TASKS_DIR, fileName);

    const fullConfig = getConfig();
    const rules = fullConfig.config.rules || [];
    const rulesString = rules.map((r, i) => `    ${i + 1}. ${r}`).join('\n');

    const content = `# TaskList ${new Date().toLocaleDateString()} Part ${parseInt(newPart)}

## Rules
${rulesString}

## Tasks

### [Category]
- [ ] **Task Name**
    - [ ] Subtask
`;

    fs.writeFileSync(filePath, content);
    console.log(`\n✅ Created new task list: .AI/tasks/${fileName}\n`);
}

function addRule(args) {
    if (args.length === 0) {
        console.error("❌ Error: Rule text required.");
        return;
    }

    const ruleText = args.join(' ');

    // 1. Update persistent rules
    const fullConfig = getConfig();
    if (!fullConfig.config.rules) fullConfig.config.rules = [];

    fullConfig.config.rules.push(ruleText);
    saveConfig(fullConfig);
    console.log(`\n✅ Updated script template with new Rule #${fullConfig.config.rules.length}`);

    // 2. Update latest file if it exists for today
    const dateStr = getFormattedDate();
    let files = [];
    try {
        files = fs.readdirSync(TASKS_DIR);
    } catch (e) {
        return; // No files to update
    }

    const todayPattern = new RegExp(`TaskList_${dateStr}_(\\d+)\\.md`);
    let latestFile = null;
    let maxPart = 0;

    files.forEach(file => {
        const match = file.match(todayPattern);
        if (match) {
            const part = parseInt(match[1], 10);
            if (part > maxPart) {
                maxPart = part;
                latestFile = file;
            }
        }
    });

    if (latestFile) {
        const filePath = path.join(TASKS_DIR, latestFile);
        let content = fs.readFileSync(filePath, 'utf8');

        // Insert rule into current file
        // Look for ## Rules block
        const rulesHeaderRegex = /(## Rules[\s\S]*?)(\n## |$)/;
        const match = content.match(rulesHeaderRegex);

        if (match) {
            // Append rule to the captured group 1 (the Rules section)
            // Ensure distinct line
            const existingRulesSection = match[1].replace(/\n+$/, '');
            const newRuleLine = `    ${fullConfig.config.rules.length}. ${ruleText}`;

            const newSection = `${existingRulesSection}\n${newRuleLine}\n\n`;

            content = content.replace(match[0], newSection + (match[2] || ''));
            fs.writeFileSync(filePath, content);
            console.log(`✅ Added Rule #${fullConfig.config.rules.length} to .AI/tasks/${latestFile}\n`);
        } else {
            console.log(`⚠️  Could not find '## Rules' section in ${latestFile}. Skipped live update.\n`);
        }
    }
}

// Helper to format dates
function formatDate(date, formatString) {
    const pad = (n) => String(n).padStart(2, '0');
    const replacements = {
        'YYYY': date.getFullYear(),
        'MM': pad(date.getMonth() + 1),
        'DD': pad(date.getDate()),
        'HH': pad(date.getHours()),
        'mm': pad(date.getMinutes()),
        'ss': pad(date.getSeconds())
    };

    let result = formatString;
    for (const [key, value] of Object.entries(replacements)) {
        result = result.replace(key, value);
    }
    return result;
}

function addTask(args) {
    if (args.length === 0) {
        console.error("❌ Error: Task description required.");
        return;
    }

    const fullConfig = getConfig();
    const config = fullConfig.config;

    // Parse Args
    // args[0]: Tasks string
    // args[1]: Collection
    // args[2]: Priority (optional)
    // args[3]: Status (optional)

    const tasksInput = args[0];
    const collectionArg = args[1];
    const priorityArg = args[2];
    const statusArg = args[3];
    const descriptionArg = args[4];

    const delimiter = config.cliDelimiter || "|";

    // Split tasks based on config delimiter
    const taskTitles = tasksInput.split(delimiter).map(t => t.trim()).filter(t => t.length > 0);

    const tasks = taskTitles.map(title => new Task({
        title: title,
        description: descriptionArg,
        collection: collectionArg || config.defaultCollection,
        priority: priorityArg || config.defaultPriority,
        status: statusArg || config.defaultStatus
    }, config));

    // Resolve the collection name from the first task (source of truth is the Task object)
    const effectiveCollection = tasks.length > 0 ? tasks[0].collection : (collectionArg || config.defaultCollection || "New Tasks");

    const dateStr = getFormattedDate();
    let files = [];
    try {
        files = fs.readdirSync(TASKS_DIR);
    } catch (e) {
        fs.mkdirSync(TASKS_DIR, { recursive: true });
        files = [];
    }

    const todayPattern = new RegExp(`TaskList_${dateStr}_(\\d+)\\.md`);
    let latestFile = null;
    let maxPart = 0;

    const findLatest = () => {
        latestFile = null;
        maxPart = 0;
        files.forEach(file => {
            const match = file.match(todayPattern);
            if (match) {
                const part = parseInt(match[1], 10);
                if (part > maxPart) {
                    maxPart = part;
                    latestFile = file;
                }
            }
        });
    }

    findLatest();

    if (!latestFile) {
        console.log("ℹ️  No TaskList found for today. Creating one...");
        createTaskList();
        files = fs.readdirSync(TASKS_DIR);
        findLatest();
    }

    if (!latestFile) {
        console.error("❌ Error: Failed to create/find TaskList.");
        return;
    }

    const filePath = path.join(TASKS_DIR, latestFile);
    const fileDelimiter = config.fileAppendedDelimiter || "\n";

    let appendContent = `\n### [${effectiveCollection}]${fileDelimiter}`;

    // Convert all tasks to markdown
    const taskMarkdownList = tasks.map(t => t.toMarkdown());
    appendContent += taskMarkdownList.join(fileDelimiter);

    // Timestamp
    if (config.includeTimestamp) {
        const timestampFormat = config.timestampFormat || "YYYY-MM-DD HH:mm:ss";
        const formattedTime = formatDate(new Date(), timestampFormat);
        appendContent += `${fileDelimiter}${fileDelimiter}<!-- Added: ${formattedTime} -->${fileDelimiter}`;
    } else {
        appendContent += fileDelimiter;
    }

    try {
        fs.appendFileSync(filePath, appendContent);
        console.log(`\n✅ Added ${tasks.length} task(s) to [${effectiveCollection}] in .AI/tasks/${latestFile}\n`);
    } catch (e) {
        console.error("Error appending task:", e);
    }
}

const args = process.argv.slice(2);
const command = args[0];
const commandArgs = args.slice(1);

if (command === '--new' || command === 'create') {
    createTaskList();
} else if (command === 'add') {
    addTask(commandArgs);
} else if (command === 'addRule' || command === 'rule') {
    addRule(commandArgs);
} else {
    console.log('\nUsage: npm run task <command> [args]');
    console.log('       npm run task --new   (Create new list)');
    console.log('\nCommands:');
    console.log('  --new, create                Create a new TaskList markdown file in .AI/tasks/');
    console.log('  add "Titles" [Collection] [Priority] [Status] [Desc]   Add new tasks.');
    console.log('                                                Use configured delimiter to separate multiple tasks.');
    console.log('  rule "New Rule Text"         Add a new rule to the template and latest file.\n');
}
