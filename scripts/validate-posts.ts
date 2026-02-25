
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

const postsDirectory = 'D:\\Antigravity\\Jackypotato\\potatoblog\\posts\\learning';

const files = fs.readdirSync(postsDirectory).filter(f => f.endsWith('.md'));
let missingCount = 0;

files.forEach(file => {
    const fullPath = path.join(postsDirectory, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(content);
    if (!data.title) {
        console.log(`❌ Missing title: ${file}`);
        missingCount++;
    }
});

console.log(`Total checked: ${files.length}, Missing title: ${missingCount}`);
