const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\karee\\smsm_academy\\Client';

function stripJsComments(code) {
    // Regex matching strings (double, single, tick) OR comments (block, line)
    const regex = /("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`)|(\/\*[\s\S]*?\*\/|\/\/.*)/g;
    
    return code.replace(regex, (match, group1, group2) => {
        if (group1) return match; // It's a string, keep it
        return ""; // It's a comment, remove it
    });
}

function stripCssComments(code) {
    return code.replace(/\/\*[\s\S]*?\*\//g, '');
}

function stripHtmlComments(code) {
    return code.replace(/<!--[\s\S]*?-->/g, '');
}

function processFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    if (ext === '.js') {
        content = stripJsComments(content);
    } else if (ext === '.css') {
        content = stripCssComments(content);
    } else if (ext === '.html') {
        content = stripHtmlComments(content);
    }
    
    // Remove lines that became empty (optional but cleaner)
    // content = content.replace(/^\s*[\r\n]/gm, ''); 
    // Commented out to be safe and just remove comments as requested.

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Cleaned: ${filePath}`);
    }
}

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath);
        } else {
            if (['.js', '.css', '.html'].includes(path.extname(file).toLowerCase())) {
                processFile(filePath);
            }
        }
    });
}

try {
    walk(rootDir);
    console.log('Finished removing comments.');
} catch (err) {
    console.error('Error:', err);
}
