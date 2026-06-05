import bcrypt from "bcrypt";

const hash = await bcrypt.hash("Admin123!", 10);
console.log(hash);