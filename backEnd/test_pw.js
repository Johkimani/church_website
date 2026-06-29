const bcrypt = require('bcrypt');

const hashes = {
  'PA106/G/43243/23': '$2b$10$dOp6yr84tIoKSIBJfVUmaeQjBjzYyCvYNOUouEqFKjkVRk9HCx4QW',
  'PA106/G/12223/23': '$2b$10$TsoqtKG.Ae3oRvdhzp/9hegcrwqJfFQqppwqIq7atxpYTsT1JB8bS',
  'PAUL_ONSONGO': '$2b$10$9KRG6O.aIP93jWtDYRizLO7CZ.0Ye0MCvrCtmlFNsVNp8KIA5lQSi',
  'CS001/A/2024/01': '$2b$10$czK42r.ZLfKmNexJFOP.teVjKR.CxbbVvhIc7Gbku3VX.J0Z.m.vO'
};

const testPasswords = ['password123', 'Password123', 'admin123', 'Admin@123', 'test123', 'Test@123', 'sha123', 'kim123', 'jane123', 'Admin123!'];

async function test() {
  for (const [id, hash] of Object.entries(hashes)) {
    for (const pw of testPasswords) {
      const match = await bcrypt.compare(pw, hash);
      if (match) console.log('MATCH:', id, '->', pw);
    }
  }
  console.log('Done');
  process.exit();
}

test();