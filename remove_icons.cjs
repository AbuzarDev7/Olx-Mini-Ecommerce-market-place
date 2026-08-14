const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Remove font awesome tags
      content = content.replace(/<i\s+className=\".*?fa-solid.*?\"><\/i>\s*/g, '');
      content = content.replace(/<i\s+className=\".*?fa-solid.*?\"><\/i>/g, '');
      
      // Remove specific emojis that AI might have generated
      content = content.replace(/[⏳✅📷👁❤]/g, '');
      
      // Also remove favorite icon from ProductCard.jsx which uses regular
      content = content.replace(/className={\`favorite \${isFavorite \? 'fa-solid active' : 'fa-regular'}\`}/g, 'className=\"favorite\"');
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}
processDir('./src');
