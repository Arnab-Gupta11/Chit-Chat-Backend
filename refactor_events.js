const fs = require('fs');
const path = require('path');

const eventMap = {
  '"join_conversation"': 'SocketEvent.JOIN_CONVERSATION',
  '"leave_conversation"': 'SocketEvent.LEAVE_CONVERSATION',
  '"send_message"': 'SocketEvent.SEND_MESSAGE',
  '"new_message"': 'SocketEvent.NEW_MESSAGE',
  '"user_online"': 'SocketEvent.USER_ONLINE',
  '"user_offline"': 'SocketEvent.USER_OFFLINE',
  '"typing_start"': 'SocketEvent.TYPING_START',
  '"typing_stop"': 'SocketEvent.TYPING_STOP',
  '"typing"': 'SocketEvent.TYPING',
  '"message_delivered"': 'SocketEvent.MESSAGE_DELIVERED',
  '"message_read"': 'SocketEvent.MESSAGE_READ',
  '"edit_message"': 'SocketEvent.EDIT_MESSAGE',
  '"delete_message"': 'SocketEvent.DELETE_MESSAGE',
  '"toggle_reaction"': 'SocketEvent.TOGGLE_REACTION',
  '"sync_message"': 'SocketEvent.SYNC_MESSAGE'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  let needsImport = false;
  
  for (const [str, enumVal] of Object.entries(eventMap)) {
    if (content.includes(str)) {
      content = content.replaceAll(str, enumVal);
      needsImport = true;
    }
  }

  if (needsImport) {
    // Add import statement at the top if not exists
    if (!content.includes('SocketEvent')) {
      const relPath = path.relative(path.dirname(filePath), path.join(__dirname, 'src/constants/socketEvents')).replace(/\\/g, '/');
      const importStmt = `import { SocketEvent } from "${relPath}";\n`;
      content = importStmt + content;
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

traverse(path.join(__dirname, 'src/socket'));
console.log('Done backend refactoring');
