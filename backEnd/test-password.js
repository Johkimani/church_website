import bcrypt from "bcrypt";

const password = "Admin123!";
const hash = "$2b$10$9KRG6O.aIP93jWtDYRizLO7CZ.0Ye0MCvrCtmlFNsVNp8KIA5lQSi";

const match = await bcrypt.compare(password, hash);

console.log("Match:", match);