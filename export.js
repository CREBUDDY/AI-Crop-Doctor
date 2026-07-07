const fs = require('fs');
const path = require('path');

const TRANSCRIPT_PATH = 'C:\\Users\\Satyam\\.gemini\\antigravity\\brain\\434c976e-7b34-4932-ab3a-67c424659251\\.system_generated\\logs\\transcript.jsonl';
const PROJECT_DIR = 'c:\\Users\\Satyam\\Desktop\\AI CROP DOCTOR\\frontend\\src';
const OUTPUT_FILE = 'c:\\Users\\Satyam\\Desktop\\AI CROP DOCTOR\\Project_Documentation.md';

let markdown = `# AI Crop Doctor - Project Documentation & Conversation History\n\n`;

// 1. Read Conversation
markdown += `## 💬 Conversation History\n\n`;
if (fs.existsSync(TRANSCRIPT_PATH)) {
  const lines = fs.readFileSync(TRANSCRIPT_PATH, 'utf-8').split('\n').filter(Boolean);
  
  for (const line of lines) {
    try {
      const data = JSON.parse(line);
      if (data.type === 'USER_INPUT' && data.content) {
        // Extract content between <USER_REQUEST> tags if present
        let msg = data.content;
        const match = msg.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
        if (match) msg = match[1].trim();
        markdown += `**User:** ${msg}\n\n`;
      } else if (data.type === 'PLANNER_RESPONSE' && data.content) {
        markdown += `**AI:** ${data.content}\n\n`;
      }
    } catch (e) {
      // ignore parse errors
    }
  }
} else {
  markdown += `*Transcript file not found.*\n\n`;
}

markdown += `\n---\n\n## 📂 Project Source Code\n\n`;

// 2. Read Source Code recursively
function readFilesRecursively(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      readFilesRecursively(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css') || fullPath.endsWith('.json'))) {
      const relativePath = path.relative('c:\\Users\\Satyam\\Desktop\\AI CROP DOCTOR', fullPath);
      const ext = path.extname(fullPath).substring(1);
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      markdown += `### \`${relativePath}\`\n`;
      markdown += '```' + (ext === 'tsx' || ext === 'ts' ? 'typescript' : ext) + '\n';
      markdown += content + '\n';
      markdown += '```\n\n';
    }
  }
}

try {
  readFilesRecursively(PROJECT_DIR);
} catch (err) {
  console.error(err);
}

fs.writeFileSync(OUTPUT_FILE, markdown);
console.log('Successfully generated Project_Documentation.md');
