import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'backEnd/api_output_v3.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let totalMembers = 0;
data.data.forEach(j => {
    console.log(`${j.name}: ${j.members.length} members`);
    totalMembers += j.members.length;
});
console.log('Total Members:', totalMembers);
