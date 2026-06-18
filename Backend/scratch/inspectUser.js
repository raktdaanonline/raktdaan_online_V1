import bcrypt from "bcrypt";

const hash = "$2b$10$woTUUTcZWlpV5cFEAyJz1.novQlI/UaCLhb6tTF93ScTOz2TAVyzy";
const isMatch = await bcrypt.compare("Rutuja123", hash);
console.log("Is match:", isMatch);
process.exit(0);


