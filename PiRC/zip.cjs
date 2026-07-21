const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

const zip = new AdmZip();
const sourceDir = path.join(process.cwd(), 'divine_justice_repo');
const publicDir = path.join(process.cwd(), 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

zip.addLocalFolder(sourceDir);
zip.writeZip(path.join(publicDir, 'divine_justice.zip'));
console.log('Zip created in public/divine_justice.zip');
